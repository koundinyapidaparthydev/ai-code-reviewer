var cache = {};
function emailOf(id) {
  const user = findUser(id);
  console.log(user.email); // MAYBE_NULL
  return user.email;
}
function findUser(_id) { return null; }
module.exports = { emailOf };
