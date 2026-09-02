function go(req, res) {
  return res.redirect(req.query.next);
}

module.exports = { go };
