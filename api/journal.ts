import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method === 'GET') {
      const { rows } = await sql`SELECT * FROM expenses ORDER BY timestamp DESC`;
      // Convert numeric strings back to numbers
      const formatted = rows.map(r => ({
        ...r,
        amount: Number(r.amount),
        timestamp: Number(r.timestamp)
      }));
      return response.status(200).json(formatted);
    } 
    
    if (request.method === 'POST') {
      const { id, amount, payer, category, date, note, timestamp } = request.body;
      if (!id || !amount) throw new Error('Missing required fields');

      await sql`
        INSERT INTO expenses (id, amount, payer, category, date, note, timestamp)
        VALUES (${id}, ${amount}, ${payer}, ${category}, ${date}, ${note}, ${timestamp})
      `;
      return response.status(200).json({ message: 'Expense added' });
    }

    if (request.method === 'PUT') {
        const { id, amount, payer, category, date, note } = request.body;
        if (!id) throw new Error('Missing ID');
  
        await sql`
          UPDATE expenses 
          SET amount = ${amount}, payer = ${payer}, category = ${category}, date = ${date}, note = ${note}
          WHERE id = ${id}
        `;
        return response.status(200).json({ message: 'Expense updated' });
    }

    if (request.method === 'DELETE') {
      const { id, reset } = request.query;

      if (reset === 'true') {
          await sql`DELETE FROM expenses`;
          return response.status(200).json({ message: 'All expenses deleted' });
      }

      if (id) {
        await sql`DELETE FROM expenses WHERE id = ${id as string}`;
        return response.status(200).json({ message: 'Expense deleted' });
      }
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}