import { Station } from "./Station"
import { Line } from "./Line"
import { StationList } from "./mapElementLists"

export class Graph {
    // 隣接する駅のリスト。キーがStation、値が<行き先の駅, Edgeクラス>のMap
    private _adjencyList: Map<Station, Map<Station, { cost: number, line: Line }>>
    constructor() {
        this._adjencyList = new Map()
    }

    public addNode(station: Station) {
        if (!this._adjencyList.has(station)) this._adjencyList.set(station, new Map())
    }

    public createNodeListFromStationList(stationList: StationList) {
        for (const id of stationList.idList) {
            const station = stationList.getStationById(id)
            this.addNode(station)
        }
    }

    public addEdge(node1: Station, node2: Station, cost: number, line: Line) {
        if (!this._adjencyList.has(node1)) throw new Error('Node1がグラフ上にありません！')
        const nodeNeighbors: Map<Station, { cost: number, line: Line }> = this._adjencyList.get(node1) || new Map()
        nodeNeighbors.set(node2, { cost, line })
        this._adjencyList.set(node1, nodeNeighbors)
    }

    public getNeighbors(station: Station) {
        return this._adjencyList.get(station)?.keys()
    }

    public getEdge(node1: Station, node2: Station) {
        return this._adjencyList.get(node1)?.get(node2)
    }

    get adjencyList() { return this._adjencyList }
}

export class Dijkstra {
    private graph: Graph
    constructor(graph: Graph) {
        this.graph = graph
    }

    getShortestRoute(originNode: Station, destinationNode: Station) {
        const distances: Map<Station, number> = new Map()
        const previousNodes: Map<Station, Station | null> = new Map()
        const priorityQueue = new PriorityQueue()

        // グラフの初期化
        for (const node of this.graph.adjencyList.keys()) {
            distances.set(node, ( node === originNode ? 0 : Infinity ))
            previousNodes.set(node, null)
            const distanceToEnqueue: number = distances.get(node) || Infinity 
            priorityQueue.enqueue(node, distanceToEnqueue)
        }

        // コスト最小ルートの計算
        let calculateCount = 0
        while (!priorityQueue.isEmpty() && calculateCount < 1000) {
            let node = priorityQueue.dequeue()
            if (typeof node === 'undefined') throw new Error('ルート探索中にエラー')
            console.log(node.name)
            
            // 目的地に到達したら、逆順にたどって経路を返す
            if (node === destinationNode) {
                const route: Station[] = new Array()
                const newNode = previousNodes.get(node)
                let calculateCount_ = 0
                while (newNode !== null && calculateCount_ < 10000) {
                    route.unshift(node)
                    node = newNode
                    if (typeof node === 'undefined') throw new Error('結果計算中にエラー')
                    calculateCount_ ++
                    if (calculateCount_ >= 10000) console.log(`${node.name}の計算中に死亡`)
                }
                route.unshift(originNode)
                return { route, distance: distances.get(destinationNode) }
            }

            const neighbors = this.graph.getNeighbors(node)
            if (typeof neighbors === 'undefined') throw new Error('近傍ノードの取得時にエラー')
            for (const neighbor of neighbors) {
                const currentDistance = distances.get(node)
                const additionalDistance = this.graph.getEdge(node, neighbor)?.cost
                const neighborDistance = distances.get(neighbor)
                if (typeof currentDistance === 'undefined' || typeof additionalDistance === 'undefined' ||
                    typeof neighborDistance === 'undefined') {
                    throw new Error('コストの計算中にエラー')
                }
                const newDistance = currentDistance + additionalDistance

                if (newDistance < neighborDistance) {
                    distances.set(neighbor, newDistance)
                    previousNodes.set(neighbor, node)
                    priorityQueue.enqueue(neighbor, newDistance)
                }
            }
            calculateCount++

        }

        // 到達不能
        return { route: new Array(), distance: Infinity }
    }
}

class PriorityQueue {
    private nodes: Array<{ node: Station; priority: number }> = new Array()

    enqueue(node: Station, priority: number) {
        this.nodes.push({ node, priority })
        this.sort()
    }
    dequeue() { return this.nodes.shift()?.node }
    isEmpty() { return this.nodes.length === 0 }

    private sort() {
        this.nodes.sort((a, b) => a.priority - b.priority)
    }
}