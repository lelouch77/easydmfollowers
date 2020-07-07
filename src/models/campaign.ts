import {
    Sequelize,
    Model,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    ModelAttributes,
    BelongsToGetAssociationMixin,
    BelongsToCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
} from "sequelize";
import { User } from './user';
import { CampaignUser } from './campaign_user';
import { CampaignJobHistory } from './campaign_job_history';
export interface CampaignAttributes {
    id?: number;
    name: string;
    message: string;
    description: string;
    allocated_msg_count: number;
    scheduled_time: number;
    status: number;
    last_run: Date;
    metadata: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Campaign extends Model<CampaignAttributes>
    implements CampaignAttributes {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public name!: string;
    public message!: string;
    public description!: string
    public allocated_msg_count!: number
    public scheduled_time!: number
    public status!: number
    public last_run!: Date
    public metadata!: string
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    public getUsers!: BelongsToManyGetAssociationsMixin<User>; // Note the null assertions!
    public addUsers!: BelongsToManyAddAssociationsMixin<User, string>; // Note the null assertions!
    public getCampaignUser!: HasManyGetAssociationsMixin<CampaignUser>;
    public getCampaignJobHistory!: HasManyGetAssociationsMixin<CampaignJobHistory>;
    public addCampaignJobHistory!: HasManyCreateAssociationMixin<CampaignJobHistory>;
    public countCampaignUsers!: HasManyCountAssociationsMixin;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    // public readonly projects?: Project[]; // Note this is optional since it's only populated when explicitly requested in code

    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    allocated_msg_count: { type: DataTypes.STRING, allowNull: false },
    scheduled_time: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: false },
    last_run: { type: DataTypes.DATE, allowNull: true },
    metadata: {
        type: DataTypes.TEXT, allowNull: true,
        get: function () {
            return JSON.parse(this.getDataValue<any>("metadata"));
        },
        set: function (value) {
            return this.setDataValue<any>('metadata', JSON.stringify(value));
        }
    },
};

export function initCampaign(sequelize: Sequelize): typeof Campaign {
    Campaign.init(attributes, {
        sequelize,
        tableName: "Campaigns",
    });
    Campaign.belongsToMany(User, { through: 'CampaignUsers', foreignKey: 'campaign_id', otherKey: 'user_id' });
    Campaign.hasMany(CampaignUser, { foreignKey: 'campaign_id' });
    Campaign.hasMany(CampaignJobHistory, { foreignKey: 'campaign_id' });
    return Campaign
}
