var env = "dev";
const apiKey = "sk-test-fixture-key-not-real";
function info() {
  console.log(env);
  return env;
}
module.exports = { apiKey, info };
