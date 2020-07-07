import { FILTER_OPERATOR_MAP } from "./constants";
import { UserAttributes } from "./models/user";
import { CampaignUserAttributes } from "./models/campaign_user";

export type FilterType = keyof typeof FILTER_OPERATOR_MAP;
export type FilterCondition = {
  id: string;
  value: string | number | boolean;
  operator: FilterType;
}

export type Filter = {
  filterType: FilterType;
  conditions: FilterCondition[];
}
export type PaginationOptions = {
  where?: any;
  order?: string[][];
  limit?: number;
  offset: number;
}

export type UserPaginationOptions = PaginationOptions & { segmentIds: number[] }

export type CampaignUserPaginationOptions = PaginationOptions & { id: number }

export type CampaignUserPaginationResult = {
  rows: (UserAttributes & CampaignUserAttributes)[];
  count: number;
}

export type PaginatedUserResult = {
  rows: UserAttributes[];
  count: number;
}
export type TwitterKeys = {
  consumer_key: string,
  consumer_secret: string,
  access_token_key: string,
  access_token_secret: string
}

export type CampaignUpdateAttributes = {
  name?: string;
  message?: string;
  description?: string;
  allocated_msg_count?: number;
  scheduled_time?: number;
  status?: number;
}

export type SegmentUpdateAttributes = {
  name?: string;
  description?: string;
  filters?: Filter;
}

export type CampaignCreateAttribute = {
  name: string;
  message: string;
  description: string;
  allocated_msg_count: number;
  scheduled_time: number;
  segmentIds: number[];
  order?: string[][];
}