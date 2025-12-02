import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method === 'GET') {
      const { rows } = await sql`SELECT * FROM settings WHERE id = 1`;
      
      if (rows.length > 0) {
        return response.status(200).json({
            totalBudget: Number(rows[0].total_budget),
            currencySymbol: rows[0].currency_symbol,
            partnerName: rows[0].partner_name,
            userName: rows[0].user_name
        });
      }
      return response.status(404).json({ message: 'No settings found' });
    } 
    
    if (request.method === 'POST') {
      const { totalBudget, currencySymbol, partnerName, userName } = request.body;

      // Upsert logic for ID=1
      await sql`
        INSERT INTO settings (id, total_budget, currency_symbol, partner_name, user_name)
        VALUES (1, ${totalBudget}, ${currencySymbol}, ${partnerName}, ${userName})
        ON CONFLICT (id) DO UPDATE 
        SET total_budget = ${totalBudget}, 
            currency_symbol = ${currencySymbol}, 
            partner_name = ${partnerName},
            user_name = ${userName};
      `;
      return response.status(200).json({ message: 'Settings saved' });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}