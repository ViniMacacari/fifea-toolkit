export type Vector3 = { x: number; y: number; z: number }
export type Vector4 = { x: number; y: number; z: number; w: number }

export interface FileReader {
    readVector3(): Vector3
    readVector4(): Vector4
    readUInt32(): number
}

export interface FileWriter {
    writeVector3(v: Vector3): void
    writeVector4(v: Vector4): void
    writeUInt32(v: number): void
}

export class BBox {
    min: Vector4
    max: Vector4

    constructor(r?: FileReader) {
        if (r) {
            this.min = r.readVector4()
            this.max = r.readVector4()
        } else {
            this.min = { x: 0, y: 0, z: 0, w: 0 }
            this.max = { x: 0, y: 0, z: 0, w: 0 }
        }
    }

    save(w: FileWriter) {
        w.writeVector4(this.min)
        w.writeVector4(this.max)
    }
}

export class AABBoxTemplate {
    min: Vector3
    max: Vector3

    private unused_1: number = 0
    private unused_2: number = 0

    constructor(r?: FileReader) {
        if (r) {
            this.min = r.readVector3()
            this.unused_1 = r.readUInt32() >>> 0
            this.max = r.readVector3()
            this.unused_2 = r.readUInt32() >>> 0
        } else {
            this.min = { x: 0, y: 0, z: 0 }
            this.max = { x: 0, y: 0, z: 0 }
        }
    }

    save(w: FileWriter) {
        w.writeVector3(this.min)
        w.writeUInt32(this.unused_1 >>> 0)
        w.writeVector3(this.max)
        w.writeUInt32(this.unused_2 >>> 0)
    }
}
