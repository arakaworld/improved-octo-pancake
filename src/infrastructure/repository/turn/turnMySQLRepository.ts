/**
 * MEMO: ドメインモデルの単位で読み書きできることがRepositoryの責務
 */

import mysql from "mysql2/promise"
import { TurnGateway } from "./turnGateway"
import { MoveGateway } from "./moveGateway"
import { SquareGateway } from "./squareGateway"
import { DomainError } from "../../../domain/model/error/domainError"
import { Board } from "../../../domain/model/turn/board"
import { toDisc } from "../../../domain/model/turn/disc"
import { Move } from "../../../domain/model/turn/move"
import { Point } from "../../../domain/model/turn/point"
import { Turn } from "../../../domain/model/turn/turn"
import { TurnRepository } from "../../../domain/model/turn/turnRepository"

const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

export class TurnMySQLRepository implements TurnRepository {
  /**
   * Turnに必要なレコードをかき集めてTurnを返す
   * @param conn
   * @param gameId
   * @param turnCount
   * @returns
   */
  async findForGameIdAndTurnCount(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameId,
      turnCount
    )
    if (!turnRecord) {
      throw new DomainError("SpecifiedTurnNotFound", "Specified turn not found")
    }

    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id)

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })

    const moveRecord = await moveGateway.findForTurnId(conn, turnRecord.id)
    let move: Move | undefined
    if (moveRecord) {
      move = new Move(
        toDisc(moveRecord.disc),
        new Point(moveRecord.x, moveRecord.y)
      )
    }

    const nextDisc =
      turnRecord.nextDisc === null ? undefined : toDisc(turnRecord.nextDisc)

    return new Turn(
      gameId,
      turnCount,
      nextDisc,
      move,
      new Board(board),
      turnRecord.endAt
    )
  }

  /**
   *
   */
  async save(conn: mysql.Connection, turn: Turn) {
    // ターンを保存する
    const turnRecord = await turnGateway.insert(
      conn,
      turn.gameId,
      turn.turnCount,
      turn.nextDisc,
      turn.endAt
    )

    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs)

    if (turn.move) {
      await moveGateway.insert(
        conn,
        turnRecord.id,
        turn.move.disc,
        turn.move.point.x,
        turn.move.point.y
      )
    }
  }
}