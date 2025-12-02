import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Create Expenses Table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY,
        amount NUMERIC NOT NULL,
        payer VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        note TEXT,
        timestamp BIGINT NOT NULL
      );
    `;

    // Create Settings Table (Single row enforcement)
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        total_budget NUMERIC NOT NULL,
        currency_symbol VARCHAR(10) NOT NULL,
        partner_name VARCHAR(100) NOT NULL,
        user_name VARCHAR(100) NOT NULL
      );
    `;

    return response.status(200).json({ message: 'Database setup_db completed successfully' });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}