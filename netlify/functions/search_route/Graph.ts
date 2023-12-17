import { Station } from "./Station"
import { Line } from "./Line"
import { LineList, StationList } from "./mapElementLists"

interface Edge {
    origin: Station
    destination: Station
    time: number
    line: Line
}
export class Graph {
    // 隣接する駅のリスト。キーがStation、値が<行き先の駅, Edgeクラス>のMap
    private routeMap: Array<Edge>
    constructor() {
        this.routeMap = new Array()
    }
    public addEdge(node1: Station, node2: Station, cost: number, line: Line) {
        this.routeMap.push({
            origin: node1,
            destination: node2,
            time: cost,
            line: line
        })
    }

    public getEdgesFromStation(station: Station, useBulletTrain: boolean = true, useJR: boolean = true,
        usePrivateTrain: boolean = true, useSubwayAndMonorail: boolean = true): Array<Edge> {
        let result: Array<Edge> = new Array()
        for (const edge of this.routeMap) {
            if (!useBulletTrain && edge.line.type === 'bullet') continue
            if (!useJR && edge.line.type === 'JR') continue
            if (!usePrivateTrain && edge.line.type === 'private') continue
            if (!useSubwayAndMonorail && (edge.line.type === 'subway' || edge.line.type === 'monorail')) continue

            if (edge.origin === station) {
                result.push(edge)
            }
        }
        return result
    }
}

export class Dijkstra {
    private graph: Graph
    constructor(graph: Graph) {
        this.graph = graph
    }

    public findRoute(origin: Station, destination: Station, useBulletTrain: boolean = true, useJR: boolean = true,
        usePrivateTrain: boolean = true, useSubwayAndMonorail: boolean = true, transferTime: number = 0,
        transferCost: number = 0) {
        const distances = new Distances(transferTime, transferCost)
        let currentStation = origin
        let distanceToCurrentStation = 0, costToCurrentStation = 0
        let n = 0
        while (n <= 1000) {
            const edgesFromCurrentStation = this.graph.getEdgesFromStation(currentStation, useBulletTrain,
                useJR, usePrivateTrain, useSubwayAndMonorail)
            for (const edge of edgesFromCurrentStation) {
                distances.setDistanceIfCostIsMinimum(edge.destination, distanceToCurrentStation + edge.time,
                    costToCurrentStation + edge.time, currentStation, edge)
            }
            const minCostStation = distances.getMinCostStation(true)
            if (!minCostStation) break
            currentStation = minCostStation
            const costProperties = distances.getDistanceOfStation(currentStation)
            if (!costProperties) throw new Error('Cannot Find Distance Data')
            distanceToCurrentStation = costProperties.distance
            costToCurrentStation = costProperties.cost
            n++
        }

        // 逆にたどって経路を求める
        n = 0
        currentStation = destination
        const distanceToDestination = distances.getDistanceOfStation(destination)
        const resultEdgeList: Array<Edge> = new Array()
        const resultTimeList: Array<number> = new Array()
        const resultCostList: Array<number> = new Array()
        if (typeof distanceToDestination?.previousEdge === 'undefined') return false
        let resultStationList: Array<Station> = [currentStation]
        while (n <= 1000) {
            const distanceProperties = distances.getDistanceOfStation(currentStation)
            const from = distanceProperties?.from
            if (!from || !distanceProperties.previousEdge) throw new Error('Cannot find "from" staton')
            currentStation = from
            resultTimeList.unshift(distanceProperties.distance)
            resultCostList.unshift(distanceProperties.cost)
            resultStationList.unshift(currentStation)
            resultEdgeList.unshift(distanceProperties.previousEdge)
            if (currentStation === origin) break
            n++
        }
        resultTimeList.unshift(0)
        return { times: resultTimeList, stations: resultStationList, edges: resultEdgeList, costs: resultCostList }
    }
}

interface DistanceProperties {
    station: Station
    cost: number
    distance: number
    from: Station | null
    previousEdge: Edge | null
    isSmallest: boolean
}
class Distances {
    private _transferTime: number
    private _transferCost: number
    private distances: Array<DistanceProperties>
    private previousEdgeOfStation: Map<Station, Edge>
    constructor(transferTime: number = 0, transferCost: number = transferTime) {
        this._transferTime = transferTime
        this._transferCost = transferCost
        this.distances = new Array()
        this.previousEdgeOfStation = new Map()
    }
    getDistanceOfStation(station: Station): DistanceProperties | null {
        for (const cost of this.distances) {
            if (cost.station === station) return cost
        }
        return null
    }
    setDistanceIfCostIsMinimum(station: Station, distance: number, cost: number, previousStation: Station, previousEdge: Edge) {
        let additionalDistance = 0, additionalCost = 0 // 乗換によって加算される
        if (this._transferCost) {
            const secondPreviousEdge = this.previousEdgeOfStation.get(previousStation)
            if (secondPreviousEdge) {
                if (previousEdge.line !== secondPreviousEdge.line) {
                    // 乗換直後の停車駅ならば
                    additionalDistance = this._transferTime
                    additionalCost = this._transferCost
                }
            }
        }

        const currentDistancePropaties = this.getDistanceOfStation(station)
        if (currentDistancePropaties) {
            if (cost + additionalCost < currentDistancePropaties.cost) {
                // 今までのコストより小さければ書き直す
                currentDistancePropaties.cost = cost + additionalCost
                currentDistancePropaties.distance = distance + additionalDistance
                currentDistancePropaties.from = previousStation
                currentDistancePropaties.previousEdge = previousEdge
            }
        } else {
            // まだその駅に関するdistanceデータがなければ追加
            this.distances.push({
                station: station,
                cost: cost + additionalCost,
                distance: distance + additionalDistance,
                from: previousStation,
                previousEdge: previousEdge,
                isSmallest: false
            })
        }
    }
    setIsSmallestOfStation(station: Station, isSmallest: boolean) {
        const distanceProperties = this.getDistanceOfStation(station)
        if (distanceProperties) {
            distanceProperties.isSmallest = isSmallest
        } else {
            // まだその駅に関するdistanceデータがなければ追加
            this.distances.push({
                station: station,
                cost: Infinity,
                distance: Infinity,
                from: null,
                previousEdge: null,
                isSmallest: isSmallest
            })
        }
    }
    getMinCostStation(setIsSmallestOfMinCostStation: boolean = false): Station | null {
        let minCost = Infinity, minCostStation = null
        for (const costProperties of this.distances) {
            if (!costProperties.isSmallest && (costProperties.cost < minCost)) {
                minCost = costProperties.cost
                if (setIsSmallestOfMinCostStation) costProperties.isSmallest = true
                return costProperties.station
            }
        }
        return null
    }
}