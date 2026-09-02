function renderProfile(id) {
  const user = findUser(id);
  return user.name.toUpperCase(); // MAYBE_NULL
}

function findUser(_id) {
  return null;
}

module.exports = { renderProfile };
