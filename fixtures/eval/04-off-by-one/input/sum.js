function sumAll(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i];
  }
  return total;
}

module.exports = { sumAll };
