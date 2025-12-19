import type { BinaryReaderLike } from "../../utils/fifa-util"

export class Bin_0XTC00CP_Id {
    Id = 0
    Unknown_1 = 0

    Name = ''
    InterfaceCrc = 0
    NumParameters = 0
    ParameterIds: number[] = []

    constructor()
    constructor(r: BinaryReaderLike)
    constructor(r?: BinaryReaderLike) {
        if (r) this.Load(r)
    }

    Load(r: BinaryReaderLike): boolean {
        this.Id = r.readInt32()
        this.Unknown_1 = r.readInt32()
        return true
    }
}