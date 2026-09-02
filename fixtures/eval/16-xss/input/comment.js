function renderComment(req, el) {
  el.innerHTML = req.body.comment;
}

module.exports = { renderComment };
