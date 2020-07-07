import Twitter from 'twitter-lite';
import { setVariables, getVariables, getVariable } from './state_variables';
import { getActiveJob, scheduleNewJob, closeActiveJob } from './follower-job';
import { scheduleCron } from './cron-service';
import { bulkCreate, findUnSyncedUsers, findUser, findUsersCount } from './user';
import { TWITTER_CLIENT_STATE, FOLLOWER_SYNC_STATUS, SEND_MESSAGE_ENABLED } from '../constants';
import logger from '../utils/logger';
class TwitterAdapter {

    constructor(notifier) {
        this.clientState = TWITTER_CLIENT_STATE.NOT_INITIALIZED;
        this.isSyncingFollowersDetail = false;
        this.totalFollowersSynced = 0;
        this.notifier = notifier;
    }

    verifyAndSetTwitterKeys = async ({ consumer_key, consumer_secret, access_token_key, access_token_secret }, reset) => {
        try {
            const client = new Twitter({
                subdomain: "api", // "api" is the default (change for other subdomains)
                version: "1.1", // version "1.1" is the default (change for other subdomains)
                consumer_key,
                consumer_secret,
                access_token_key,
                access_token_secret
            });
            const authResponse = (await client.get("account/verify_credentials"));
            logger.info("TwitterAdapter -> setTwitterKeys -> Credentials Verified");
            const existingUserID = await getVariable("id_str");
            if (existingUserID && existingUserID !== authResponse.id_str) {
                logger.info("New user key found resetting all tables");
                await reset();
            }
            await setVariables([
                { property: "consumer_key", value: consumer_key },
                { property: "consumer_secret", value: consumer_secret },
                { property: "access_token_key", value: access_token_key },
                { property: "access_token_secret", value: access_token_secret },
                { property: "id_str", value: authResponse.id_str },
                { property: "screen_name", value: authResponse.screen_name },
                { property: "name", value: authResponse.name },
                { property: "profile_image_url_https", value: authResponse.profile_image_url_https },
                { property: "followers_count", value: authResponse.followers_count },
                { property: "friends_count", value: authResponse.friends_count },
                { property: "verified", value: authResponse.verified },
                { property: "statuses_count", value: authResponse.statuses_count }
            ]);
            this.client = client;
            this.clientState = TWITTER_CLIENT_STATE.INITIALIZED;
            const isUserExist = await findUser();
            if (!isUserExist) {
                logger.info("No user found -> Force Sync Initialized");
                this.syncFollowers(true);
            }
            else {
                logger.info("Users found -> Restoring existing sync jobs");
                this.syncFollowers();
            }
            return {
                consumer_key,
                consumer_secret,
                access_token_key,
                access_token_secret,
                id_str: authResponse.id_str,
                screen_name: authResponse.screen_name,
                name: authResponse.name,
                profile_image_url_https: authResponse.profile_image_url_https,
                followers_count: authResponse.followers_count,
                verified: authResponse.verified,
                friends_count: authResponse.friends_count,
                statuses_count: authResponse.statuses_count
            };

        } catch (e) {
            logger.info("TwitterAdapter -> setTwitterKeys -> Error", e)
            this.client = null;
            this.clientState = TWITTER_CLIENT_STATE.TOKEN_FAILED;
            logger.info("TwitterAdapter -> setTwitterKeys -> Credentials Failed");
            return { error: 3 }
        }
    }

    getUserObject = async () => {
        const twitterKeys = await getVariables(["consumer_key", "consumer_secret", "access_token_key", "access_token_secret"]);
        if (!twitterKeys.access_token_secret) {
            logger.info("No twitter key found");
            this.clientState = TWITTER_CLIENT_STATE.NOT_INITIALIZED;
            return { error: 1 };
        }
        return await this.verifyAndSetTwitterKeys(twitterKeys);
    }

    syncFollowersId = async (cursor) => {
        let scheduled;
        try {
            logger.info("TwitterAdapter -> syncFollowersId -> cursor", cursor);
            const followers = await this.client.get("followers/ids", {
                cursor,
                count: 5000,
                stringify_ids: true
            });

            cursor = followers.next_cursor_str;
            const rateLimit = followers._headers.get('x-rate-limit-remaining');
            const followerIds = followers.ids.map(followerId => {
                return {
                    id_str: followerId,
                    status: FOLLOWER_SYNC_STATUS.NOT_SYNCED
                }
            });
            await bulkCreate(followerIds);
            this.syncFollowersDetail();
            logger.info("TwitterAdapter -> syncFollowersId -> rateLimit", rateLimit);
            logger.info("TwitterAdapter -> syncFollowersId -> followersCount", followerIds.length);
            if (cursor === "0") {
                logger.info("TwitterAdapter -> syncFollowersId -> job done");
                let activeJob = await getActiveJob();
                if (activeJob)
                    await closeActiveJob(activeJob);
                return;
            }
            if (rateLimit > 0) {
                this.syncFollowersId(cursor);
                return;
            }
            scheduled = new Date(followers._headers.get('x-rate-limit-reset') * 1000);
        }
        catch (e) {
            // logger.info("TwitterAdapter -> syncFollowersId -> errors", e.errors[0].code);
            if (e.errors && e.errors[0].code !== 88) { return; }
            scheduled = new Date((parseInt(e._headers.get('x-rate-limit-reset')) + 45) * 1000);
        }
        logger.info("TwitterAdapter -> syncFollowersId -> scheduleNewJob -> limitReset", scheduled);
        await scheduleNewJob({ cursor, scheduled });
        const job = this.getSyncJob(cursor);
        this.activeCron = scheduleCron(scheduled, job);
    }

    reset = () => {
        if (this.activeCron) {
            clearTimeout(this.activeCron);
        }
        this.client = null;
    }
    syncFollowersDetail = async () => {
        if (!this.isSyncingFollowersDetail) {
            this.isSyncingFollowersDetail = true;
            let unSyncedFollowerIds = (await findUnSyncedUsers()).map(user => user.get("id_str"));
            logger.info("syncFollowersDetail -> unSyncedFollowerIds -> first", unSyncedFollowerIds.length);
            logger.info("syncFollowersDetail -> isSyncingFollowersDetail", this.isSyncingFollowersDetail);
            while (unSyncedFollowerIds.length > 0) {
                try {
                    let users = await this.client.post("users/lookup", {
                        user_id: unSyncedFollowerIds.join(",")
                    });
                    const syncedUsers = users.map(user => {
                        const userIndex = unSyncedFollowerIds.indexOf(user.id_str)
                        unSyncedFollowerIds.splice(userIndex, 1);
                        return {
                            ...user,
                            status: FOLLOWER_SYNC_STATUS.SYNCED
                        }
                    });
                    await bulkCreate(syncedUsers);

                    this.totalFollowersSynced += syncedUsers.length;
                    logger.info("syncFollowersDetail -> syncedUsers", syncedUsers.length);
                    logger.info("syncFollowersDetail -> totalFollowersSynced", this.totalFollowersSynced);
                } catch (e) {
                    logger.info("TwitterAdapter -> syncFollowersDetail -> errors", e);
                    if (e.errors[0].code === 88) {
                        scheduled = new Date((parseInt(e._headers.get('x-rate-limit-reset')) + 45) * 1000);
                        scheduleCron(scheduled, () => {
                            this.syncFollowersDetail();
                        });
                        break;
                    }
                }
                finally {
                    const failedUsers = unSyncedFollowerIds.map(followerId => {
                        return {
                            id_str: followerId,
                            status: FOLLOWER_SYNC_STATUS.FAILED
                        };
                    });
                    await bulkCreate(failedUsers);
                    unSyncedFollowerIds = (await findUnSyncedUsers()).map(user => user.get("id_str"));
                    logger.info("syncFollowersDetail -> unSyncedFollowerIds", unSyncedFollowerIds.length);
                }
            }
            const allUserCount = await findUsersCount();
            this.notifier({ title: "Followers Synced", body: `${allUserCount} followers loaded` });
            this.isSyncingFollowersDetail = false;
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
                this.syncFollowersId(cursor);
            }
        }
    }

    initSynFollowersCron = async (force = false) => {
        this.syncFollowersDetail();
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

    syncFollowers = async (force) => {
        if (this.activeCron) {
            return;
        }
        logger.info("TwitterAdapter -> syncFollower -> initSynFollowersCron");
        await this.initSynFollowersCron(force);
    }

    sendDM = async ({ user, text }) => {
        if (!SEND_MESSAGE_ENABLED) {
            logger.info("TwitterAdapter -> sendDM -> Message Sending disabled");
            return;
        }
        const type = "message_create";
        const recipient_id = user.id_str;
        const userName = user.name;
        text = text.replace(/\[user_name\]/g, userName);

        await this.client.post("direct_messages/events/new", {
            event: {
                type,
                message_create: {
                    target: {
                        recipient_id
                    },
                    message_data: {
                        text
                    }
                }
            }
        });
        logger.info("TwitterAdapter -> sendDM -> Message Sent");
    }
}

export default TwitterAdapter;