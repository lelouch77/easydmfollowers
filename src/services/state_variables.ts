import db from '../models';
import { StateVariableAttributes } from '../models/state_variable'
export const setVariable = async (property: string, value: string) => {
    await db.StateVariable.upsert({
        property,
        value
    })
}

export const getVariable = async (property: string) => {
    const result = await db.StateVariable.findByPk(property);
    return result ? result.get("value") : null;
}

export const setVariables = async (variables: StateVariableAttributes[]) => {
    const result = await db.StateVariable.bulkCreate(variables, { updateOnDuplicate: ['value'] });
    return result.map(item => item.toJSON());
}

export const getVariables = async (propertyNames: string[]) => {
    const result = await db.StateVariable.findAll({
        where: {
            property: propertyNames
        }
    });
    return result.reduce(((acc: Record<string, string>, item) => {
        acc[item.get("property")] = item.get("value");
        return acc;
    }), {});
}

export const deleteAllVariables = async () => {
    await db.StateVariable.destroy({
        where: {},
        truncate: true
    });
}