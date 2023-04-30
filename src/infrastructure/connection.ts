import mysql from "mysql2/promise"

/**
 * コネクションを作成して返す
 * @returns
 */
export async function connectMySQL() {
  return await mysql.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: "password",
  })
}
