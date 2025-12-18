import { Vector3, Vector4 } from './matrix'

export type UInteger = number

export interface FileReader {
    ReadVector4(): Vector4
    ReadVector3(): Vector3
    ReadUInt32(): UInteger
}

export interface FileWriter {
    Write(value: Vector4): void
    Write(value: Vector3): void
    Write(value: UInteger): void
}

export class Matrix4x4 {
    public X_Axis!: Vector4
    public Y_Axis!: Vector4
    public Z_Axis!: Vector4
    public W_Axis!: Vector4

    constructor()
    constructor(r: FileReader)
    constructor(r?: FileReader) {
        if (r) {
            this.X_Axis = r.ReadVector4()
            this.Y_Axis = r.ReadVector4()
            this.Z_Axis = r.ReadVector4()
            this.W_Axis = r.ReadVector4()
        }
    }

    public Save(w: FileWriter): void {
        w.Write(this.X_Axis)
        w.Write(this.Y_Axis)
        w.Write(this.Z_Axis)
        w.Write(this.W_Axis)
    }
}

export class Matrix4x4Affine {
    public X_Axis!: Vector3
    private Unused_1: UInteger = 0
    public Y_Axis!: Vector3
    private Unused_2: UInteger = 0
    public Z_Axis!: Vector3
    private Unused_3: UInteger = 0
    public W_Axis!: Vector3
    private Unused_4: UInteger = 0

    constructor()
    constructor(r: FileReader)
    constructor(r?: FileReader) {
        if (r) {
            this.X_Axis = r.ReadVector3()
            this.Unused_1 = r.ReadUInt32()
            this.Y_Axis = r.ReadVector3()
            this.Unused_2 = r.ReadUInt32()
            this.Z_Axis = r.ReadVector3()
            this.Unused_3 = r.ReadUInt32()
            this.W_Axis = r.ReadVector3()
            this.Unused_4 = r.ReadUInt32()
        }
    }

    public Save(w: FileWriter): void {
        w.Write(this.X_Axis)
        w.Write(this.Unused_1)
        w.Write(this.Y_Axis)
        w.Write(this.Unused_2)
        w.Write(this.Z_Axis)
        w.Write(this.Unused_3)
        w.Write(this.W_Axis)
        w.Write(this.Unused_4)
    }
}
