const changeValue = (item) => {
  if (/\s/.test(item)) {
    return item.split(" ").join("-");
  }
  return item;
};
module.exports = (location) => {
  let loc = location.toLowerCase();
  return changeValue(loc);
};
