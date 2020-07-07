import {
    Sequelize,
    Model,
    DataTypes,
    ModelAttributes,
} from "sequelize";

interface CampaignJobHistoryAttributes {
    id?: number;
    campaign_id: number;
    status: number;
    ran_at: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CampaignJobHistory extends Model<CampaignJobHistoryAttributes>
    implements CampaignJobHistoryAttributes {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public campaign_id!: number;
    public status!: number
    public ran_at!: Date
    public metadata!: string
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    campaign_id: { type: DataTypes.INTEGER, allowNull: false },
    ran_at: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.INTEGER, allowNull: false }

};

export function initCampaignJobHistory(sequelize: Sequelize): typeof CampaignJobHistory {
    CampaignJobHistory.init(attributes, {
        sequelize,
        tableName: "CampaignJobHistories",
    })
    return CampaignJobHistory
}
