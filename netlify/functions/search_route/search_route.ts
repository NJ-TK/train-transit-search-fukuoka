import type { Handler } from '@netlify/functions'
import fs from 'fs'
import path from 'path'

import { Line } from "./Line"
import { Station } from "./Station"
import { Graph } from "./Graph"

export const handler: Handler = async (event: any, _context: any) => {
    const lineJsonPath = '../route-db/lines.json'
    const stationJsonPath = '../route-db/stations.json'
    const routeJsonPath = '../route-db/routes.json'

    const query: string = await event.queryStringParameters.q || 'No query'

    try {
        const lineJsonPath_ = path.resolve(__dirname, lineJsonPath);
        const lineJson = fs.readFileSync(lineJsonPath_, 'utf-8');
        const lines = JSON.parse(lineJson)
        
        const stationJsonPath_ = path.resolve(__dirname, stationJsonPath);
        const stationJson = fs.readFileSync(stationJsonPath_, 'utf-8');
        const stations = JSON.parse(stationJson)

        const routeJsonPath_ = path.resolve(__dirname, routeJsonPath);
        const routeJson = fs.readFileSync(routeJsonPath_, 'utf-8');
        const routes = JSON.parse(routeJson)

        const graph = new Graph()

        for (const station_ of stations) {
            const station = new Station(station_.name, station_.name_kana, station_.name_en)
            // TODO
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                // queryに書き換え
                message: `Hello, ${query}!, ${data[0].name}`
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}