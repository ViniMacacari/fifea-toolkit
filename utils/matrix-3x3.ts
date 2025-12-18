export type Single = number

export class Vector3 {
    X: Single
    Y: Single
    Z: Single

    constructor()
    constructor(x: Single, y: Single, z: Single)
    constructor(x?: Single, y?: Single, z?: Single) {
        this.X = x ?? 0
        this.Y = y ?? 0
        this.Z = z ?? 0
    }
}

const CSng = (v: number): Single => Math.fround(v)

export class Matrix3x3 {
    private a: Single
    private b: Single
    private c: Single
    private d: Single
    private e: Single
    private f: Single
    private g: Single
    private h: Single
    private i: Single
    private m_Determinant: Single

    constructor(c00: number, c01: number, c02: number, c10: number, c11: number, c12: number, c20: number, c21: number, c22: number)
    constructor(c00: Single, c01: Single, c02: Single, c10: Single, c11: Single, c12: Single, c20: Single, c21: Single, c22: Single)
    constructor(c00: number, c01: number, c02: number, c10: number, c11: number, c12: number, c20: number, c21: number, c22: number) {
        this.a = CSng(c00)
        this.b = CSng(c01)
        this.c = CSng(c02)
        this.d = CSng(c10)
        this.e = CSng(c11)
        this.f = CSng(c12)
        this.g = CSng(c20)
        this.h = CSng(c21)
        this.i = CSng(c22)
        this.m_Determinant = 0
    }

    public ComputeDeterminant(): Single {
        this.m_Determinant = CSng((((this.a * ((this.e * this.i) - (this.f * this.h))) - (this.b * ((this.i * this.d) - (this.f * this.g)))) + (this.c * ((this.d * this.h) - (this.e * this.g)))))
        return this.m_Determinant
    }

    public Invert(): Matrix3x3 | null {
        this.ComputeDeterminant()

        if (this.m_Determinant !== 0) {
            const num: Single = CSng((((this.f * this.g) - (this.d * this.i)) / this.m_Determinant))
            const num2: Single = CSng((((this.d * this.h) - (this.e * this.g)) / this.m_Determinant))
            const num3: Single = CSng((((this.c * this.h) - (this.b * this.i)) / this.m_Determinant))
            const num4: Single = CSng((((this.a * this.i) - (this.c * this.g)) / this.m_Determinant))
            const num5: Single = CSng((((this.b * this.g) - (this.a * this.h)) / this.m_Determinant))
            const num6: Single = CSng((((this.b * this.f) - (this.c * this.e)) / this.m_Determinant))
            const num7: Single = CSng((((this.c * this.d) - (this.a * this.f)) / this.m_Determinant))

            return new Matrix3x3(
                CSng((((this.e * this.i) - (this.f * this.h)) / this.m_Determinant)),
                num,
                num2,
                num3,
                num4,
                num5,
                num6,
                num7,
                CSng((((this.a * this.e) - (this.b * this.d)) / this.m_Determinant))
            )
        }

        return null
    }

    public PostMultiply(v: Vector3): Vector3 {
        const num: Single = CSng((((this.d * v.X) + (this.e * v.Y)) + (this.f * v.Z)))
        return new Vector3(
            CSng((((this.a * v.X) + (this.b * v.Y)) + (this.c * v.Z))),
            num,
            CSng((((this.g * v.X) + (this.h * v.Y)) + (this.i * v.Z)))
        )
    }

    public PreMultiply(v: Vector3): Vector3 {
        const num: Single = CSng((((this.b * v.X) + (this.e * v.Y)) + (this.h * v.Z)))
        return new Vector3(
            CSng((((this.a * v.X) + (this.d * v.Y)) + (this.g * v.Z))),
            num,
            CSng((((this.c * v.X) + (this.f * v.Y)) + (this.i * v.Z)))
        )
    }

    public get Determinant(): Single {
        return this.m_Determinant
    }
}
