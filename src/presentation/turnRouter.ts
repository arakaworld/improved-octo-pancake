/*
MEMO: プレゼンテーション層の役割は、
このアプリケーションの利用者とやり取り(リクエストの取得＆レスポンス)すること
*/

import express from "express"
import { RegisterTurnUseCase } from "../application/usecase/registerTurnUseCase"
import { FindLatestGameTurnByTurnCountUseCase } from "../application/usecase/findLatestGameTurnByTurnCountUseCase"
import { Point } from "../domain/model/turn/point"
import { toDisc } from "../domain/model/turn/disc"
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository"
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository"
import { GameResultMySQLRepository } from "../infrastructure/repository/gameResult/gameResultMySQLRepository"

export const turnRouter = express.Router()

const findLatestGameTurnByTurnCountUseCase =
  new FindLatestGameTurnByTurnCountUseCase(
    new TurnMySQLRepository(),
    new GameMySQLRepository(),
    new GameResultMySQLRepository()
  )

const registerTurnUseCase = new RegisterTurnUseCase(
  new TurnMySQLRepository(),
  new GameMySQLRepository(),
  new GameResultMySQLRepository()
)

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

    const output = await findLatestGameTurnByTurnCountUseCase.run(turnCount)

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
    const disc = toDisc(req.body.move.disc)
    const point = new Point(req.body.move.x, req.body.move.y)

    await registerTurnUseCase.run(turnCount, disc, point)

    res.status(201).end()
  }
)
