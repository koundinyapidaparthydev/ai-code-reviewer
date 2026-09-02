var n = 0;
function walk(items) {
  for (let i = 0; i <= items.length; i++) {
    n = n + 1;
  }
  return n;
}
module.exports = { walk };
