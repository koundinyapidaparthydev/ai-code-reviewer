var started = false;
async function boot() {
  await startServer();
  started = true;
  console.log("started");
  return started;
}
async function startServer() { return true; }
module.exports = { boot };
