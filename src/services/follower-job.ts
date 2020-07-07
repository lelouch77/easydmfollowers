import db from '../models';
import { FollowersJob } from '../models/followers_job'
import { JOB_STATUS } from '../constants'

export const closeActiveJob = async (activeJob: FollowersJob) => {
    activeJob.status = JOB_STATUS.DONE;
    activeJob.ran_at = new Date();
    await activeJob.save();
}

export const scheduleNewJob = async ({ cursor, scheduled }: { cursor: string, scheduled: Date }) => {
    const activeJob = await getActiveJob();
    const newJob = await db.FollowersJob.create({
        cursor,
        scheduled,
        status: JOB_STATUS.SCHEDULED
    });
    if (activeJob)
        await closeActiveJob(activeJob);
    return newJob;
}

export const getActiveJob = async () => {
    // TBD : need to handle the case if there are 2 active jobs
    return await db.FollowersJob.findOne({
        where: {
            status: JOB_STATUS.SCHEDULED
        }
    });
}


export const deleteAllJobs = async () => {
    await db.FollowersJob.destroy({
        where: {},
        truncate: true
    });
}