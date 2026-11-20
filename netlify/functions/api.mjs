import mysql from 'mysql2/promise';

const json = (statusCode, data) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

export const handler = async (event) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    if (event.httpMethod === 'POST') {
      const { name } = JSON.parse(event.body || '{}');
      const clean = String(name || '').trim();
      if (!clean) return json(400, { error: 'Ism kiritilmagan' });
      await connection.execute('INSERT INTO notes (name) VALUES (?)', [clean]);
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'DELETE') {
      const id = Number(event.queryStringParameters?.id);
      if (!Number.isInteger(id) || id <= 0) {
        return json(400, { error: 'Noto‘g‘ri id' });
      }
      const [result] = await connection.execute('DELETE FROM notes WHERE id = ?', [id]);
      if (result.affectedRows === 0) return json(404, { error: 'Topilmadi' });
      return json(200, { ok: true });
    }

    const [rows] = await connection.execute('SELECT * FROM notes ORDER BY created_at DESC');
    return json(200, rows);
  } catch (err) {
    console.error(err);
    return json(500, { error: 'Server xatosi' });
  } finally {
    await connection.end();
  }
};

