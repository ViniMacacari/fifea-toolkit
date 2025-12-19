import { FifaUtil } from "../utils/fifa-util"
import type { BinaryReaderLike, BinaryWriterLike } from "../utils/fifa-util"

export type Rx3Reader = BinaryReaderLike & {
    readUInt32(): number
}

export type Rx3Writer = BinaryWriterLike & {
    writeUInt32(value: number): void
    writeBytes(bytes: Uint8Array): void
}

export class Rx3BoneName {
    TotalSize: number = 0
    Unknown_1: number = 0
    Unknown_2: number = 0
    Unknown_3: number = 0
    Data: Uint8Array = new Uint8Array(0)

    private m_SwapEndian: any

    constructor()
    constructor(r: Rx3Reader)
    constructor(r?: Rx3Reader) {
        if (r) this.Load(r)
    }

    Load(r: Rx3Reader): boolean {
        this.TotalSize = r.readUInt32()
        this.Unknown_1 = r.readUInt32()
        this.Unknown_2 = r.readUInt32()
        this.Unknown_3 = r.readUInt32()

        this.Data = r.readBytes(this.TotalSize - 16)

        return true
    }

    Save(w: Rx3Writer): boolean {
        const BaseOffset: number = w.position

        w.writeUInt32(this.TotalSize >>> 0)
        w.writeUInt32(this.Unknown_1 >>> 0)
        w.writeUInt32(this.Unknown_2 >>> 0)
        w.writeUInt32(this.Unknown_3 >>> 0)

        w.writeBytes(this.Data)

        FifaUtil.writeAlignment16(w)

        this.TotalSize = FifaUtil.writeSectionTotalSize(w, BaseOffset, w.position, this.m_SwapEndian)

        return true
    }
}