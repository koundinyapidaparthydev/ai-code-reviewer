function findByName(req) {
  const query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";
  return db.query(query);
}

module.exports = { findByName };
