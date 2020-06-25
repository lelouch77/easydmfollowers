import db from '../models';
import { FOLLOWER_SYNC_STATUS, MAX_USERS_LOOKUP_LIMIT } from '../constants';

export const add = async (userObject) => {
    const result = await db.User.create({
        ...userObject,
    });
    return result.get("id_str");
}

export const bulkCreate = async (users ) => {
    return await db.User.bulkCreate(users, { updateOnDuplicate: ["screen_name", "name", "location", "followers_count", "friends_count", "statuses_count", "verified", "protected", "description", "listed_count", "favourites_count", "statuses_count", "default_profile", "default_profile_image", "status"] });
}

export const findAllPaginatedUsers = async ({where, order, limit, offset}) => {
    return await db.User.findAll({
        limit,
        offset,
        where,
        order
    });
}

export const findAllUsers = async ({where}) => {
    return await db.User.findAll({
        where
    });
}

export const findUnSyncedUsers = async () => {
    return await db.User.findAll({
        where:{
            status: FOLLOWER_SYNC_STATUS.NOT_SYNCED,
        },
        limit: MAX_USERS_LOOKUP_LIMIT
    });
}