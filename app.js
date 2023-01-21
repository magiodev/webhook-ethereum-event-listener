const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const Listener = require("./src/Listener");
const Sync = require("./src/Sync");

const emitter = require('events');

// Routes
app.get("/", (req, res) => {
  res.send("YourEvent(s) Hook")
});

// Listen
app.listen(PORT, async (error) => {
  if (!error) {
    console.log(`Server is Successfully Running, and App is listening on port ${PORT}`)
    await main()
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

async function main() {
  await workflow();
  emitter.on('sync-past-events', async () => {
    await workflow();
  });
  emitter.emit('sync-past-events');
  setInterval(() => {
    emitter.emit('sync-past-events');
  }, Number(process.env.APP_SYNC_INTERVAL_MINUTES) * 60 * 1000);
}

// -- Wrapped Workflow -- //

let listeners = []

async function workflow() {
  await unsubscribeListeners(listeners);
  setEventListeners();
  await syncPastEvents();
}

function setEventListeners() {
  console.log('Setting Event Listeners')
  listeners.push(Listener.eventListenerYourEvent())
}

async function syncPastEvents() {
  console.log('Running Sync Past Event');
  try {
    await Sync.syncPastEvents()
  } catch (error) {
    console.error(error);
  }
}

async function unsubscribeListeners(listeners) {
  for (const l of listeners) {
    await l.unsubscribe();
  }
}
