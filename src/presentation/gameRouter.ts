import express from "express"
import { GameService } from "../application/gameService"

export const gameRouter = express.Router()

const gameService = new GameService()

// 対戦を開始する
gameRouter.post("/api/games", async (req, res) => {
  await gameService.startNewGame()

  res.status(201).end()
})