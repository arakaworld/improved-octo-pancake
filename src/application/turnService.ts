import { connectMySQL } from "../dataaccess/connection"
import { GameGateway } from "../dataaccess/gameGateway"
import { MoveGateway } from "../dataaccess/moveGateway"
import { SquareGateway } from "../dataaccess/squareGateway"
import { TurnGateway } from "../dataaccess/turnGateway"
import { DARK, LIGHT } from "../application/constants"

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

class FindLatestGameTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount
  }
  get board() {
    return this._board
  }
  get nextDisc() {
    return this._nextDisc
  }
  get winnerDisc() {
    return this._winnerDisc
  }
}

export class TurnService {
  /**
   * 指定されたターンの盤面を取得する
   * @param turnCount
   * @returns
   */
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connectMySQL()
    try {
      const gameRecord = await gameGateway.findLatest(conn)
      if (!gameRecord) {
        throw new Error("Latest game not found")
      }

      const turnRecord = await turnGateway.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        turnCount
      )
      if (!turnRecord) {
        throw new Error("Specified turn not found")
      }

      const squareRecords = await squareGateway.findForTurnId(
        conn,
        turnRecord.id
      )

      const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
      squareRecords.forEach((s) => {
        board[s.y][s.x] = s.disc
      })

      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        board,
        turnRecord.nextDisc,
        // todo: 決着がついている場合、game_resultsテーブルから取得する
        undefined
      )
    } finally {
      await conn.end()
    }
  }

  /**
   * ターンを登録する
   * @param turnCount
   * @param disc
   * @param x
   * @param y
   */
  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    // １つ前のターンを取得する
    const conn = await connectMySQL()
    try {
      await conn.beginTransaction()

      // 1つ前のターンを取得する
      const gameRecord = await gameGateway.findLatest(conn)
      if (!gameRecord) {
        throw new Error("Latest game not found")
      }

      const previousTurnCount = turnCount - 1

      const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        previousTurnCount
      )
      if (!previousTurnRecord) {
        throw new Error("Specified turn not found")
      }

      const squareRecords = await squareGateway.findForTurnId(
        conn,
        previousTurnRecord.id
      )

      const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
      squareRecords.forEach((s) => {
        board[s.y][s.x] = s.disc
      })

      // TODO: 盤面に置けるかチェック

      // 石を置く
      board[y][x] = disc

      // TODO: ひっくり返す

      // ターンを保存する
      const nextDisc = disc === DARK ? LIGHT : DARK
      const now = new Date()
      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord.id,
        turnCount,
        nextDisc,
        now
      )

      await squareGateway.insertAll(conn, turnRecord.id, board)

      await moveGateway.insert(conn, turnRecord.id, disc, x, y)

      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}
