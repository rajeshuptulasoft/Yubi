# Yubi Backend (Node.js)

This folder contains a Node.js/Express conversion of your PHP API.

## Run

1. Copy `.env.example` to `.env` and fill DB + Razorpay values.
2. Install dependencies:
   - `npm install`
3. Start server:
   - `npm run dev`

Base URL is `http://localhost:4000` by default.

## API Groups

- `api/food/*`
- `api/admin/*`
- `api/delivery-partner/*`

The routes keep the same path naming style as your original PHP APIs.
