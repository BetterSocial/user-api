
const followLocation = require('./followLocation');
// const followLocation = module.followLocation("", "");

test('create followLocation', async () => {
    await followLocation.followLocation(
        "Bi9jNv9TCv11TfjkbUz37I75zea2VFue",
        "90245907-f687-44af-b6bf-543701508840");

});


test('create follow Locations', async () => {
    let location = [];
    await followLocation.followLocations(
        "Bi9jNv9TCv11TfjkbUz37I75zea2VFue", location );

});
