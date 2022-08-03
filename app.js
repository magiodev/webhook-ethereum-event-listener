// Initialize Express app
require('dotenv').config()
const express = require("express");
const app = express()
const PORT = process.env.PORT || 3000

// Web3 Provider
const Web3 = require('web3')
let Provider

const Listener = require("./src/Listener");
const Sync = require("./src/Sync");

// Routes
app.get("/", (req, res) => {
  res.send("YourEvent(s) Hook")
})

// Listen
app.listen(PORT, async (error) => {
    if (!error) {
      console.log("Server is Successfully Running, and App is listening on port " + PORT)
      await main()
    } else {
      console.log("Error occurred, server can't start", error);
    }
  }
)

async function main() {
  workflow()
  console.log('Setting setInterval')
  setInterval(function () {
    console.log('Executing setInterval...')
    workflow(true)
  }, 60 * Number(process.env.APP_SYNC_INTERVAL_MINUTES) * 1000); // seconds * minutes * milliseconds
}

// -- Wrapped Workflow -- //

let listeners

function workflow(resetSyncCounter = false) {
  // if there are previous cycle's listeners set unsubscribe them
  if (listeners) {
    console.log('Unsubscribing events')
    unsubscribeListeners(listeners)
  }
  setProvider()
  setEventListeners()
  syncPastEvents(resetSyncCounter)
}

// -- Actions -- //

function setProvider() {
  console.log('Setting the Web3 Provider')
  Provider = new Web3(new Web3.providers.WebsocketProvider(process.env.PROVIDER_URL))
}

function setEventListeners() {
  console.log('Setting Event Listeners')
  listeners = []
  listeners.push(Listener.eventListenerYourEvent())
}

function syncPastEvents(resetSyncCounter) {
  console.log('Running Sync Past Event')
  Sync.syncPastEvents(resetSyncCounter) // ignoring promise
}

function unsubscribeListeners(listeners) {
  listeners.forEach(l => l.unsubscribe())
}
