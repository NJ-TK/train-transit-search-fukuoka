import type { Handler } from '@netlify/functions'
import fs from 'fs'
import path from 'path'

export const handler: Handler = async (event: any, _context: any) => {
    const lineJsonPath = '../route-db/lines.json'
    const stationJsonPath = '../route-db/stations.json'

    const requestType = await event.queryStringParameters.requestType

    const headers: { [key: string]: string } = {
        'Access-Control-Allow-Origin': 'http://localhost:3000'
    }

    try {
        if (requestType === 'stations') {
            const stationJsonPath_ = path.resolve(__dirname, stationJsonPath);
            const stationsJson = fs.readFileSync(stationJsonPath_, 'utf-8');

            return {
                statusCode: 200,
                headers,
                body: stationsJson
            }
        } else {
            throw new Error('Invalid Parameter')
        }

    } catch (error: any) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        }
    }

}