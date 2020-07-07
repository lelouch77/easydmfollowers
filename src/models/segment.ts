import {
    Sequelize,
    Model,
    DataTypes,
    ModelAttributes,
} from "sequelize";
import { Filter } from "../types";

export interface SegmentAttributes {
    id?: number;
    name: string;
    description: string;
    filters: Filter;
    createdAt?: Date;
    updatedAt?: Date;
}


export class Segment extends Model<SegmentAttributes>
    implements SegmentAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public filters!: Filter;
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    filters: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue<any>('filters'));
        },
        set: function (value) {
            return this.setDataValue<any>('filters', JSON.stringify(value));
        }
    }

};

export function initSegment(sequelize: Sequelize): typeof Segment {
    Segment.init(attributes, {
        sequelize,
        tableName: "Segments",
    })
    return Segment
}


