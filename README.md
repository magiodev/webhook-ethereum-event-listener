# Event Listener Webhook for Blockchain Transactions

This Event Listener Webhook is designed to monitor and keep to date our DB about listing, removing and selling of NFTs on Games For A Living Marketplace, and to check if the NFT (ERC721 & ERC1155) on sale has been transferred to another address. If the NFT has been transferred, the Webhook will automatically remove the listing from the GFAL Marketplace, ensuring that the Marketplace remains up to date and accurate. Also, the application uses an API to retrieve the last indexed block number and syncs the transactions from there. In case of an error, it will retry from the last block number where it stopped and continue listening.

### Tech Stack

- Node.js with Express to run
- Nodemon to monitor any changes in the scripts while running
- Axios for XHR/HTTP Requests
- Ether.js for provider RPC connection
- Mailgun.js for email alerts

## Getting Started

### Installation

To install the Webhook, simply clone the repository and install the required dependencies:

```javascript
git clone https://github.com/gamesforaliving/portal-api-event-listener.git
cd portal-api-event-listener
npm install
```

### Configuration

Before running the Webhook, you will need to configure it with your blockchain network and marketplace details. To do this, create a .env file in the root directory of the project and set the following variables:

```env
PROVIDER_MAINNET_HTTPS=https://bsc-mainnet.nodereal.io/v1/<api-key>
PROVIDER_TESTNET_HTTPS=https://bsc-testnet.nodereal.io/v1/<api-key>
PROVIDER_CHAIN_ID=<chain-id>

API_URL=http://127.0.0.1:1337/api/
API_BEARER_TOKEN=<bearer-token>

BLOCK_NUMBER=<block-number>

#TESTNET
MARKETPLACE_ADDRESS=<contract_address>
SKIN_ADDRESS=<contract_address>
SKILL_ADDRESS=<contract_address>
ERC1155MOCKUP_ADDRESS=<contract_address>

#MAILGUN
MAILGUN_API_KEY=<api-key>
MAILGUN_DOMAIN_NAME=<domain-name>
MAILGUN_API_URL=<api-endpoint>

# PRIVATE KEY
PRIVATE_KEY=<private-key>
```

## Running the Webhook

Once you have configured the Webhook, you can start it by running:

```
nodemon App.js
```

The Webhook will listen for blockchain events and automatically update the Marketplace database when necessary.

## Webhook Endpoints

The Webhook exposes the following endpoints:

### GET /blockchain/blocknumber

- Retrieve the last block number indexed in our DB.

### POST /listings

- Add the listed sale into our DB.

### DELETE /listings

- Remove from our DB delisted sale.

### POST /orders

- Add the purchase into our DB.

## License

This Webhook is licensed under the MIT License. See the LICENSE file for details.
