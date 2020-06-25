import EasyDMCore from './index'


const easyDMCore = new EasyDMCore("jupiter.sqlite");

async function test() {
    console.log(await easyDMCore.stateVariables.setVariable("apikey", "newKey"));
    console.log(await easyDMCore.stateVariables.getVariable("apikey"));
}

async function test2() {
    const userId = await easyDMCore.user.add(
        {
            "id": 6253282,
            "id_str": "62532824454554578786",
            "name": "Twitter API",
            "screen_name": "TwitterAPI",
            "location": "San Francisco, CA",
            "profile_location": null,
            "description": "The Real Twitter API. Tweets about API changes, service issues and our Developer Platform. Don't get an answer? It's on my website.",
            "url": "https:\/\/t.co\/8IkCzCDr19",
            "entities": {
                "url": {
                    "urls": [{
                        "url": "https:\/\/t.co\/8IkCzCDr19",
                        "expanded_url": "https:\/\/developer.twitter.com",
                        "display_url": "developer.twitter.com",
                        "indices": [
                            0,
                            23
                        ]
                    }]
                },
                "description": {
                    "urls": []
                }
            },
            "protected": false,
            "followers_count": 6133636,
            "friends_count": 12,
            "listed_count": 12936,
            "created_at": "Wed May 23 06:01:13 +0000 2007",
            "favourites_count": 31,
            "utc_offset": null,
            "time_zone": null,
            "geo_enabled": null,
            "verified": true,
            "statuses_count": 3656,
            "lang": null,
            "contributors_enabled": null,
            "is_translator": null,
            "is_translation_enabled": null,
            "profile_background_color": null,
            "profile_background_image_url": null,
            "profile_background_image_url_https": null,
            "profile_background_tile": null,
            "profile_image_url": null,
            "profile_image_url_https": "https:\/\/pbs.twimg.com\/profile_images\/942858479592554497\/BbazLO9L_normal.jpg",
            "profile_banner_url": null,
            "profile_link_color": null,
            "profile_sidebar_border_color": null,
            "profile_sidebar_fill_color": null,
            "profile_text_color": null,
            "profile_use_background_image": null,
            "has_extended_profile": null,
            "default_profile": false,
            "default_profile_image": false,
            "following": null,
            "follow_request_sent": null,
            "notifications": null,
            "translator_type": null
        }

    )

    // const listId = await easyDMCore.list.add("List 1","Some thing by praveen n",{"key":["fdf","dfdf"]});
    await easyDMCore.list.addUser(5, userId);
}

async function test3() {
    const twitterKeys = easyDMCore.TwitterAdapter.getTwitterKeys();
    if (Object.keys(twitterKeys) !== 0) {
        const user = await easyDMCore.TwitterAdapter.setTwitterKeys({
            consumer_key: "",
            consumer_secret: "",
            access_token_key: "",
            access_token_secret: ""
        });

        if( user !== false ) {
            await easyDMCore.twitterAdapter.initTwitterClient();
            await easyDMCore.twitterAdapter.syncFollowers(true);
        }else{
            console.log("Key authentication failed")
        }
    }
    else{
        await easyDMCore.twitterAdapter.initTwitterClient();
        await easyDMCore.twitterAdapter.syncFollowers();
    }
};


async function test4() {
    const newSegment = {
        name: "Segment1",
        description: "This is a test Segment",
        filters: {
            where: {
                followers_count:{
                    gt : 100
                }
            },
            limit: 100
        }
    }

    //const createdSegment = await easyDMCore.createSegment(newSegment);
    //console.log(await easyDMCore.getSegment(createdSegment.id));
    console.log(await easyDMCore.getSegments());
}

test3();
//test4();