module.exports = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    console.log('Invalid value');
  }
  const roundedValue = Math.round(value / 5) * 5;
  return roundedValue;
};
