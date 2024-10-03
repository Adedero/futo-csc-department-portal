const randomInteger = (min = 100000, max = 999999) => {
  const num = Math.floor(min + Math.random() * max);
  return num;
};

module.exports = randomInteger;
