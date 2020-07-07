import { initDB } from './models'
import TwitterAdapter from './services/twitter_adapter';
import CampaignAdapter from './services/campaign_adapter';
import EXPORTED_METHOD_NAMES from './export.details';
import { getCampaignUserPaginated, getAllCampaigns, getCampaign, deleteAllCampaigns, getCampaignStatus } from './services/campaign';
import { findUsersCount, findAllPaginatedUsers, deleteAllUsers } from './services/users';
import { createSegment, updateSegment, getAllSegments, getSegment, deleteAllSegments, deleteSegment } from './services/segments';
import { deleteAllVariables } from './services/state_variables';
import { CAMPAIGN_MESSAGE_STATUS } from './constants';
import { stillNowTimeFilter, processFilters } from './utils/common';
import { TwitterKeys, UserPaginationOptions, PaginatedUserResult, SegmentUpdateAttributes, CampaignCreateAttribute, CampaignUpdateAttributes, CampaignUserPaginationOptions, CampaignUserPaginationResult } from './types';
import { UserAttributes } from './models/user';
import { SegmentAttributes } from './models/segment';
import { CampaignAttributes } from './models/campaign';

class EasyDMCore {
    private twitterAdapter: TwitterAdapter;
    private campaignAdapter: CampaignAdapter;
    constructor(connectionString: string, notifier = () => { }) {
        initDB(connectionString);
        this.twitterAdapter = new TwitterAdapter(notifier);
        this.campaignAdapter = new CampaignAdapter(this.twitterAdapter, notifier);
    }

    // --- Twitter Adapter --- //
    async getUserObject() {
        return await this.twitterAdapter.getUserObject();
    }

    async setKeys(twitterKey: TwitterKeys) {
        return await this.twitterAdapter.verifyAndSetTwitterKeys(twitterKey);
    }

    //---- Followers ---- //

    async getPaginatedFollowers(params: UserPaginationOptions): Promise<PaginatedUserResult> {
        const result = (await findAllPaginatedUsers(params));
        return {
            rows: <UserAttributes[]>result.rows.map(user => user.toJSON()),
            count: result.count
        };
    }

    async getFollowersCount(where = {}): Promise<number> {
        return await findUsersCount(where)
    }


    //---- Segments ---- //

    async createSegment({ name, description, filters }: SegmentAttributes): Promise<SegmentAttributes> {
        return <SegmentAttributes>(await createSegment({ name, description, filters })).toJSON();
    }

    async updateSegment(id: number, properties: SegmentUpdateAttributes): Promise<SegmentAttributes | null> {
        const result = await updateSegment(id, properties);
        return result ? <SegmentAttributes>result.toJSON() : null;
    }

    async getSegments() {
        const segments = (await getAllSegments());

        let result = [];
        for (let segment of segments) {
            const segmentJSON = segment.toJSON();
            result.push({
                ...segmentJSON,
                count: await findUsersCount({ where: processFilters(segment.get("filters")) })
            });
        }

        return result;
    }

    async getSegment(id: number): Promise<SegmentAttributes | null> {
        const segment = await getSegment(id);
        return segment ? <SegmentAttributes>segment.toJSON() : null;
    }

    async deleteSegment(id: number): Promise<void | null> {
        return await deleteSegment(id);
    }
    //---- DM ---- //

    async sendDM({ recipients, text }: { recipients: string, text: string }): Promise<void> {
        let users = await this.twitterAdapter.lookUpUsers(recipients)
        for (let user of users) {
            await this.twitterAdapter.sendDM({ user, message: text })
        }
    }

    // --- Campaign ---//
    async createCampaign(params: CampaignCreateAttribute) {
        return <CampaignAttributes>((await this.campaignAdapter.createCampaign(params)).toJSON());
    }

    async updateCampaign(id: number, properties: CampaignUpdateAttributes): Promise<CampaignAttributes | null> {
        const campaign = await this.campaignAdapter.updateCampaign(id, properties);
        return campaign ? <CampaignAttributes>campaign.toJSON() : null
    }

    async deleteCampaign(id: number): Promise<void | null> {
        return await this.campaignAdapter.deleteCampaign(id);
    }

    async getAllCampaigns(params: any): Promise<CampaignAttributes[]> {
        return (await getAllCampaigns(params)).map(campaign => <CampaignAttributes>campaign.toJSON());
    }

    async getCampaign(id: number): Promise<CampaignAttributes | null> {
        const campaign = await getCampaign(id);
        return campaign ? <CampaignAttributes>campaign.toJSON() : null
    }

    async getCampaignStatus(where: any) {
        const map = (await getCampaignStatus(where)).reduce((map, record) => {
            const status = record.get("status");
            const count = <number>record.get("status_count");
            map.TOTAL = map.TOTAL + count;
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
            FAILED: 0,
            TOTAL: 0
        });
        return map;
    }

    async messagesSentToday() {
        const res = await getCampaignStatus({ UpdatedAt: stillNowTimeFilter(), status: CAMPAIGN_MESSAGE_STATUS.SEND });
        if (!res[0]) {
            return 0;
        }
        return <number>res[0].get("status_count");
    }



    async getCampaignUserPaginated(params: CampaignUserPaginationOptions): Promise<CampaignUserPaginationResult> {
        const result = await getCampaignUserPaginated(params);
        return {
            rows: <any[]>result.rows.map((campaignUser => {
                const campaignUserJSON: any = campaignUser.toJSON();
                const user = campaignUserJSON.User;
                delete campaignUserJSON.User
                return {
                    ...user,
                    ...campaignUser
                }
            })),
            count: result.count
        }
    }

    async getAllMissedCampaigns(): Promise<CampaignAttributes[]> {
        return (await this.campaignAdapter.getAllMissedCampaigns()).map(campaign => <CampaignAttributes>campaign.toJSON());
    }

    async reset() {
        this.campaignAdapter.reset();
        await deleteAllCampaigns();
        await deleteAllSegments();
        await deleteAllUsers();
        await deleteAllVariables();
        this.twitterAdapter.reset();
    }
}
export const EXPORTED_METHODS = EXPORTED_METHOD_NAMES;
export default EasyDMCore;
