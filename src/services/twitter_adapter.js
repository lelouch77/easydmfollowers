import Twitter from 'twitter-lite';
import { setVariables, getVariables } from './state_variables';
import { getActiveJob, scheduleNewJob, closeActiveJob } from './follower-job';
import { scheduleCron } from './cron-service';
import { bulkCreate, findUnSyncedUsers } from './user';
import { TWITTER_CLIENT_STATE, FOLLOWER_SYNC_STATUS } from '../constants';
import logger from '../utils/logger';
class TwitterAdapter {

    constructor() {
    }

    async initTwitterClient() {
        const twitterKeys = await TwitterAdapter.getTwitterKeys();
        if (!twitterKeys) {
            logger.info("TwitterAdapter -> initTwitterClient -> NoTwitterKeys");
            this.clientState = TWITTER_CLIENT_STATE.NOT_INITIALIZED;
        }
        this.client = new Twitter({
            subdomain: "api", // "api" is the default (change for other subdomains)
            version: "1.1", // version "1.1" is the default (change for other subdomains)
            ...twitterKeys
        });
        logger.info("Twitter client initialized");
        this.clientState = TWITTER_CLIENT_STATE.INITIALIZED;
        this.populatingFollowers = false;
    }

    static setTwitterKeys = async ({ consumer_key, consumer_secret, access_token_key, access_token_secret }) => {
        const client = new Twitter({
            subdomain: "api", // "api" is the default (change for other subdomains)
            version: "1.1", // version "1.1" is the default (change for other subdomains)
            consumer_key,
            consumer_secret,
            access_token_key,
            access_token_secret
        });

        try {
            const authResponse = await client.get("account/verify_credentials");
            logger.info("TwitterAdapter -> setTwitterKeys -> Credentials Verified");
            
            await setVariables([
                { property: "consumer_key", value: consumer_key },
                { property: "consumer_secret", value: consumer_secret },
                { property: "access_token_key", value: access_token_key },
                { property: "access_token_secret", value: access_token_secret }
            ]);

            return authResponse;

        }catch(e){
            logger.info("TwitterAdapter -> setTwitterKeys -> Credentials Failed");
            return false;
        }
    }

    static getTwitterKeys = async () => {
        return await getVariables(["consumer_key", "consumer_secret", "access_token_key", "access_token_secret"]);
    }

    syncFollowersToDb = async (cursor) => {
        let scheduled;
        try {

            logger.info("TwitterAdapter -> syncFollowersToDb -> cursor", cursor);
            const followers = await this.client.get("followers/ids", {
                cursor,
                count: 5000,
                //screen_name: "balajis",
                stringify_ids: true
            });

            cursor = followers.next_cursor_str;
            const rateLimit = followers._headers.get('x-rate-limit-remaining');
            // Add Job Id to user detail

            let followerIds = [];

            followers.ids.forEach(followerId => {
                followerIds.push({
                    id_str: followerId,
                    status: FOLLOWER_SYNC_STATUS.NOT_SYNCED
                });
            });

            await bulkCreate(followerIds);
            this.populateFollowersData();

            logger.info("TwitterAdapter -> syncFollowersToDb -> rateLimit", rateLimit);
            logger.info("TwitterAdapter -> syncFollowersToDb -> followersCount", followers.ids.length);

            if (cursor === "0") {
                logger.info("TwitterAdapter -> syncFollowersToDb -> job done");
                let activeJob = await getActiveJob();
                if (activeJob)
                    await closeActiveJob(activeJob);
                return;
            }
            if (rateLimit > 0) {
                
                this.syncFollowersToDb(cursor);
                return;
            }
            scheduled = new Date(followers._headers.get('x-rate-limit-reset') * 1000);



        }
        catch (e) {
            logger.info("TwitterAdapter -> syncFollowersToDb -> errors", e.errors[0].code);
            if (e.errors[0].code !== 88) { return; }
            scheduled = new Date(e._headers.get('x-rate-limit-reset') * 1000);
        }
        logger.info("TwitterAdapter -> syncFollowersToDb -> scheduleNewJob -> limitReset", scheduled);
        await scheduleNewJob({ cursor, scheduled });
        const job = this.getSyncJob(cursor);
        this.activeCron = scheduleCron(scheduled, job);
    }


    populateFollowersData = async () => {

        if( ! this.populatingFollowers ){

            this.populatingFollowers = true;

            let unSyncedFollowerIds = (await findUnSyncedUsers()).map(user => user.get("id_str"));

            while (unSyncedFollowerIds.length > 0) {
                let syncedUsers = [];
                try {
                    let users = await this.client.post("users/lookup", {
                        user_id: unSyncedFollowerIds.join(",")
                    });

                    users.forEach(user => {
                        syncedUsers.push({
                            ...user,
                            status: FOLLOWER_SYNC_STATUS.SYNCED
                        });
                    });

                    await bulkCreate(syncedUsers);
                    unSyncedFollowerIds = (await findUnSyncedUsers()).map(user => user.get("id_str"));

                } catch (e) {
                    logger.info("TwitterAdapter -> syncFollowersToDb -> findUnSyncedUsers -> errors", e);

                    if (e.errors[0].code == 17) {
                        let followerIds = [];

                        unSyncedFollowerIds.forEach(followerId => {
                            followerIds.push({
                                id_str: followerId,
                                status: FOLLOWER_SYNC_STATUS.FAILED
                            });
                        });

                        await bulkCreate(followerIds);

                    }

                    unSyncedFollowerIds = (await findUnSyncedUsers()).map(user => user.get("id_str"));
                }
            }

            this.populatingFollowers = false;
        }
    }

    getSyncJob = () => {
        return async () => {
            let activeJob = await getActiveJob();
            const scheduled = activeJob.get("scheduled");
            const cursor = activeJob.get("cursor");
            if (scheduled > new Date()) {
                logger.info("getSyncJob -> scheduledTime", scheduled);
                const syncJob = this.getSyncJob();
                this.activeCron = scheduleCron(scheduled, syncJob);
            }
            else {
                this.syncFollowersToDb(cursor);
            }
        }
    }

    initSynFollowersCron = async (force = false) => {
        let activeJob = await getActiveJob();
        if (!activeJob && !force) { // This is the case when app is reopened and sync is already completed
            logger.info("TwitterAdapter -> initSynFollowersCron -> no activeJob, no force");
            return;
        }
        if (!activeJob)
            await scheduleNewJob({ cursor: -1, scheduled: new Date() })
        const syncJob = this.getSyncJob();
        syncJob();
    }

    //Called 3 scenarios
    // 1. First time setup syncFollower(true)
    // 2. Reopening syncFollower(false)
    syncFollowers = async (force) => {
        if (this.activeCron) {
            return;
        }
        logger.info("TwitterAdapter -> syncFollower -> initSynFollowersCron");
        await this.initSynFollowersCron(force);
    }
}

export default TwitterAdapter;