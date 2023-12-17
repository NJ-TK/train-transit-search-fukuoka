export class Line {
    private _id: number
    public name: string
    public nameKana: string | undefined
    public nameEn: string | undefined
    private _refList: Set<string> | undefined
    public color: string | undefined
    public owner: string | undefined
    private _type: string | undefined

    constructor(id: number, name: string, nameKana: string | undefined, nameEn: string | undefined) {
        this._id = id
        this.name = name
        this.nameKana = nameKana
        this.nameEn = nameEn
    }

    get id() { return this._id }
    set type(t: string | undefined) {
        const availableTypes = ['uJR', 'private', 'bullet', 'subway', 'monorail', 'tram', 'sightseeing']
        if (typeof t === 'undefined' || availableTypes.includes(t)) {
            this._type = t
        } else {
            this.type = undefined
        }
    }
    get type() { return this._type }

    addRefStr(ref: string) {
        this.refList?.add(ref)
    }
    get refList() { return this._refList }
}