import type { Handler } from '@netlify/functions'
import fs from 'fs'
import path from 'path'

import { Line } from "./Line"
import { Station } from "./Station"
import { LineList, StationList } from './mapElementLists'
import { Dijkstra, Graph } from "./Graph"

export const handler: Handler = async (event: any, _context: any) => {
    const lineJsonPath = '../route-db/lines.json'
    const stationJsonPath = '../route-db/stations.json'
    const routeJsonPath = '../route-db/routes.json'

    const query: string = await event.queryStringParameters.q || 'No query'

    try {
        const lineJsonPath_ = path.resolve(__dirname, lineJsonPath);
        const lineJson = fs.readFileSync(lineJsonPath_, 'utf-8');
        const rawLineList = JSON.parse(lineJson)

        const stationJsonPath_ = path.resolve(__dirname, stationJsonPath);
        const stationJson = fs.readFileSync(stationJsonPath_, 'utf-8');
        const rawStationList = JSON.parse(stationJson)

        const routeJsonPath_ = path.resolve(__dirname, routeJsonPath);
        const routeJson = fs.readFileSync(routeJsonPath_, 'utf-8');
        const rawRouteList = JSON.parse(routeJson)

        const lineList = new LineList()
        for (const line_ of rawLineList) {
            const line = new Line(line_.id, line_.name, line_.kana, line_.name_en)
            if (typeof line_.color === 'string') line.color = line_.color
            if (typeof line_.owner === 'string') line.owner = line_.owner
            if (typeof line_.ref === 'string') {
                const refs = line_.ref.split(' ')
                for (const ref of refs) {
                    line.addRefStr(ref)
                }
            }
            line.type = line_.type
            lineList.addLine(line)
        }

        const stationList = new StationList()
        for (const station_ of rawStationList) {
            const station = new Station(station_.id, station_.name, station_.name_kana, station_.name_en)
            station_.lines.forEach((lineId: number, index: number) => {
                const line = lineList.getLineById(lineId)
                let ref
                if (station_.refs) station_.refs[index]
                station.addLine(line, ref)
            });

            stationList.addStation(station)
        }

        console.log('計算開始')
        const graph = new Graph()
        graph.createNodeListFromStationList(stationList)
        for (const route_ of rawRouteList) {
            graph.addEdge(stationList.getStationById(route_.start), stationList.getStationById(route_.end),
                route_.time, lineList.getLineById(route_.line))
            if (route_.is_reversible) {
                graph.addEdge(stationList.getStationById(route_.end), stationList.getStationById(route_.start),
                    route_.time, lineList.getLineById(route_.line))
            }
        }

        const dijkstra = new Dijkstra(graph)
        const o = 3, d = 15
        const originStation = stationList.getStationById(o), destinationStation = stationList.getStationById(d)
        console.log(`${originStation.name}→${destinationStation.name}`)
        const result = dijkstra.getShortestRoute(originStation, destinationStation)
        // console.log(result)

        return {
            statusCode: 200,
            body: JSON.stringify({
                // queryに書き換え
                message: `Hello, ${query}!, ${stationList.getStationById(15).nameEn}`
            })
        }
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}