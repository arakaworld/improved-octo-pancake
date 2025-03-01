import { connectMySQL } from "../../infrastructure/connection"
import {
  FindLastGamesQueryModel,
  FindLastGamesQueryService,
} from "../query/findLastGamesQueryService"

const FIND_COUNT = 100

export class FindLastGamesUseCase {
  constructor(private _queryService: FindLastGamesQueryService) {}

  /**
   *
   * @returns
   */
  async run(): Promise<FindLastGamesQueryModel[]> {
    const conn = await connectMySQL()
    try {
      return await this._queryService.query(conn, FIND_COUNT)
    } finally {
      conn.end()
    }
  }
}
