import fs from 'fs'
import util from 'util'

const promisifyReadFile = util.promisify(fs.readFile)

async function main() {
    // 「await」で約束が果たされるのを待つ
    const data = await promisifyReadFile('package.json')
    const fileContent = data.toString()
    console.log(fileContent)

    // // 「約束(Promise)」が果たされた(then)場合にCallbackの内容を実行
    // readFilePromise.then((data) => {
    //     // データを読み込んだ後、何をするか
    //     const fileContent = data.toString()
    //     console.log(fileContent)
    // })
}

main()