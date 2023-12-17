import { Station } from "./Station"
import { Line } from "./Line"

export class Graph {
    // 隣接する駅のリスト。キーがStation、値が<行き先の駅, そこまでのコスト>のMap
    private adjencyList: Map<Station, Map<Station, number>>
    constructor() {
        this.adjencyList = new Map()
    }

    public addNode(station: Station) {
        if (!this.adjencyList.has(station)) this.adjencyList.set(station, new Map())
    }

    public addEdge(node1: Station, node2: Station, cost: number) {
        if (!this.adjencyList.has(node1)) throw new Error('Node1がグラフ上にありません！')
        const nodeNeighbors: Map<Station, number> = this.adjencyList.get(node1) || new Map()
        nodeNeighbors.set(node2, cost)
        this.adjencyList.set(node1, nodeNeighbors)
    }

    public getNeighbors(station: Station) {
        return this.adjencyList.get(station)?.keys
    }

    public getWeight(node1: Station, node2: Station) {
        return this.adjencyList.get(node1)?.get(node2)
    }

}