# MurBakes Management System

A cookie business management system built with Next.js and Supabase.

## Features

- Product management with stock tracking
- Order management with payment tracking
- Bake sale period management
- Dashboard with analytics
- Invoice generation and export
- Image order upload (demo feature)
- Supabase database integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application requires the following tables in your Supabase database:

- products
- orders
- order_items
- bake_sale_periods

The schema for these tables is included in the SQL files in the `sql` directory.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

## License

This project is licensed under the MIT License.
\`\`\`

Let's create a SQL directory with the schema files for reference:
