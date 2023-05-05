import mysql from "mysql2/promise"
import { GameResultRecord } from "./gameResultRecord"

export class GameResultGateway {
  /**
   *
   * @param conn
   * @param gameId
   * @returns
   */
  async findForGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResultRecord | undefined> {
    const gameSelecteResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, game_id, winner_disc, end_at from game_results where game_id = ?",
      [gameId]
    )

    const record = gameSelecteResult[0][0]

    if (!record) {
      return undefined
    }

    return new GameResultRecord(
      record["id"],
      record["game_id"],
      record["winner_disc"],
      record["end_at"]
    )
  }

  /**
   *
   * @param conn
   * @param gameId
   * @param winnerDisc
   * @param endAt
   */
  async insert(
    conn: mysql.Connection,
    gameId: number,
    winnerDisc: number,
    endAt: Date
  ) {
    await conn.execute(
      "insert into game_results (game_id, winner_disc, end_at) values (?, ?, ?)",
      [gameId, winnerDisc, endAt]
    )
  }
}
