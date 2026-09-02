function runUserCode(req) {
  return eval(req.body.expr);
}

module.exports = { runUserCode };
