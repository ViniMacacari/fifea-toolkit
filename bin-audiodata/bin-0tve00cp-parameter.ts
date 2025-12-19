import type { BinaryReaderLike } from "../utils/fifa-util"

export enum BinParameterType {
    EnumBit = 0,
    Int = 1
}

export class Bin_0TVE00CP_ParameterValue {
    Name = ''
    Value = 0
}

export class Bin_0TVE00CP_Parameter {
    static BinParameterType = BinParameterType

    Id = 0
    Name = ''
    Type: BinParameterType = BinParameterType.Int
    NumValues = 0
    ParameterValues: Bin_0TVE00CP_ParameterValue[] = []

    constructor()
    constructor(r: BinaryReaderLike)
    constructor(r?: BinaryReaderLike) {
        if (r) this.Load(r)
    }

    Load(r: BinaryReaderLike): boolean {
        return true
    }
}