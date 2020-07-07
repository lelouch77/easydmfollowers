import {
    Sequelize,
    Model,
    DataTypes,
    ModelAttributes,
} from "sequelize";

interface FollowersJobAttributes {
    id?: number;
    cursor: string;
    scheduled: Date;
    ran_at: Date;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}


export class FollowersJob extends Model<FollowersJobAttributes>
    implements FollowersJobAttributes {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public cursor!: string; // Note that the `null assertion` `!` is required in strict mode.
    public scheduled!: Date;
    public ran_at!: Date;
    public status!: number
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    cursor: { type: DataTypes.STRING, allowNull: false },
    ran_at: { type: DataTypes.STRING, allowNull: true },
    scheduled: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.INTEGER, allowNull: false }

};

export function initFollowersJob(sequelize: Sequelize): typeof FollowersJob {
    FollowersJob.init(attributes, {
        sequelize,
        tableName: "FollowersJobs",
    })
    return FollowersJob
}