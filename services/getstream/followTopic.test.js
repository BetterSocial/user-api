
// jest.mock('followTopic');

const followTopic = require('./followTopic');

test('create followTopic', async () => {
    await followTopic.followTopic(
        "Bi9jNv9TCv11TfjkbUz37I75zea2VFue",
        "90245907-f687-44af-b6bf-543701508840");

});

test('create follow Topics', async () => {
    let topics = ["GAmes", "toys"];
    await followTopic.followTopics(
        "Bi9jNv9TCv11TfjkbUz37I75zea2VFue", topics );

});
