import { Op } from 'sequelize';
export const FOLLOWER_SYNC_STATUS = {
    NOT_SYNCED: 10,
    FAILED: 30,
    SYNCED: 40
}

export const CAMPAIGN_STATUS = {
    SCHEDULED: 10,
    PAUSED: 30,
    DONE: 40
}

export const JOB_STATUS = {
    SCHEDULED: 10,
    FAILED: 30,
    DONE: 40
}


export const CAMPAIGN_JOB_STATUS = {
    SUCCESS: 10,
    FAILED: 30,
    LIMIT_EXCEEDED: 50
}

export const CAMPAIGN_MESSAGE_STATUS = {
    SCHEDULED: null,
    FAILED: 30,
    SEND: 40
}

export const TWITTER_CLIENT_STATE = {
    NOT_INITIALIZED: 10,
    INITIALIZED: 20,
    TOKEN_FAILED: 30
}

export const MAX_QUERY_LIMIT = 100;
export const MAX_QUERY_LIMIT_RAW = 5000;
export const MAX_USERS_LOOKUP_LIMIT = 100;

// TBD Need update it using rate limit it api
export const DAILY_DM_LIMIT = 1000;

export const FILTER_OPERATOR_MAP = {
    EQ: Op.eq,
    OR: Op.or,
    AND: Op.and,
    GT: Op.gt,
    GTE: Op.gte,
    LT: Op.lt,
    LTE: Op.lte,
    CONTAINS: Op.substring
};

export const SEND_MESSAGE_ENABLED = true;