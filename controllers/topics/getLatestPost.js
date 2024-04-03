const {QueryTypes} = require('sequelize');
const {sequelize, Topics} = require('../../databases/models');

module.exports = async (req, res) => {
  const {name} = req.query;
  try {
    let topics = await Topics.findOne({
      where: {
        name: name
      }
    });

    if (!topics) {
      res.status(400).json({
        code: 400,
        message: 'Topic not found'
      });
    }

    let post_topics = await sequelize.query(
      `SELECT
        pt.topic_id,
        p.*
      FROM posts p 
        INNER JOIN post_topics pt 
        ON p.post_id = pt.post_id
      WHERE 
        pt.topic_id = :topic_id
        AND p.duration >= now()
      ORDER BY created_at DESC
      LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          topic_id: topics.topic_id
        }
      }
    );

    res.status(200).json({
      status: 'success',
      code: 200,
      data: post_topics
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
};
