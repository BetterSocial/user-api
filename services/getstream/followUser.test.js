const followUser = require('./followUser');
// const followLocation = module.followLocation("", "");

test('create followUser test', async () => {
  await followUser.followUser(
    'Bi9jNv9TCv11TfjkbUz37I75zea2VFue',
    '90245907-f687-44af-b6bf-543701508840',
    'follow-user'
  );

  await followUser.followUser(
    'Bi9jNv9TCv11TfjkbUz37I75zea2VFue',
    '90245907-f687-44af-b6bf-543701508840',
    'unfollow-user',
    0
  );
});

test('create follow Users test', async () => {
  let userIds = ['sample1', 'sample2', 'sample3'];
  await followUser.followUsers('Bi9jNv9TCv11TfjkbUz37I75zea2VFue', userIds);
});
