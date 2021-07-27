const { responseSuccess } = require("../../utils/Responses");

const { Locations } = require("../../databases/models");

const formatLocationGetstream = require("../../helpers/formatLocationGetStream");
const {
  CreateChannel,
  AddMembersChannel,
  WatchChannel,
} = require("../../services/chat");

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
      .json(responseSuccess("Success create channel", watch));
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
