import { initDB } from './models'
import TwitterAdapter from './services/twitter_adapter';
import CampaignAdapter from './services/campaign_adapter';
import { getCampaignUserPaginated, getAllCampaigns, getCampaign, deleteAllCampaigns, getCampaignStatus } from './services/campaign';
import { findAllUsers, findUsersCount, findAllPaginatedUsers, deleteAllUsers } from './services/user';
import { createList, updateList, getAllLists, getList, deleteList, deleteAllLists } from './services/list';
import { deleteAllVariables } from './services/state_variables';
import { CAMPAIGN_MESSAGE_STATUS } from './constants';
import { stillNowTimeFilter, processFilters } from './utils/common';

class EasyDMCore {
    constructor(connectionString, notifier = () => { }) {
        this.connectionString = connectionString;
        this.db = initDB(connectionString);
        this.twitterAdapter = new TwitterAdapter(notifier);
        this.TwitterAdapter = TwitterAdapter;
        this.campaignAdapter = new CampaignAdapter(this.twitterAdapter, notifier);
    }

    // --- Twitter Adapter --- //
    async getUserObject() {
        return await this.twitterAdapter.getUserObject();
    }

    async syncFollowers(force) {
        this.twitterAdapter.syncFollowers(force);
    }

    async setKeys(twitterKey) {
        return await this.twitterAdapter.verifyAndSetTwitterKeys(twitterKey, this.reset);
    }

    //---- Followers ---- //

    async getPaginatedFollowers(params) {
        const result = (await findAllPaginatedUsers(params));
        result.rows = result.rows.map(user => user.toJSON());
        return result;
    }

    async getFollowers(where = {}) {
        return (await findAllUsers(where)).map(user => user.toJSON());
    }

    async getFollowersCount(where = {}) {
        return await findUsersCount(where)
    }


    //---- Segments ---- //

    async createSegment({ name, description, filters }) {
        return (await createList({ name, description, filters })).toJSON();
    }

    async updateSegment(id, properties) {
        return (await updateList(id, properties)).toJSON();
    }

    async getSegments() {
        const lists = (await getAllLists());

        let segments = [];
        for (let list of lists) {
            list = list.toJSON();
            segments.push({
                ...list,
                count: await findUsersCount({ where: processFilters(list.filters) })
            });
        }

        return segments;
    }

    async getSegment(id) {
        return (await getList(id)).toJSON();
    }

    async deleteSegment(id) {
        return (await deleteList(id)).toJSON();
    }
    //---- DM ---- //

    async sendDM({ recipients, text }) {
        try {
            let users = await this.twitterAdapter.client.post("users/lookup", {
                screen_name: recipients
            });

            for (let user of users) {
                await this.twitterAdapter.sendDM({ user, text })
            }

            return true;
        } catch (e) {
            return false;
        }

    }

    // --- Campaign ---//
    async createCampaign(params) {
        return (await this.campaignAdapter.createCampaign(params)).toJSON();
    }

    async updateCampaign(id, properties) {
        return (await this.campaignAdapter.updateCampaign(id, properties)).toJSON();
    }

    async deleteCampaign(id) {
        return (await this.campaignAdapter.deleteCampaign(id)).toJSON();
    }

    async getAllCampaigns(params) {
        return (await getAllCampaigns(params)).map(campaign => campaign.toJSON());
    }

    async getCampaign(id) {
        return (await getCampaign(id)).toJSON();
    }

    async getCampaignStatus(where) {
        let total = 0
        const map = (await getCampaignStatus(where)).reduce((map, record) => {
            const status = record.get("status");
            const count = record.get("status_count");
            total = total + count;
            if (!status) {
                map.UNSEND = count;
            }
            else if (status === CAMPAIGN_MESSAGE_STATUS.SEND) {
                map.SENT = count
            }
            else if (status === CAMPAIGN_MESSAGE_STATUS.FAILED) {
                map.FAILED = count
            }
            return map;
        }, {
            UNSEND: 0,
            SENT: 0,
            FAILED: 0
        });
        map.TOTAL = total;
        return map;
    }

    async messagesSentToday() {
        const res = await getCampaignStatus({ UpdatedAt: stillNowTimeFilter(), status: CAMPAIGN_MESSAGE_STATUS.SEND });
        if (!res[0]) {
            return 0;
        }
        return res[0].get("status_count");
    }



    async getCampaignUserPaginated(params) {
        const result = await getCampaignUserPaginated(params);
        result.rows = result.rows.map((campaignUser => {
            campaignUser = campaignUser.toJSON();
            const user = campaignUser.User;
            delete campaignUser.User
            return {
                ...user,
                ...campaignUser
            }
        }));
        return result;

    }
    async getAllMissedCampaigns() {
        return (await this.campaignAdapter.getAllMissedCampaigns()).map(campaign => campaign.toJSON());
    }

    async reset() {
        this.campaignAdapter.reset();
        await deleteAllCampaigns();
        await deleteAllLists();
        await deleteAllUsers();
        await deleteAllVariables();
        this.twitterAdapter.reset();
    }
}

export default EasyDMCore;
