# XRPL Memo Demo

A TypeScript demonstration of the XRPL memo capability using xrpl.js.

## What It Does

This project sends two payment transactions on XRPL Testnet, each with 1 drop of XRP, showcasing different memo use cases:

1. **Transaction #1**: Attaches plain text memo `"Hi Linklogis"` to demonstrate basic memo functionality
   - [Example transaction](https://testnet.xrpl.org/transactions/2C020FFA49270F71388292ED81D15C6E1655C6C485A44015AE3CD70BA42043C9)
2. **Transaction #2**: Attaches a SHA256 hash of `example-document.txt` to demonstrate document verification via blockchain
   - [Example transaction](https://testnet.xrpl.org/transactions/D9AD5618AF48156D889276A42A6E0A3C155C20EF49DBDA914DFAF55A7E2BA6FF)

## How It Works

- Connects to XRPL Testnet (`wss://s.altnet.rippletest.net:51233`)
- Funds a test wallet from the testnet faucet
- Encodes memo data as hex (XRPL requirement)
- Sends payments with memos under the `"important-data"` memo type field
- All transactions are verifiable on the XRPL Testnet explorer

## Setup & Run

```bash
npm install
npm start
```

## Technical Details

- **Language**: TypeScript with strict typing
- **Library**: xrpl.js v4
- **Network**: XRPL Testnet
- **Memo Encoding**: UTF-8 text converted to uppercase hex
- **Hash Algorithm**: SHA256 for document integrity verification

Each transaction includes the memo in the `Memos` field with `MemoType` set to `"important-data"` (hex-encoded).