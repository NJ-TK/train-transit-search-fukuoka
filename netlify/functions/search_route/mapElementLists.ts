import { Line } from "./Line";
import { Station } from "./Station";

export class LineList {
    private lineList: Record<number, Line>
    constructor() {
        this.lineList = {}
    }

    public addLine(line: Line) {
        if (this.lineList[line.id]) throw new Error(`すでにID${line.id}の路線は存在しています`)
        this.lineList[line.id] = line
    }
    public getLineById(id: number) {
        return this.lineList[id]
    }
}

export class StationList {
    private _stationList: Record<number, Station>
    constructor() {
        this._stationList = {}
    }

    public addStation(station: Station) {
        if (this._stationList[station.id]) throw new Error(`すでにID${station.id}の駅は存在しています`)
        this._stationList[station.id] = station
    }
    public getStationById(id: number) {
        return this._stationList[id]
    }
    get length() {
        return Object.keys(this._stationList).length
    }
    get idList() {
        return Object.keys(this._stationList).map((k) => Number(k))
    }
}