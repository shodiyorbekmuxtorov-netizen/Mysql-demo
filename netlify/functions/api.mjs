import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: true }
    });

    if (event.httpMethod === 'POST') {
      const { name } = JSON.parse(event.body || '{}');
      if (!name || !name.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ism bo‘sh bo‘lishi mumkin emas' }) };
      }
      await connection.execute('INSERT INTO notes (name) VALUES (?)', [name.trim()]);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id || JSON.parse(event.body || '{}').id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID topilmadi' }) };
      }
      await connection.execute('DELETE FROM notes WHERE id = ?', [id]);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    const [rows] = await connection.execute('SELECT * FROM notes ORDER BY created_at DESC');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(rows)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    if (connection) await connection.end();
  }
};

