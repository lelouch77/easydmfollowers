import { Op } from 'sequelize';
import db from '../models/index';
import { CampaignAttributes } from '../models/campaign';
import { getSegments } from './segments';
import { CAMPAIGN_STATUS, MAX_QUERY_LIMIT_RAW, MAX_QUERY_LIMIT, CAMPAIGN_MESSAGE_STATUS } from '../constants';
import { findAllPaginatedUsersRaw } from './users';
import { processFilters } from '../utils/common';
import { PaginationOptions, CampaignUpdateAttributes, CampaignCreateAttribute, CampaignUserPaginationOptions } from '../types';
import { User } from '../models/user';
import { any } from 'bluebird';

export const getCampaign = async (id: number) => {
    return await db.Campaign.findByPk(id);
}
export const getCampaignStatus = async (where: any) => {
    if (where && where.id) {
        where.campaign_id = where.id;
        delete where.id;
    }
    return await db.CampaignUser.findAll({
        group: ['status'],
        attributes: ['status', [db.Sequelize.fn('COUNT', 'id'), 'status_count']],
        where
    });
}

export const updateCampaign = async (id: number, properties: CampaignUpdateAttributes) => {
    const campaign = await db.Campaign.findByPk(id);
    if (!campaign) return null;
    campaign.update(properties);
    return await campaign.save();
}
export const deleteCampaign = async (campaign_id: number) => {
    const campaign = await db.Campaign.findByPk(campaign_id);
    if (!campaign) return null;
    await db.CampaignUser.destroy({
        where: { campaign_id }
    })
    await db.CampaignJobHistory.destroy({
        where: { campaign_id }
    });
    return await campaign.destroy();
}

export const getAllActiveCampaign = async () => {
    return await db.Campaign.findAll({ where: { status: CAMPAIGN_STATUS.SCHEDULED } });
}

export const getAllCampaigns = async (params: any) => {
    return await db.Campaign.findAll(params);
}

export const createCampaign = async ({ name, message, allocated_msg_count, description, segmentIds = [], order, scheduled_time }: CampaignCreateAttribute) => {

    let where: any = {};
    const metadata: any = { order }
    if (segmentIds.length !== 0) {
        const lists = await getSegments(segmentIds);
        where[Op.or] = [];
        metadata.segments = [];
        lists.forEach(list => {
            where[Op.or].push(processFilters(list.get("filters")));
            metadata.segments.push(list.toJSON());
        });
    }
    const campaign = await db.Campaign.create({
        name,
        message,
        allocated_msg_count,
        description,
        scheduled_time,
        metadata,
        status: CAMPAIGN_STATUS.SCHEDULED
    });

    let offset = 0;
    let users: User[];
    do {
        users = await findAllPaginatedUsersRaw({ offset, where, order });
        await campaign.addUsers(users);
        offset = offset + MAX_QUERY_LIMIT_RAW
    } while (users.length >= MAX_QUERY_LIMIT_RAW);
    return campaign;
}


export const getCampaignUserPaginated = async ({ id, limit, offset, order }: CampaignUserPaginationOptions) => {
    if (!limit || limit > MAX_QUERY_LIMIT) {
        limit = MAX_QUERY_LIMIT;
    }
    return await db.CampaignUser.findAndCountAll({
        where: {
            campaign_id: id
        },
        offset,
        limit,
        order: (<any>order),
        include: [{
            model: db.User,
        }]
    })
}

export const getCampaignScheduledUsers = async ({ id, limit }: { id: number, limit: number }) => {
    return await db.CampaignUser.findAll({
        where: {
            campaign_id: id,
            status: CAMPAIGN_MESSAGE_STATUS.SCHEDULED
        },
        limit
    })
}

export const deleteAllCampaigns = async () => {
    await db.CampaignUser.destroy({
        where: {},
        truncate: true
    });
    await db.CampaignJobHistory.destroy({
        where: {},
        truncate: true
    });
    await db.Campaign.destroy({
        where: {},
        truncate: true
    });
    return true;
}