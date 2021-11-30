const { responseSuccess } = require("../../utils/Responses");

const { Locations } = require("../../databases/models");

const formatLocationGetstream = require("../../helpers/formatLocationGetStream");
const {
  CreateChannel,
  AddMembersChannel,
  WatchChannel,
} = require("../../services/chat");
const addModerators = require('./addModerators');

const Validator = require("fastest-validator")
const v = new Validator();

module.exports = {
  createChannel: async (req, res) => {
    // let locations = await Locations.findAll();
    // let loc = locations.map((item) =>
    //   formatLocationGetstream(item.neighborhood)
    // );
    // let watch = await WatchChannel("messaging", "morris-heightss");

    // let channel = await CreateChannel("messaging", "morris-heights");
    return res
      .status(200)
      .json(responseSuccess("Success create channel"));
  },

  addChannelModerator : async(req, res) => {
    const schema = {
      channelId : "string|empty:false",
      members : "string[]|empty:false",
    }

    const validated = v.validate(req.body, schema)
    if(validated.length) return res.status(403).json({
        message : "Error validation",
        error : validated
    })
      
    let {channelId, members} = req.body
    let {success, message} = await addModerators(channelId, members, req.token)
    if(!success) return res.status(403).json({
      success,
      message : "Error creating channel",
      error : message
    })

    return res.status(200).json({
      success,
      message : "Error creating channel",
      error : message
    })
  },

  addMembers: async (req, res) => {
    console.log(req.userId);
    let members = [];
    members.push(req.userId);
    let channel = await AddMembersChannel(
      "messaging",
      "morris-heights",
      members
    );
    return res
      .status(200)
      .json(responseSuccess("Success add members channel", channel));
  },
};
