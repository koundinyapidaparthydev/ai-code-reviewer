async function loadUser(id) {
  await fetchUser(id);
  return { id, loaded: true };
}

async function fetchUser(id) {
  return { id, name: 'Ada' };
}

module.exports = { loadUser };
