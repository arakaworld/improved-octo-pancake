/*
MEMO: プレゼンテーション層の役割は、
このアプリケーションの利用者とやり取り(リクエストの取得＆レスポンス)すること
*/

import express from "express"
import { TurnService } from "../application/turnService"

export const turnRouter = express.Router()

const turnService = new TurnService()

interface TurnGetResponseBody {
  turnCount: number
  board: number[][]
  nextDisc: number | null
  winnerDisc: number | null
}

// 指定されたターンの盤面を取得する
turnRouter.get(
  "/api/games/latest/turns/:turnCount",
  async (req, res: express.Response<TurnGetResponseBody>) => {
    const turnCount = parseInt(req.params.turnCount)

    const output = await turnService.findLatestGameTurnByTurnCount(turnCount)

    const responseBody = {
      turnCount: output.turnCount,
      board: output.board,
      nextDisc: output.nextDisc ?? null,
      winnerDisc: output.winnerDisc ?? null,
    }

    res.json(responseBody)
  }
)

interface TurnPostRequstBody {
  turnCount: number
  move: {
    disc: number
    x: number
    y: number
  }
}

// 「手」を登録する
turnRouter.post(
  "/api/games/latest/turns",
  async (req: express.Request<{}, {}, TurnPostRequstBody>, res) => {
    const turnCount = req.body.turnCount
    const disc = req.body.move.disc
    const x = req.body.move.x
    const y = req.body.move.y

    await turnService.registerTurn(turnCount, disc, x, y)

    res.status(201).end()
  }
)
