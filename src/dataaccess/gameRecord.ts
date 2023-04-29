// 「export」は他のファイルから読み込んで使うための書き方
export class GameRecord {
  constructor(private _id: number, private _startedAt: Date) {}

  get id() {
    return this._id
  }
}
