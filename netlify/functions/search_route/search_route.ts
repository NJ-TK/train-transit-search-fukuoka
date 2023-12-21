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
                station.addLine(line, station_.refs ? station_.refs[index]:null)
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

        let transferTime = 5
        if (!isNaN(event.queryStringParameters.transferTime)) transferTime = Number(event.queryStringParameters.transferTime)
        let mode = 1
        const queryParamMode = event.queryStringParameters.mode
        if (queryParamMode === '0' || queryParamMode === '1' || queryParamMode === '2') mode = Number(event.queryStringParameters.queryParamMode)
        const useBulletTrain = !(event.queryStringParameters.useBulletTrain === 'false')
        const useJR = !(event.queryStringParameters.useJR === 'false')
        const usePrivateTrain = !(event.queryStringParameters.usePrivateTrain === 'false')
        const useSubwayAndMonorail = !(event.queryStringParameters.useSubwayAndMonorail === 'false')
        let transferCost = 5
        if (mode === 0) transferCost = 3
        else if (mode === 2) transferCost = 10000
        
        const result = dijkstra.findRoute(originStation, destinationStation, useBulletTrain, useJR, usePrivateTrain,useSubwayAndMonorail,
            transferTime, )
        if (!result) throw new Error('Error in route search!')

        let previousLine: Line | null = null
        interface ResponseStation {
            type: string,
            id: number, name: string, name_kana: string | undefined, name_en: string | undefined,
            refs: (string | null | undefined)[], time: number,
            colors: (string | undefined)[], is_connected_line_bullet: (boolean | undefined)[],
            hasPreviousLine: boolean, hasNextLine: boolean
        }
        interface ResponseLine {
            type: string,
            lineId: number, line_name: string, line_name_en: string | undefined, line_name_kana: string | undefined,
            ref: string, owner: string | undefined, pass_stations: ResponseStation[], line_color: string | undefined,
            line_type: string | undefined
        }

        // 最終出力用の配列を定義
        const responseRoute: (ResponseStation | ResponseLine)[] = new Array()

        let responseLine: ResponseLine | null = null
        for (const [index, station] of result.stations.entries()) {
            let refs: (string | null | undefined)[] = new Array() // 表示する路線記号(通常1つ、乗換駅なら2つ(出発・到着駅除く))
            let colors: (string | undefined)[] = new Array()
            let isConnectedLineBullet: (boolean | undefined)[] = new Array()
            const nextLine = result.edges[index] ? result.edges[index].line : null
            let hasPreviousLine = false, hasNextLine = false
            
            if (previousLine !== nextLine) { // 乗換駅or最初の駅or最後の駅の場合
                // 現在の駅をresponseRouteに追加する
                if (previousLine && nextLine) { // 乗換駅の場合
                    refs = [station.getRefOfLine(previousLine), 
                                station.getRefOfLine(nextLine)]
                    colors = [previousLine.color, nextLine.color]
                    isConnectedLineBullet = [previousLine.type === 'bullet', nextLine.type === 'bullet']
                    hasPreviousLine = true, hasNextLine = true
                } else if (previousLine === null && nextLine) { // 最初の駅の場合
                    refs = [undefined, station.getRefOfLine(nextLine)]
                    colors = [undefined, nextLine?.color]
                    isConnectedLineBullet = [undefined, nextLine?.type === 'bullet']
                    hasPreviousLine = false, hasNextLine = true
                } else if (previousLine) { // 最後の駅の場合
                    refs = [station.getRefOfLine(previousLine), undefined]
                    colors = [previousLine.color, undefined]
                    isConnectedLineBullet = [previousLine.type === 'bullet', undefined]
                    hasPreviousLine = true, hasNextLine = false
                }
                const responseStation: ResponseStation = {
                    type: 'station', id: station.id,
                    name: station.name, name_kana: station.nameKana, name_en: station.nameEn,
                    refs: refs, time: result.times[index],
                    colors: colors,
                    is_connected_line_bullet: isConnectedLineBullet,
                    hasPreviousLine: hasPreviousLine, hasNextLine: hasNextLine
                }
                responseRoute.push(responseStation)

                // 最後の駅でなければ、次の路線情報をresponseRouteに入れる
                if (nextLine) {
                    responseLine = {
                        type: 'line', lineId: nextLine.id,
                        line_name: nextLine.name, line_name_kana: nextLine.nameKana, line_name_en: nextLine.nameEn,
                        ref: nextLine.refList?.join(',') || '', owner: nextLine.owner, pass_stations: new Array(),
                        line_color: nextLine.color, line_type: nextLine.type
                    }
                    if (responseLine) responseRoute.push(responseLine)
                }
            } else { // 途中駅の場合
                const refs: string[] = nextLine ? [station.getRefOfLine(nextLine)] : new Array()
                const responseStation: ResponseStation = {
                    type: 'station', id: station.id,
                    name: station.name, name_kana: station.nameKana, name_en: station.nameEn,
                    refs: refs, time: result.times[index],
                    colors: [nextLine?.color],
                    is_connected_line_bullet: [nextLine?.type === 'bullet'],
                    hasPreviousLine: true, hasNextLine: true                    
                }
                // 直前でresponseRouteにpushされたresponseLineのpass_stationsに追加
                responseLine?.pass_stations.push(responseStation)
            }

            previousLine = nextLine
        }

        const responseObject = {
            originStationId: originStation.id, originStationName: originStation.name,
            destinationStationId: destinationStation.id, destinationStationName: destinationStation.name,
            requiredTime: result.times[result.times.length - 1],
            route: responseRoute
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