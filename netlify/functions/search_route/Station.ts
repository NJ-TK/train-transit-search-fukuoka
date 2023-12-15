import { Line } from "./Line"

export class Station {
    public name: string
    public nameKana: string | undefined
    public nameEn: string | undefined
    private linesAndRefs: Map<Line, Array<string>>

    constructor(name: string, nameKana: string | undefined, nameEn: string | undefined) {
        this.name = name
        this.nameKana = nameKana
        this.nameEn = nameEn
        this.linesAndRefs = new Map()
    }

    public addLine(line: Line, ref: Array<string> | undefined) {
        this.linesAndRefs.set(line, (ref || new Array()))
    }

    get lines() {
        return this.linesAndRefs.keys
    }

    public getRefsOfLine(line: Line) {
        return this.linesAndRefs.get(line)
    }
}