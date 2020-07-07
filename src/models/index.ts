import { Sequelize } from "sequelize";
import { initUser, User } from "./user";
import { initCampaign, Campaign } from "./campaign";
import { initCampaignJobHistory, CampaignJobHistory } from "./campaign_job_history";
import { initCampaignUser, CampaignUser } from "./campaign_user";
import { initFollowersJob, FollowersJob } from "./followers_job";
import { initSegment, Segment } from "./segment";
import { initStateVariable, StateVariable } from "./state_variable";

export interface IModels {
    User: typeof User
    Campaign: typeof Campaign
    CampaignJobHistory: typeof CampaignJobHistory
    CampaignUser: typeof CampaignUser
    FollowersJob: typeof FollowersJob
    Segment: typeof Segment
    StateVariable: typeof StateVariable
}

interface IDB extends IModels {
    sequelize: Sequelize,
    Sequelize: typeof Sequelize
}

let db: IDB = <any>{ Sequelize }

export const initDB = (sqliteLocation: string) => {
    const sequelize = new Sequelize({
        "dialect": "sqlite",
        "storage": sqliteLocation,
        logging: false
    });

    db.sequelize = sequelize;
    db.User = initUser(sequelize);
    db.CampaignUser = initCampaignUser(sequelize);
    db.CampaignJobHistory = initCampaignJobHistory(sequelize);
    db.Campaign = initCampaign(sequelize);
    db.FollowersJob = initFollowersJob(sequelize);
    db.Segment = initSegment(sequelize);
    db.StateVariable = initStateVariable(sequelize);

    Object.values(db).forEach((model: any) => {
        if (model.associate) {
            model.associate(db);
        }
    });
}

export default db;