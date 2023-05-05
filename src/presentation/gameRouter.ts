import express from "express"
import { StartNewGameUseCase } from "../application/usecase/startNewGameUseCase"
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository"
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository"

export const gameRouter = express.Router()

const startNewGameUseCase = new StartNewGameUseCase(
  new GameMySQLRepository(),
  new TurnMySQLRepository()
)

// 対戦を開始する
gameRouter.post("/api/games", async (req, res) => {
  await startNewGameUseCase.run()

  res.status(201).end()
})
