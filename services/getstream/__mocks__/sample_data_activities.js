let data_sample = [];

let sample_activity = {
  actor: {
    created_at: '2023-04-05T23:04:52.595708Z',
    updated_at: '2023-08-03T17:29:08.687204Z',
    id: '4ff1bd33-fa32-468e-a9da-83a1d19b5ed4',
    data: {
      profile_pic_url:
        'https://res.cloudinary.com/hpjivutj2/image/upload/v1691083748/uiaz7kmrfp6y2dpkvqal.jpg',
      username: 'Usup'
    }
  },
  anonimity: false,
  count_downvote: 0,
  count_upvote: 0,
  duration_feed: 'never',
  expired_at: '2023-10-04T18:02:32.876Z',
  foreign_id: '',
  id: '3895dd2b-4b4d-11ee-8a21-0ee66bbe085b',
  images_url: [
    'https://res.cloudinary.com/hpjivutj2/image/upload/v1690743839/nfqxydkcwinuttlt2s8m.jpg'
  ],
  latest_reactions: {
    upvotes: [
      {
        created_at: '2023-08-07T18:00:53.883567Z',
        updated_at: '2023-08-07T18:00:53.883567Z',
        id: '9f2c3a12-14c9-459a-a0d4-668c6943a67a',
        user_id: '4ff1bd33-fa32-468e-a9da-83a1d19b5ed4',
        user: {
          created_at: '2023-04-05T23:04:52.595708Z',
          updated_at: '2023-08-03T17:29:08.687204Z',
          id: '4ff1bd33-fa32-468e-a9da-83a1d19b5ed4',
          data: {
            profile_pic_url:
              'https://res.cloudinary.com/hpjivutj2/image/upload/v1691083748/uiaz7kmrfp6y2dpkvqal.jpg',
            username: 'Usup'
          }
        },
        kind: 'upvotes',
        activity_id: 'e13ecb6f-2f0b-11ee-b8e4-124f97b82f95',
        data: {
          count_upvote: 1,
          text: 'You have new upvote'
        },
        target_feeds: ['notification:4ff1bd33-fa32-468e-a9da-83a1d19b5ed4'],
        parent: '',
        latest_children: {},
        children_counts: {}
      }
    ]
  },
  latest_reactions_extra: {
    upvotes: {
      next: ''
    }
  },
  location: 'Everywhere',
  message: '',
  object:
    '{"feed_group":"main_feed","message":"","profile_pic_path":"https://res.cloudinary.com/hpjivutj2/image/upload/v1682709447/ron515g4rdjhstbc2knq.jpg","real_name":null,"topics":[],"username":"Bastian","verb":"tweet"}',
  origin: 'user_excl:bc2e3d43-4833-40c1-b385-2f9f9cb19d8c',
  own_reactions: {},
  post_type: 2,
  og: {domain_page_id: 'c68a34b3-6d5b-4f15-b62d-a22050a34921'},
  privacy: 'public',
  reaction_counts: {
    upvotes: 1
  },
  target: '',
  time: '2023-09-04T18:02:32.897464',
  topics: [],
  verb: 'tweet',
  version: 2
};

function pushToDataSample(data) {
  data_sample.push(data);
}

for (let i = 0; i < 10; i++) {
  pushToDataSample(sample_activity);
}

module.exports = data_sample;
