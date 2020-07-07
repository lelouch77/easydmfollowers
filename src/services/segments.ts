import db from '../models';
import { SegmentAttributes } from '../models/segment';
import { SegmentUpdateAttributes } from '../types';
export const createSegment = async ({ name, description, filters }: SegmentAttributes) => {
    return await db.Segment.create({
        name,
        description,
        filters
    });
}

export const getSegment = async (id: number) => {
    return await db.Segment.findByPk(id);
}

export const deleteSegment = async (id: number) => {
    const segment = await db.Segment.findByPk(id);
    return segment ? await segment.destroy() : null;
}


export const getSegments = async (ids: number[]) => {
    return await db.Segment.findAll({
        where: {
            id: ids
        }
    });
}


export const updateSegment = async (id: number, properties: SegmentUpdateAttributes) => {
    const list = await db.Segment.findByPk(id);
    if (!list) {
        return null;
    }
    list.update(properties);
    return await list.save();
}

export const getAllSegments = async () => {
    return await db.Segment.findAll();
}

export const deleteAllSegments = async () => {
    await db.Segment.destroy({
        where: {},
        truncate: true
    });
}