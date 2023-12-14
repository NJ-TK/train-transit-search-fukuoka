import type { Handler } from '@netlify/functions'

// any型の追加, _contextへの書き換え
export const handler: Handler = async (event: any, _context: any) => {
  // 追加
  const query: string = await event.queryStringParameters.q || 'No query'

  return {
    statusCode: 200,
    body: JSON.stringify({
      // queryに書き換え
      message: `Hello, ${query}!`
    })
  }
}