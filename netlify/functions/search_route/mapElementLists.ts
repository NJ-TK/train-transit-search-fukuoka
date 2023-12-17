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
    private stationList: Record<number, Station>
    constructor() {
        this.stationList = {}
    }
    
    public addStation(station: Station) {
        if (this.stationList[station.id]) throw new Error(`すでにID${station.id}の駅は存在しています`)
        this.stationList[station.id] = station
    }
    public getStationById(id: number) {
        return this.stationList[id]
    }
}