export class Line {
    public name: string
    public nameKana: string | undefined
    public nameEn: string | undefined
    public refList: Array<string> | undefined
    public color: string | undefined
    public owner: string | undefined
    public type: string | undefined

    constructor(name: string, nameKana: string | undefined, nameEn: string | undefined) {
        this.name = name
        this.nameKana = nameKana
        this.nameEn = nameEn
    }
}