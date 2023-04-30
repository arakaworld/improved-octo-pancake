import { Board, initialBoard } from "./board"
import { Disc } from "./disc"
import { Move } from "./move"
import { Point } from "./point"

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  /**
   * 石と座標を受け取って新しいターンを返す
   * @param disc
   * @param point
   * @returns
   */
  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が、次の石ではない場合、置くことはできない
    if (disc !== this._nextDisc) {
      throw new Error("Invalid disc")
    }

    const move = new Move(disc, point)

    const nextBoard = this._board.place(move)

    // todo 次の石が置けない場合はスキップする処理
    const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      move,
      nextBoard,
      new Date()
    )
  }

  get gameId() {
    return this._gameId
  }
  get turnCount() {
    return this._turnCount
  }
  get nextDisc() {
    return this._nextDisc
  }
  get endAt() {
    return this._endAt
  }
  get board() {
    return this._board
  }
  get move() {
    return this._move
  }
}

/**
 * 最初のターンを生成する
 * @param gameId
 * @param endAt
 * @returns
 */
export function firstTurn(gameId: number, endAt: Date): Turn {
  return new Turn(gameId, 0, Disc.Dark, undefined, initialBoard, endAt)
}
