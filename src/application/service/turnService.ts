import { Disc } from "../../domain/model/turn/disc"
import { Point } from "../../domain/model/turn/point"
import { connectMySQL } from "../../infrastructure/connection"
import { GameResult } from "../../domain/model/gameResult/gameResult"
import { ApplicationError } from "../error/applicationError"
import { GameResultRepository } from "../../domain/model/gameResult/gameResultRepository"
import { GameRepository } from "../../domain/model/game/gameRepository"
import { TurnRepository } from "../../domain/model/turn/turnRepository"

/**
 * DTO
 */
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

/**
 *
 */
export class TurnService {
  constructor(
    private _turnRepository: TurnRepository,
    private _gameRepository: GameRepository,
    private _gameResultRepository: GameResultRepository
  ) {}

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
      const game = await this._gameRepository.findLatest(conn)
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFound",
          "Latest game not found"
        )
      }
      if (!game.id) {
        throw new Error("game.id not exist")
      }

      const turn = await this._turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
        turnCount
      )

      let gameResult: GameResult | undefined
      if (turn.gameEnded()) {
        gameResult = await this._gameResultRepository.findForGameId(
          conn,
          game.id
        )
      }

      // DTOで返す
      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        gameResult?.winnerDisc
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
  async registerTurn(turnCount: number, disc: Disc, point: Point) {
    const conn = await connectMySQL()
    try {
      // 1つ前のターンを取得する
      const game = await this._gameRepository.findLatest(conn)
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFound",
          "Latest game not found"
        )
      }
      if (!game.id) {
        throw new Error("game.id not exist")
      }

      const previousTurnCount = turnCount - 1
      const previousTurn = await this._turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
        previousTurnCount
      )

      // 石を置く
      const newTurn = previousTurn.placeNext(disc, point)

      // ターンを保存する
      await this._turnRepository.save(conn, newTurn)

      // 勝敗が決した場合、対戦結果を保存
      if (newTurn.gameEnded()) {
        const winnerDisc = newTurn.winnerDisc()
        const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt)
        await this._gameResultRepository.save(conn, gameResult)
      }

      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}
