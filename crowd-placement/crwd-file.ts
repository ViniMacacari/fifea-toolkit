import * as fs from 'fs'
import { BinaryReaderLike, BinaryWriterLike, BufferReader, BufferWriter, FifaUtil } from '../utils/fifa-util'

export namespace CrowdDat {

    export class Vector3 {
        x: number = 0
        y: number = 0
        z: number = 0

        constructor(r?: BinaryReaderLike) {
            if (r) {
                this.x = FifaUtil.readFloat(r)
                this.y = FifaUtil.readFloat(r)
                this.z = FifaUtil.readFloat(r)
            }
        }

        save(w: BinaryWriterLike) {
            this.writeFloat(w, this.x)
            this.writeFloat(w, this.y)
            this.writeFloat(w, this.z)
        }

        private writeFloat(w: BinaryWriterLike, val: number) {
            const buffer = new ArrayBuffer(4)
            const view = new DataView(buffer)
            view.setFloat32(0, val, true)
            const bytes = new Uint8Array(buffer)
            w.writeBytes(bytes)
        }
    }

    export enum EVersion {
        TYPE_0103 = 0x103, // FIFA07 - 14
        TYPE_0104 = 0x104, // WC'14
        TYPE_0105 = 0x105  // FIFA 15 (or newer)
    }

    export class CrwdFileHeader {
        magic: string = "CRWD"
        version: EVersion = 0 as EVersion
        numSeats: number = 0

        get size(): number { return 10 }

        constructor(r?: BinaryReaderLike) {
            if (r) {
                this.load(r)
            }
        }

        load(r: BinaryReaderLike): boolean {
            const magicBytes = r.readBytes(4)
            this.magic = new TextDecoder().decode(magicBytes)

            if (this.magic !== "CRWD") {
                return false
            }

            this.version = r.readUInt16() as EVersion
            this.numSeats = r.readUInt32()

            return true
        }

        save(w: BinaryWriterLike): boolean {
            FifaUtil.writeNullTerminatedByteArray(w, this.magic, 4)
            w.writeInt16(this.version)
            w.writeUInt32(this.numSeats)
            return true
        }
    }

    export class Seat0103 {
        position: Vector3 = new Vector3()
        rotation: number = 0
        seatColor: Uint8Array = new Uint8Array(3)
        section: number = 0
        tier: number = 0
        attendance: number = 0
        influenceArea: number = 0
        unused: number = 0
        shade: number[] = new Array(4).fill(0)
        animgroups: number = 0
        numAccs: number = 0

        get size(): number { return 42 }

        constructor(r?: BinaryReaderLike) {
            if (r) this.load(r)
        }

        load(r: BinaryReaderLike): boolean {
            this.position = new Vector3(r)
            this.rotation = FifaUtil.readFloat(r)
            this.seatColor = r.readBytes(3)
            this.section = r.readByte()
            this.tier = r.readByte()
            this.attendance = r.readByte()
            this.influenceArea = r.readByte()
            this.unused = r.readByte()

            this.shade = new Array(4)
            for (let i = 0; i < 4; i++) {
                this.shade[i] = FifaUtil.readFloat(r)
            }

            this.animgroups = r.readByte()
            this.numAccs = r.readByte()
            return true
        }

        save(w: BinaryWriterLike): boolean {
            this.position.save(w)
            this.writeFloat(w, this.rotation)
            w.writeBytes(this.seatColor)
            w.writeByte(this.section)
            w.writeByte(this.tier)
            w.writeByte(this.attendance)
            w.writeByte(this.influenceArea)
            w.writeByte(this.unused)

            for (let i = 0; i < this.shade.length; i++) {
                this.writeFloat(w, this.shade[i])
            }

            w.writeByte(this.animgroups)
            w.writeByte(this.numAccs)
            return true
        }

        private writeFloat(w: BinaryWriterLike, val: number) {
            const buffer = new ArrayBuffer(4)
            new DataView(buffer).setFloat32(0, val, true)
            w.writeBytes(new Uint8Array(buffer))
        }
    }

    export class Seat0104 {
        position: Vector3 = new Vector3()
        rotation: number = 0
        seatColor: Uint8Array = new Uint8Array(3)
        section0: number = 0
        unknown_1: number = 0
        unknown_2: number = 0
        unknown_3: number = 0
        unknown_4: number = 0
        attendance: number = 0
        unknown_5: number[] = new Array(4).fill(0)

        get size(): number { return 41 }

        constructor(r?: BinaryReaderLike) {
            if (r) this.load(r)
        }

        load(r: BinaryReaderLike): boolean {
            this.position = new Vector3(r)
            this.rotation = FifaUtil.readFloat(r)
            this.seatColor = r.readBytes(3)
            this.section0 = r.readByte()
            this.unknown_1 = r.readByte()
            this.unknown_2 = r.readByte()
            this.unknown_3 = r.readByte()
            this.unknown_4 = r.readByte()
            this.attendance = r.readByte()

            this.unknown_5 = new Array(4)
            for (let i = 0; i < 4; i++) {
                this.unknown_5[i] = FifaUtil.readFloat(r)
            }
            return true
        }

        save(w: BinaryWriterLike): boolean {
            this.position.save(w)
            this.writeFloat(w, this.rotation)
            w.writeBytes(this.seatColor)
            w.writeByte(this.section0)
            w.writeByte(this.unknown_1)
            w.writeByte(this.unknown_2)
            w.writeByte(this.unknown_3)
            w.writeByte(this.unknown_4)
            w.writeByte(this.attendance)

            for (let i = 0; i < this.unknown_5.length; i++) {
                this.writeFloat(w, this.unknown_5[i])
            }
            return true
        }

        private writeFloat(w: BinaryWriterLike, val: number) {
            const buffer = new ArrayBuffer(4)
            new DataView(buffer).setFloat32(0, val, true)
            w.writeBytes(new Uint8Array(buffer))
        }
    }

    export class Seat0105 {
        position: Vector3 = new Vector3()
        rotation: number = 0
        seatColor: Uint8Array = new Uint8Array(3)
        section0: number = 0
        section1: number = 0
        tier: number = 0
        attendance: number = 0
        noChair: number = 0
        cardColors: Uint8Array = new Uint8Array(3)
        crowdPattern: number = 0
        pad: Uint8Array = new Uint8Array(4)

        get size(): number { return 32 }

        constructor(r?: BinaryReaderLike) {
            if (r) this.load(r)
        }

        load(r: BinaryReaderLike): boolean {
            this.position = new Vector3(r)
            this.rotation = FifaUtil.readFloat(r)
            this.seatColor = r.readBytes(3)
            this.section0 = r.readByte()
            this.section1 = r.readByte()
            this.tier = r.readByte()
            this.attendance = r.readByte()
            this.noChair = r.readByte()
            this.cardColors = r.readBytes(3)
            this.crowdPattern = r.readByte()
            this.pad = r.readBytes(4)
            return true
        }

        save(w: BinaryWriterLike): boolean {
            this.position.save(w)
            this.writeFloat(w, this.rotation)
            w.writeBytes(this.seatColor)
            w.writeByte(this.section0)
            w.writeByte(this.section1)
            w.writeByte(this.tier)
            w.writeByte(this.attendance)
            w.writeByte(this.noChair)
            w.writeBytes(this.cardColors)
            w.writeByte(this.crowdPattern)
            w.writeBytes(this.pad)
            return true
        }

        private writeFloat(w: BinaryWriterLike, val: number) {
            const buffer = new ArrayBuffer(4)
            new DataView(buffer).setFloat32(0, val, true)
            w.writeBytes(new Uint8Array(buffer))
        }
    }

    // Interface para FifaFile
    export interface FifaFile {
        isCompressed: boolean
        decompress(): void
        getReader(): BinaryReaderLike
        releaseReader(r: BinaryReaderLike): void
    }

    export class CrwdFile {
        header: CrwdFileHeader = new CrwdFileHeader()
        crowdData: (Seat0103 | Seat0104 | Seat0105)[] = []

        load(fileName: string): boolean
        load(fifaFile: FifaFile): boolean
        load(r: BinaryReaderLike): boolean
        load(arg: string | FifaFile | BinaryReaderLike): boolean {
            if (typeof arg === 'string') {
                return this.loadFromFile(arg)
            } else if (this.isFifaFile(arg)) {
                return this.loadFromFifaFile(arg)
            } else {
                return this.loadFromReader(arg)
            }
        }

        private loadFromFile(fileName: string): boolean {
            const buffer = fs.readFileSync(fileName)
            const r = new BufferReader(buffer)
            const flag = this.loadFromReader(r)
            return flag
        }

        private loadFromFifaFile(fifaFile: FifaFile): boolean {
            if (fifaFile.isCompressed) {
                fifaFile.decompress()
            }
            const r = fifaFile.getReader()
            const flag = this.loadFromReader(r)
            fifaFile.releaseReader(r)
            return flag
        }

        private loadFromReader(r: BinaryReaderLike): boolean {
            this.header = new CrwdFileHeader(r)

            this.crowdData = []
            for (let i = 0; i < this.header.numSeats; i++) {
                switch (this.header.version) {
                    case EVersion.TYPE_0103:
                        this.crowdData.push(new Seat0103(r))
                        break
                    case EVersion.TYPE_0104:
                        this.crowdData.push(new Seat0104(r))
                        break
                    case EVersion.TYPE_0105:
                        this.crowdData.push(new Seat0105(r))
                        break
                }
            }
            return true
        }

        save(w: BinaryWriterLike): boolean
        save(fileType: EVersion, w: BinaryWriterLike): boolean
        save(fileName: string): boolean
        save(fileName: string, fileType: EVersion): boolean
        save(arg1: BinaryWriterLike | EVersion | string, arg2?: BinaryWriterLike | EVersion): boolean {
            if (this.isWriter(arg1) && arg2 === undefined) {
                return this.saveToWriter(this.header.version, arg1)
            }
            if (typeof arg1 === 'number' && this.isWriter(arg2)) {
                return this.saveToWriter(arg1, arg2)
            }
            if (typeof arg1 === 'string' && arg2 === undefined) {
                return this.saveToFile(arg1, this.header.version)
            }
            if (typeof arg1 === 'string' && typeof arg2 === 'number') {
                return this.saveToFile(arg1, arg2)
            }
            return false
        }

        private saveToWriter(fileType: EVersion, w: BinaryWriterLike): boolean {
            this.header.version = fileType
            this.header.numSeats = this.crowdData.length

            this.header.save(w)

            for (let i = 0; i < this.header.numSeats; i++) {
                const seat = this.crowdData[i]
                switch (this.header.version) {
                    case EVersion.TYPE_0103:
                        (seat as Seat0103).save(w)
                        break
                    case EVersion.TYPE_0104:
                        (seat as Seat0104).save(w)
                        break
                    case EVersion.TYPE_0105:
                        (seat as Seat0105).save(w)
                        break
                }
            }
            return true
        }

        private saveToFile(fileName: string, fileType: EVersion): boolean {
            const w = new BufferWriter()
            const flag = this.saveToWriter(fileType, w)

            const buffer = w.toUint8Array()
            fs.writeFileSync(fileName, buffer)

            return flag
        }

        private isFifaFile(arg: any): arg is FifaFile {
            return arg && typeof arg.getReader === 'function'
        }

        private isWriter(arg: any): arg is BinaryWriterLike {
            return arg && typeof arg.writeBytes === 'function'
        }
    }
}