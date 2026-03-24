# CALLSIGN — EVM Calldata Decoder

A terminal-style web app for decoding raw EVM calldata. Paste any hex calldata and get a fully decoded, human-readable breakdown instantly, in the browser.

Built by [Victor Okpukpan (Victor_TheOracle)](https://x.com/victorokpukpan_).

---

## What it does

EVM transactions carry raw hexadecimal calldata that is unreadable by default. Callsign decodes that data into the function name and each individual parameter, so you can understand exactly what a transaction is doing without needing a local node or external block explorer.

---

## Key Features

### Decoding
- Extracts the 4-byte function selector from any hex input
- Resolves the selector against **4byte.directory**, then **openchain.xyz** as fallback
- ABI-decodes all remaining parameters using **ethers.js v6**
- When multiple signature candidates match a selector, all are shown — pick the one to decode with
- Unknown selectors display an amber `UNKNOWN_SELECTOR` badge with a direct link to submit the signature to 4byte.directory

### Safe multiSend support
- Detects the Safe `multiSend(bytes)` selector (`0x8d80ff0a`) automatically
- Unpacks the packed transaction bytes into individual sub-transactions
- Recursively decodes each sub-transaction's calldata where possible

### Raw hex dump
- Full calldata rendered as 32-byte words with offset index
- First word highlights the 4-byte selector in amber

### Sharing & history
- **Share link** — encodes calldata as a `?data=` URL param, copies to clipboard
- **URL auto-decode** — loading the app with `?data=` in the URL triggers decode on mount
- **Session log** — last 10 decoded inputs saved to `localStorage`, accessible via the `[SESSION_LOG]` drawer
- **Copy button** on every decoded parameter value

### Keyboard shortcut
- `Ctrl + Enter` inside the input triggers decode

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — staggered result animations
- **ethers.js v6** — ABI decoding

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API routes

The app proxies external signature lookups server-side to avoid CORS issues:

| Route | Purpose |
|---|---|
| `GET /api/4byte?selector=<hex>` | Queries 4byte.directory |
| `GET /api/openchain?selector=<hex>` | Queries openchain.xyz |
