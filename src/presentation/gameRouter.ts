import express from "express"
import { StartNewGameUseCase } from "../application/usecase/startNewGameUseCase"
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository"
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository"
import { FindLastGamesUseCase } from "../application/usecase/findLastGamesUseCase"
import { FindLastGamesMySQLQueryService } from "../infrastructure/query/findLastGamesMySQLQuery"

export const gameRouter = express.Router()

const findLastGamesUseCase = new FindLastGamesUseCase(
  new FindLastGamesMySQLQueryService()
)

const startNewGameUseCase = new StartNewGameUseCase(
  new GameMySQLRepository(),
  new TurnMySQLRepository()
)

// 戻り値の型のインターフェース
interface GetGamesResponseBody {
  games: {
    id: number
    darkMoveCount: number
    lightMoveCount: number
    winnerDisc: number
    startedAt: Date
    endAt: Date
  }[]
}

gameRouter.get(
  "/api/games",
  async (req, res: express.Response<GetGamesResponseBody>) => {
    const output = await findLastGamesUseCase.run()

    const responseBodyGames = output.map((g) => {
      return {
        id: g.gameId,
        darkMoveCount: g.darkMoveCount,
        lightMoveCount: g.lightMoveCount,
        winnerDisc: g.winnerDisc,
        startedAt: g.startedAt,
        endAt: g.endAt,
      }
    })

    const responseBody = {
      games: responseBodyGames,
    }

    res.json(responseBody)
  }
)

// 対戦を開始する
gameRouter.post("/api/games", async (req, res) => {
  await startNewGameUseCase.run()

  res.status(201).end()
})
