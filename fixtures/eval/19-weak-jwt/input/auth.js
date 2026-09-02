const jwt = require('jsonwebtoken');

function tokenFor(user) {
  return jwt.sign({ id: user.id }, 'secret');
}

module.exports = { tokenFor };
