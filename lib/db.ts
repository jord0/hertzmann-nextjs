import mysql from 'mysql2/promise';

export async function query(sql: string, params: any[] = []) {
  const connection = await mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    port: 54621,
    user: 'root',
    password: 'mxaVjtngYNIRqgnkgstCGvMUOBmIcETx',
    database: 'railway'
  });

  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    await connection.end();
  }
}