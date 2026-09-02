var table = "users";
function search(req) {
  const query = "SELECT * FROM " + table + " WHERE q = '" + req.query.q + "'";
  console.log(query);
  return db.query(query);
}
module.exports = { search };
