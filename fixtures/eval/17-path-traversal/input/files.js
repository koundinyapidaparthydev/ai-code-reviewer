const path = require('path');

function readUserFile(req) {
  const target = path.join('/uploads', req.query.filename);
  return fs.readFileSync(target);
}

module.exports = { readUserFile };
