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

    const originId: number = await Number(event.queryStringParameters.origin)
    const destinationId = await Number(event.queryStringParameters.destination)

    const headers: { [key: string]: string } = {
        'Access-Control-Allow-Origin': 'http://localhost:3000'
    }

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
                station.addLine(line, station_.refs ? station_.refs[index]:undefined)
            });

            stationList.addStation(station)
        }

        const originStation = stationList.getStationById(originId)
        const destinationStation = stationList.getStationById(destinationId)
        if (!originStation || !destinationStation) {
            throw new Error('Station Parameter(s) Invalid!')
        }

        console.log('計算開始')
        const graph = new Graph()
        
        for (const route_ of rawRouteList) {
            graph.addEdge(stationList.getStationById(route_.start), stationList.getStationById(route_.end),
                route_.time, lineList.getLineById(route_.line))
            if (route_.is_reversible) {
                graph.addEdge(stationList.getStationById(route_.end), stationList.getStationById(route_.start),
                    route_.time, lineList.getLineById(route_.line))
            }
        }

        const dijkstra = new Dijkstra(graph)
        console.log(`${originStation.name}→${destinationStation.name}`)
        const result = dijkstra.findRoute(originStation, destinationStation)
        if (!result) throw new Error('Error in route search!')

        const responseObject = {
            stations: new Array(),
            routes: new Array(),
            times: result.times
        }
        let previousLine: Line | null = null
        for (const [index, station] of result.stations.entries()) {
            let refs: Array<string | undefined> = [] // 表示する路線記号(通常1つ、乗換駅なら2つ(出発・到着駅除く))
            const nextLine = result.edges[index] ? result.edges[index].line : null
            const isTransfer = (previousLine !== null && previousLine !== nextLine)
            if (isTransfer && previousLine && nextLine) { // 乗換駅の場合
                refs = [station.getRefsOfLine(previousLine), 
                            station.getRefsOfLine(nextLine)]
            } else if (nextLine === null) { // 最後の駅の場合
                refs = [previousLine ? station.getRefsOfLine(previousLine) : undefined]
            } else { // それ以外の途中駅の場合
                const ref_ = station.getRefsOfLine(nextLine)
                refs = [ref_ ? ref_ : undefined]
            }
            responseObject.stations.push({
                id: station.id,
                name: station.name,
                name_kana: station.nameKana,
                name_en: station.nameEn,
                refs: refs,
                isTransfer: isTransfer
            })
            previousLine = nextLine
        }
        for (const edge of result.edges) {
            responseObject.routes.push({
                time: edge.time,
                name: edge.line.name,
                name_kana: edge.line.nameKana,
                name_en: edge.line.nameEn,
                ref: (edge.line.refList ? edge.line.refList.join(',') : undefined),
                type: edge.line.type
            })
        }
        const responseJson = JSON.stringify(responseObject)

        return {
            statusCode: 200,
            headers,
            body: responseJson
        }
    } catch (error: any) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        }
    }
}