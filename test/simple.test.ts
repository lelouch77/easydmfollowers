require('dotenv').config()
import EasyDMCore from '../src'
import { filter1, filter2, filter4 } from './test-data'
const easyDMCore = new EasyDMCore("jupiter.sqlite");

describe('Initial User Setup', () => {

    // test("User name match", async (done) => {
    //     let userObject = await easyDMCore.getUserObject();
    //     if (userObject.error) {
    //         userObject = await easyDMCore.setKeys({
    //             consumer_key: <string>process.env.consumer_key,
    //             consumer_secret: <string>process.env.consumer_secret,
    //             access_token_key: <string>process.env.access_token_key,
    //             access_token_secret: <string>process.env.access_token_secret
    //         });
    //     };
    //     expect((<any>userObject).screen_name).toBe("np_hinata");
    //     done();
    // });
    test("User name match", async (done) => {
        const userObject = await easyDMCore.getUserObject();
        expect((<any>userObject).screen_name).toBe("np_hinata");
        done();
    });

    test("Filter 1 Creation", async (done) => {
        const filter = await easyDMCore.createSegment({
            name: "Segment 1",
            description: "This is a test Segment 1",
            filters: <any>filter4
        });
        expect(filter.name).toBe("Segment 1");
        done();
    });

    // test("Filter 2 Creation", async (done) => {
    //     const filter = await easyDMCore.createSegment({
    //         name: "Segment 2",
    //         description: "This is a test Segment 2",
    //         filters: <any>filter2
    //     });
    //     expect(filter.name).toBe("Segment 2");
    //     done();
    // });

    test("Create Campaign", async (done) => {
        const campaign = await easyDMCore.createCampaign({
            name: "Campaign 1",
            message: "Hi [user_name], Check out the link",
            allocated_msg_count: 500,
            description: "For segment 1 and 2",
            scheduled_time: 984,
            segmentIds: [1, 2]
        });
        const campaignStatus = await easyDMCore.getCampaignStatus(campaign.id);
        console.log(campaignStatus.TOTAL);
        done();
    })
});