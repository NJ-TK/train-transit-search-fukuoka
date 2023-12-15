import type { Handler } from '@netlify/functions'
import fs from 'fs'
import path from 'path'

// any型の追加, _contextへの書き換え
export const handler: Handler = async (event: any, _context: any) => {
  // 追加
  const query: string = await event.queryStringParameters.q || 'No query'

  // JSONを読んでみる
  try {
    // サーバー上のJSONファイルのパス
    const jsonFilePath = path.resolve(__dirname, '../hoge.json');

    // JSONファイルを読み込む
    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');

    const data = JSON.parse(jsonData)

    return {
        statusCode: 200,
        body: JSON.stringify({
        // queryに書き換え
        message: `Hello, ${query}!, ${data.foo}`
        })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }

}