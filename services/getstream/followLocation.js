const stream = require("getstream");
exports.followLocation = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  return user.follow("location", id);
};

const neighborhood = (item) => {
  return {};
};

const changeValue = (item) => {
  if (/\s/.test(item)) {
    return item.replace(" ", "-");
  }
  return item;
};

exports.followLocations = async (token, locations) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  // userIds.map((item) => {
  //   follows.push({
  //     source: "main_feed:" + client.userId,
  //     target: "location:" + item.toLowerCase(),
  //   });
  // });

  follows.push({
    source: "main_feed:" + client.userId,
    target: "location:everywhere",
  });
  locations.map((item) => {
    const neighborhood = follows.findIndex(
      (x) =>
        x.target === "location:" + changeValue(item.neighborhood.toLowerCase())
    );
    neighborhood === -1
      ? item.neighborhood !== ""
        ? follows.push({
            source: "main_feed:" + client.userId,
            target: "location:" + changeValue(item.neighborhood.toLowerCase()),
          })
        : null
      : null;
    const city = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.city.toLowerCase())
    );
    console.log(item.city);
    console.log(item.state);
    console.log("===========");
    city === -1
      ? item.city !== ""
        ? follows.push({
            source: "main_feed:" + client.userId,
            target: "location:" + changeValue(item.city.toLowerCase()),
          })
        : null
      : null;

    const state = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.state.toLowerCase())
    );
    state === -1
      ? item.state !== ""
        ? follows.push({
            source: "main_feed:" + client.userId,
            target: "location:" + changeValue(item.state.toLowerCase()),
          })
        : null
      : null;
    const country = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.country.toLowerCase())
    );
    country === -1
      ? item.country !== null
        ? follows.push({
            source: "main_feed:" + client.userId,
            target: "location:" + changeValue(item.country.toLowerCase()),
          })
        : null
      : null;

    // if (item.location_level === "Neighborhood") {
    //   follows.push({
    //     source: "main_feed:" + client.userId,
    //     target: "location:" + changeValue(item.neighborhood.toLowerCase()),
    //   });
    //   follows.push({
    //     source: "main_feed:" + client.userId,
    //     target: "location:" + changeValue(item.city.toLowerCase()),
    //   });
    //   follows.push({
    //     source: "main_feed:" + client.userId,
    //     target: "location:" + changeValue(item.state.toLowerCase()),
    //   });
    //   follows.push({
    //     source: "main_feed:" + client.userId,
    //     target: "location:" + changeValue(item.country.toLowerCase()),
    //   });
    // }

    // if (item.location_level === "City") {
    //   const index = follows.findIndex(
    //     (x) => x.target === "location:" + changeValue(item.city.toLowerCase())
    //   );
    //   index === -1
    //     ? follows.push({
    //         source: "main_feed:" + client.userId,
    //         target: "location:" + changeValue(item.city.toLowerCase()),
    //       })
    //     : null;
    // }

    // if (item.location_level === "state") {
    //   const index = follows.findIndex(
    //     (x) => x.target === "location:" + changeValue(item.state.toLowerCase())
    //   );
    //   index === -1
    //     ? follows.push({
    //         source: "main_feed:" + client.userId,
    //         target: "location:" + changeValue(item.state.toLowerCase()),
    //       })
    //     : null;
    // }
    // if (item.location_level === "country") {
    //   const index = follows.findIndex(
    //     (x) =>
    //       x.target === "location:" + changeValue(item.country.toLowerCase())
    //   );
    //   index === -1
    //     ? follows.push({
    //         source: "main_feed:" + client.userId,
    //         target: "location:" + changeValue(item.country.toLowerCase()),
    //       })
    //     : null;
    // }
  });

  // return follows;

  return await clientServer.followMany(follows);
};
