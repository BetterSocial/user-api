module.exports = {
  checkMoreOrLess: function (val) {
    if (val < 25) {
      return "< 25";
    } else if (val > 25 && val < 50) {
      return "> 25";
    } else if (val > 50 && val < 100) {
      return "> 50";
    } else if (val > 100 && val < 250) {
      return "> 100";
    } else if (val > 250 && val < 500) {
      return "> 250";
    } else if (val > 500 && val < 1000) {
      return "> 500";
    } else if (val > 1000 && val < 2000) {
      return "> 1000";
    } else if (val > 2000 && val < 5000) {
      return "> 2000";
    } else if (val > 5000 && val < 10000) {
      return "> 5000";
    } else if (val > 10000 && val < 15000) {
      return "> 10000";
    } else if (val > 15000 && val < 20000) {
      return "> 15000";
    } else if (val > 20000 && val < 30000) {
      return "> 20000";
    } else if (val > 40000 && val < 100000) {
      return "> 40000";
    } else if (val > 100000 && val < 150000) {
      return "> 100000";
    } else if (val > 150000 && val < 200000) {
      return "> 150000";
    } else if (val > 200000 && val < 300000) {
      return "> 200000";
    } else if (val > 300000 && val < 400000) {
      return "> 300000";
    } else if (val > 400000 && val < 1000000) {
      return "> 400000";
    } else {
      return "> 1000000";
    }
  },
};
