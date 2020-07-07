import {
    Sequelize,
    Model,
    DataTypes,
    ModelAttributes,
    BelongsToGetAssociationMixin,
} from "sequelize";
import { User } from './user'
export interface CampaignUserAttributes {
    id?: number;
    user_id: string;
    campaign_id: number;
    job_id: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}


export class CampaignUser extends Model<CampaignUserAttributes>
    implements CampaignUserAttributes {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public user_id!: string; // Note that the `null assertion` `!` is required in strict mode.
    public campaign_id!: number;
    public job_id!: number
    public status!: number
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>; // Note the null assertions!


    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    campaign_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: true }

};

export function initCampaignUser(sequelize: Sequelize): typeof CampaignUser {
    CampaignUser.init(attributes, {
        sequelize,
        tableName: "CampaignUsers",
    })
    CampaignUser.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id_str' })
    return CampaignUser
}