import {
    Sequelize,
    Model,
    DataTypes,
    ModelAttributes,
} from "sequelize";

export interface StateVariableAttributes {
    property: string;
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export class StateVariable extends Model<StateVariableAttributes>
    implements StateVariableAttributes {
    public property!: string;
    public value!: string;
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        // projects: Association<User, Project>;
    };
}
const attributes: ModelAttributes = {
    property: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.STRING, allowNull: true },

};

export function initStateVariable(sequelize: Sequelize): typeof StateVariable {
    StateVariable.init(attributes, {
        sequelize,
        tableName: "StateVariables",
    })
    return StateVariable
}
