const getstreamService = require("../../services/getstream");

const Validator = require("fastest-validator");
const {Polling, PollingOption} = require("../../databases/models");
const { v4: uuidv4 } = require("uuid");
const v = new Validator();
const moment = require('moment')

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

module.exports = async (req, res) => {
  try {
    const token = req.token;
    const now = new Date();

    if (token == null) {
      return res.status(401).json({
        code: 401,
        message: "Failed auth",
        data: null,
      });
    }

    const schema = {
      topics: "array|empty:false",
      message: "string|empty:false",
      verb: "string|empty:false",
      feedGroup: "string|empty:false",
      privacy: "string|empty:false",
      anonimity: "boolean|empty:false",
      location: "string|empty:false",
      duration_feed: "string|empty:false",
      polls : "array|empty:false",
      pollsduration : {
        $$type : "object",
        day : "string|empty:false",
        hour : "string|empty:false",
        minute : "string|empty:false",
      },
      multiplechoice : "boolean|empty:false"
    };

    const validated = v.validate(req.body, schema)
    if(validated.length) {
      return res.status(403).json({
        message : "Error validation",
        error : validated
      })
    }

    let {
      message,
      verb,
      feedGroup,
      privacy,
      topics,
      anonimity,
      location,
      duration_feed,
      images_url,
      polls,
      pollsduration,
      multiplechoice
    } = req.body;

    // CHECK EXPIRATION DATE
    let { day, hour, minute } = pollsduration
    let pollsDurationMoment = moment().add(day, "days").add(hour, "hour").add(minute, "minute")
    let pollsDurationInIso = pollsDurationMoment.toISOString()

    let expiredAt = null;
    let date = new Date()
    if (duration_feed !== "never") {
      date = addDays(date, duration_feed);
      expiredAt = date.toISOString();
    }
    
    console.log(`${pollsDurationMoment.valueOf()} vs ${date.getTime()}`)
    if(pollsDurationMoment.valueOf() > date.getTime()) return res.status(403).json({
      message : "Polling Duration cannot be more than post expiration date",
      success : false
    })

    // CHECK EXPIRATION DATE (END)

    let resUrl;
    if (images_url) {
      resUrl = await Promise.all(
        images_url.map(async (res) => {
          try {
            const uploadStr = "data:image/jpeg;base64," + res;
            let returnCloudinary = await cloudinary.v2.uploader.upload(
              uploadStr,
              {
                overwrite: false,
                invalidate: true,
              }
            );
            return returnCloudinary.url;
          } catch (error) {
            console.log("error upload gambar");
            return res.status(500).json({
              code: 500,
              status: "error",
              message: error,
            });
          }
        })
      );
    }

    let poll = await Polling.create({
      polling_id : uuidv4(),
      post_id : uuidv4(),
      user_id : req.userId,
      question : message,
      flg_multiple : multiplechoice
    })

    let pollId = poll.toJSON().polling_id
    console.log("Polling UUID : ")
    console.log(pollId)

    let pollsOptionUUIDs = []
    for(let i = 0; i < polls.length; i++) {
      let item = polls[i]      
      let pollOption = await PollingOption.create({
        polling_option_id : uuidv4(),
        polling_id : pollId,
        option : item.text,
        counter : 0,
      })

      let pollOptionUUID = pollOption.toJSON().polling_option_id
      pollsOptionUUIDs.push(pollOptionUUID)
    }

    let object = {
      verb: verb,
      message: message,
      topics: topics,
    };

    let data = {
      verb: verb,
      message: message,
      topics: topics,
      privacy: privacy,
      object: object,
      anonimity: anonimity,
      location: location,
      duration_feed: duration_feed,
      images_url: resUrl,
      expired_at: expiredAt,
      count_upvote: 0,
      count_downvote: 0,
      polls : pollsOptionUUIDs,
      polls_expired_at : pollsDurationInIso,
      multiplechoice
    };

    getstreamService
      .createPost(token, feedGroup, data)
      .then(() => {
        res.status(200).json({
          code: 200,
          status: "success create post",
          data: null,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({
          code: 403,
          status: "failed create post",
          data: null,
        });
      });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }  
}