import { Line } from "./Line"

export class Station {
    private _id: number
    public name: string
    public nameKana: string | undefined
    public nameEn: string | undefined
    private linesAndRefs: Map<Line, Array<string>>

    constructor(id: number, name: string, nameKana: string | undefined, nameEn: string | undefined) {
        this._id = id
        this.name = name
        this.nameKana = nameKana
        this.nameEn = nameEn
        this.linesAndRefs = new Map()
    }

    public addLine(line: Line, ref: Array<string> | undefined) {
        this.linesAndRefs.set(line, (ref || new Array()))
    }

    get id() { return this._id }
    get lines() {
        return Array.from(this.linesAndRefs)
    }

    public getRefsOfLine(line: Line): Array<string> | undefined {
        return this.linesAndRefs.get(line)
    }
}