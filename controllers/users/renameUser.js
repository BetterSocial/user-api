
const { sequelize, User, } = require("../../databases/models");


module.exports = async (req, res) => {
    let { userId } = req.params;
    let { username } = req.body;
    let user = await User.findOne({ where: { user_id: userId, is_anonymous: false } });
    if (user) {
        user.username = username;
        user.save();

        const StreamChat = require("stream-chat").StreamChat;
        const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
        await serverClient.upsertUser({
            id: userId,
            name: username
        });
        const stream = require('getstream');
        const clientFeed = stream.connect(process.env.API_KEY, process.env.SECRET);
        await clientFeed.user(userId).update({ name: username });
        return res.status(200).json({
            'status': 'success',
            'user': user
        })
    } else {
        return res.status(400).json({
            "status": 'error',
            "message": 'User Not Found',
        });
    }
}