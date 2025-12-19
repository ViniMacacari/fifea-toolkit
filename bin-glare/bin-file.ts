import { BinaryReaderLike, FifaUtil } from '../utils/fifa-util'

export namespace GlareBin {

    export class Vector4 {
        x: number = 0
        y: number = 0
        z: number = 0
        w: number = 0

        constructor(r?: BinaryReaderLike) {
            if (r) {
                this.x = FifaUtil.readFloat(r)
                this.y = FifaUtil.readFloat(r)
                this.z = FifaUtil.readFloat(r)
                this.w = FifaUtil.readFloat(r)
            }
        }
    }

    export class Matrix4x4 {
        m: number[] = new Array(16).fill(0)

        constructor(r?: BinaryReaderLike) {
            if (r) {
                for (let i = 0; i < 16; i++) {
                    this.m[i] = FifaUtil.readFloat(r)
                }
            }
        }
    }

    export interface FifaFile {
        isCompressed: boolean
        decompress(): void
        getReader(): BinaryReaderLike
        releaseReader(r: BinaryReaderLike): void
    }

    export class BinFile {
        version: number = 0
        id: number = 0
        texture: string = ""
        startSize: number = 0
        endSize: number = 0
        quantity: number = 0
        offset: number = 0
        startColor: Vector4 = new Vector4()
        endColor: Vector4 = new Vector4()
        sensitivity: number = 0
        bloomScale: number = 0
        zTest: number = 0
        transform: Matrix4x4 = new Matrix4x4()
        offsetStart: number = 0
        offsetScale: number = 0
        edgeSensitivityStart: number = 0
        edgeSensitivityEnd: number = 0
        occlusionSensitivity: number = 0
        occlusionOffsetX: number = 0
        occlusionOffsetY: number = 0
        occlusionOffsetZ: number = 0
        xRot: number = 0
        yRot: number = 0
        zRot: number = 0
        startSizeRandomness: number = 0
        endSizeRandomness: number = 0
        quantityRandomness: number = 0
        offsetRandomness: number = 0
        startColorRandomness: number = 0
        endColorRandomness: number = 0
        opacityRandomness: number = 0
        sensitivityRandomness: number = 0
        edgeSensitivityRandomness: number = 0
        bloomScaleRandomness: number = 0
        seed: number = 0
        blendType: number = 0
        rotation: number = 0
        group: number = 0
        rotationRandomness: number = 0
        occlusionQueryOverride: number = 0
        rotationRate: number = 0
        xScale: number = 0
        yScale: number = 0
        futureExpansion: number[] = new Array(9).fill(0)

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
            try {
                // Mock implementation for FileStream/FileReader creation
                // In a real Node environment you would create a buffer here
                // const buffer = fs.readFileSync(fileName)
                // const reader = ... create reader from buffer ...
                // return this.load(reader)
                return false
            } catch (e) {
                return false
            }
        }

        private loadFromFifaFile(fifaFile: FifaFile): boolean {
            if (fifaFile.isCompressed) {
                fifaFile.decompress()
            }
            const r = fifaFile.getReader()

            // Assume Endian.Big is handled by the reader implementation or configuration
            // r.endianness = Endian.Big 

            const flag = this.loadFromReader(r)
            fifaFile.releaseReader(r)

            return flag
        }

        private loadFromReader(r: BinaryReaderLike): boolean {
            this.version = r.readInt32()
            this.id = r.readInt32()
            this.texture = FifaUtil.readString(r, 64)
            this.startSize = FifaUtil.readFloat(r)
            this.endSize = FifaUtil.readFloat(r)
            this.quantity = r.readInt32()
            this.offset = FifaUtil.readFloat(r)
            this.startColor = new Vector4(r)
            this.endColor = new Vector4(r)
            this.sensitivity = FifaUtil.readFloat(r)
            this.bloomScale = FifaUtil.readFloat(r)
            this.zTest = r.readUInt32()
            this.transform = new Matrix4x4(r)
            this.offsetStart = FifaUtil.readFloat(r)
            this.offsetScale = FifaUtil.readFloat(r)
            this.edgeSensitivityStart = FifaUtil.readFloat(r)
            this.edgeSensitivityEnd = FifaUtil.readFloat(r)
            this.occlusionSensitivity = FifaUtil.readFloat(r)
            this.occlusionOffsetX = FifaUtil.readFloat(r)
            this.occlusionOffsetY = FifaUtil.readFloat(r)
            this.occlusionOffsetZ = FifaUtil.readFloat(r)
            this.xRot = FifaUtil.readFloat(r)
            this.yRot = FifaUtil.readFloat(r)
            this.zRot = FifaUtil.readFloat(r)
            this.startSizeRandomness = FifaUtil.readFloat(r)
            this.endSizeRandomness = FifaUtil.readFloat(r)
            this.quantityRandomness = FifaUtil.readFloat(r)
            this.offsetRandomness = FifaUtil.readFloat(r)
            this.startColorRandomness = FifaUtil.readFloat(r)
            this.endColorRandomness = FifaUtil.readFloat(r)
            this.opacityRandomness = FifaUtil.readFloat(r)
            this.sensitivityRandomness = FifaUtil.readFloat(r)
            this.edgeSensitivityRandomness = FifaUtil.readFloat(r)
            this.bloomScaleRandomness = FifaUtil.readFloat(r)
            this.seed = r.readInt32()
            this.blendType = r.readInt32()
            this.rotation = FifaUtil.readFloat(r)
            this.group = r.readInt32()
            this.rotationRandomness = FifaUtil.readFloat(r)
            this.occlusionQueryOverride = r.readUInt32()
            this.rotationRate = FifaUtil.readFloat(r)
            this.xScale = FifaUtil.readFloat(r)
            this.yScale = FifaUtil.readFloat(r)

            this.futureExpansion = new Array(9)
            for (let i = 0; i < 9; i++) {
                this.futureExpansion[i] = r.readInt32()
            }

            return true
        }

        private isFifaFile(arg: any): arg is FifaFile {
            return arg && typeof arg.getReader === 'function'
        }
    }
}