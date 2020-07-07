import { Op } from 'sequelize';
import { FILTER_OPERATOR_MAP } from '../constants';
import { Filter } from '../types';
export const getCurrentTimeMinutes = () => {
    const now = new Date();
    return (now.getHours() * 60) + now.getMinutes();
}

export const getTimeStamp = (minutes: number, dayOffset: number = 0) => {
    const date = new Date();
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0);
    if (dayOffset) {
        const currentDate = date.getDate();
        date.setDate(currentDate + dayOffset);
    }
    return date;
}

export const isToday = (timestamp: Date) => {
    const now = new Date();
    return now.getDate() === timestamp.getDate()
        && now.getMonth() === timestamp.getMonth()
        && now.getFullYear() === timestamp.getFullYear()
}

export const processFilters = ({ filterType, conditions }: Filter) => {
    const conditionsMap: any = {};
    const filterTypeOp = FILTER_OPERATOR_MAP[filterType];
    conditions.forEach(condition => {
        const operator = FILTER_OPERATOR_MAP[condition.operator];
        if (!conditionsMap[condition.id]) {
            conditionsMap[condition.id] = {
                [filterTypeOp]: []
            };
        }
        conditionsMap[condition.id][filterTypeOp].push({
            [operator]: condition.value
        });
    });
    return { [filterTypeOp]: conditionsMap }

}

export const stillNowTimeFilter = () => {
    const _12AMTime = new Date();
    _12AMTime.setHours(0, 0, 0);
    return {
        [<any>Op.between]: [_12AMTime, new Date()]
    }
}