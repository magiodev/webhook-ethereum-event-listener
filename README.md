# Webhook Ethereum Smart Contracts Events Listener

Smart Contracts transactions events listener for Ethereum or any EVM compatible Blockchain. It's meant to serve Web2 REST APIs as Webhook in order to execute specific actions when Web3 things happen.

## Features
- Subscribing to Smart Contract(s) events and setting Websocket Event Listeners
- Taking past Events from decremental range of blocks, to init your project or recover missed ones
- Keeping alive the connection creating fresh subscriptions very X minutes
- Cleanness of past subscriptions once new once are created
- Detecting if already fetched a transaction id previously to do not spam your API

## Tech Stack
- Node.js with Express to run
- Axios for XHR/HTTP Requests
- Web3.js as WebSocket / RPC

## Usage

### Installation

```
npm install
```

### Configuration
Edit the .env accordingly to your needing starting by the .env-template file.
```
cp .env-template .env
nano .env
```
Also you need to put the artifact of your Smart Contract(s) inside the /contracts folder in order to let Web3.js decode methods and Event data structures. Use the same structure adopted by dummy files.

### Running the script

```
node app.js
```

### Setting persistence with PM2 (remote)

```
npm install -g pm2
pm2 startup
pm2 start app.js
pm2 save
pm2 status
```
