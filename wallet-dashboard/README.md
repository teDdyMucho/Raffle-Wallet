# Wallet Dashboard

A modern web application designed to manage, monitor, and control user cash-in transactions.

## Features

- **Real-time Transaction Management**: View, approve, and reject cash-in transactions
- **Dashboard Overview**: Monitor key metrics with summary cards
- **Interactive Data Table**: Filter and manage transactions with status badges
- **Cash-In Request Form**: Submit new cash-in requests with different payment methods
- **Data Visualization**: View trends with charts and graphs
- **User Wallet Cards**: Display individual user balances and transaction history
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: Headless UI
- **Database**: Supabase (with CSV fallback)
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/wallet-dashboard.git
cd wallet-dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Structure

The application uses a `wallet_transactions` table with the following structure:

| Column         | Type                                | Description                       |
|----------------|-------------------------------------|-----------------------------------|
| id             | integer                             | Primary key                       |
| user_id        | string                              | User identifier                   |
| amount_cents   | integer                             | Amount in cents                   |
| method         | enum ('GCash', 'Bank', 'PayPal')    | Payment method                    |
| status         | enum ('approved', 'pending', 'rejected') | Transaction status           |
| created_at     | timestamp                           | Creation timestamp                |
| referral_code  | string (nullable)                   | Optional referral code            |

## Deployment

This project can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

```bash
npm run build
npm run start
```

## License

MIT
