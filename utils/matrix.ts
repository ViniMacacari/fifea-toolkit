export type Single = number

export class Vector3 {
    X: Single
    Y: Single
    Z: Single

    constructor()
    constructor(X: Single, Y: Single, Z: Single)
    constructor(X?: Single, Y?: Single, Z?: Single) {
        this.X = X ?? 0
        this.Y = Y ?? 0
        this.Z = Z ?? 0
    }
}

export class Vector4 {
    X: Single
    Y: Single
    Z: Single
    W: Single

    constructor()
    constructor(X: Single, Y: Single, Z: Single, W: Single)
    constructor(X?: Single, Y?: Single, Z?: Single, W?: Single) {
        this.X = X ?? 0
        this.Y = Y ?? 0
        this.Z = Z ?? 0
        this.W = W ?? 0
    }
}

export interface FileReader {
    ReadSingle(): Single
}

export interface FileWriter {
    Write(value: Single): void
}

const CSng = (v: number): Single => Math.fround(v)

export class Matrix {
    public m: Single[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]

    constructor()
    constructor(other: Matrix)
    constructor(other?: Matrix) {
        if (other) this.copy(other)
    }

    public static Identity(): Matrix {
        const m_matrix = new Matrix()
        m_matrix.m[0][0] = 1.0
        m_matrix.m[1][1] = 1.0
        m_matrix.m[2][2] = 1.0
        return m_matrix
    }

    public ToString(): string {
        return "[[" + this.m[0][0] + ", " + this.m[0][1] + ", " + this.m[0][2] + "],\n[" + this.m[1][0] + ", " + this.m[1][1] + ", " + this.m[1][2] + "],\n[" + this.m[2][0] + ", " + this.m[2][1] + ", " + this.m[2][2] + "]]"
    }

    public toString(): string {
        return this.ToString()
    }

    public Get(row: number, column: number): Single {
        return this.m[row][column]
    }

    public copy(other: Matrix): void {
        this.m[0][0] = other.m[0][0]
        this.m[0][1] = other.m[0][1]
        this.m[0][2] = other.m[0][2]
        this.m[1][0] = other.m[1][0]
        this.m[1][1] = other.m[1][1]
        this.m[1][2] = other.m[1][2]
        this.m[2][0] = other.m[2][0]
        this.m[2][1] = other.m[2][1]
        this.m[2][2] = other.m[2][2]
    }

    public multiply(vector: Vector3): Vector3 {
        const output = new Vector3()

        output.X = this.m[0][0] * vector.X + this.m[0][1] * vector.Y + this.m[0][2] * vector.Z
        output.Y = this.m[1][0] * vector.X + this.m[1][1] * vector.Y + this.m[1][2] * vector.Z
        output.Z = this.m[2][0] * vector.X + this.m[2][1] * vector.Y + this.m[2][2] * vector.Z

        return output
    }

    public rotate(eulerRadiansX: number, eulerRaidansY: number, eulerRadiansZ: number): Matrix {
        const ci = Math.cos(eulerRadiansX)
        const cj = Math.cos(eulerRaidansY)
        const ch = Math.cos(eulerRadiansZ)
        const si = Math.sin(eulerRadiansX)
        const sj = Math.sin(eulerRaidansY)
        const sh = Math.sin(eulerRadiansZ)

        const cc = ci * ch
        const cs = ci * sh
        const sc = si * ch
        const ss = si * sh

        this.m[0][0] = CSng(cj * ch)
        this.m[0][1] = CSng(sj * sc - cs)
        this.m[0][2] = CSng(sj * cc + ss)
        this.m[1][0] = CSng(cj * sh)
        this.m[1][1] = CSng(sj * ss + cc)
        this.m[1][2] = CSng(sj * cs - sc)
        this.m[2][0] = CSng(-sj)
        this.m[2][1] = CSng(cj * si)
        this.m[2][2] = CSng(cj * ci)

        return this
    }

    public ToEulerDegrees(): Single[] {
        const rotation: Single[] = [0, 0, 0]
        rotation[0] = CSng(this.RadianToDegree(Math.atan2(this.m[2][1], this.m[2][2])))
        rotation[1] = CSng(this.RadianToDegree(-Math.asin(this.m[2][0])))
        rotation[2] = CSng(this.RadianToDegree(Math.atan2(this.m[1][0], this.m[0][0])))
        return rotation
    }

    private RadianToDegree(angle: number): number {
        return angle * (180.0 / Math.PI)
    }

    public Transposed(): Matrix {
        const temp = new Matrix()
        for (let i = 0; i <= this.m.length - 1; i++) {
            let j = 0
            while (j < this.m[0].length) {
                temp.m[j][i] = this.m[i][j]
                j += 1
            }
        }

        return temp
    }

    public Read(r: FileReader): Matrix {
        for (let i = 0; i <= 2; i++) {
            for (let f = 0; f <= 2; f++) {
                this.m[i][f] = r.ReadSingle()
            }
        }
        return this
    }

    public Write(w: FileWriter): Matrix {
        for (let i = 0; i <= 2; i++) {
            for (let f = 0; f <= 2; f++) {
                w.Write(this.m[i][f])
            }
        }
        return this
    }

    public static FromQuaternion(q: Vector4): Matrix {
        const result: Matrix = Matrix.Identity()

        const sqw = q.W * q.W
        const sqx = q.X * q.X
        const sqy = q.Y * q.Y
        const sqz = q.Z * q.Z

        const invs = 1 / (sqx + sqy + sqz + sqw)
        result.m[0][0] = CSng((sqx - sqy - sqz + sqw) * invs)
        result.m[1][1] = CSng((-sqx + sqy - sqz + sqw) * invs)
        result.m[2][2] = CSng((-sqx - sqy + sqz + sqw) * invs)

        let tmp1 = q.X * q.Y
        let tmp2 = q.Z * q.W
        result.m[1][0] = CSng(2.0 * (tmp1 + tmp2) * invs)
        result.m[0][1] = CSng(2.0 * (tmp1 - tmp2) * invs)

        tmp1 = q.X * q.Z
        tmp2 = q.Y * q.W
        result.m[2][0] = CSng(2.0 * (tmp1 - tmp2) * invs)
        result.m[0][2] = CSng(2.0 * (tmp1 + tmp2) * invs)

        tmp1 = q.Y * q.Z
        tmp2 = q.X * q.W
        result.m[2][1] = CSng(2.0 * (tmp1 + tmp2) * invs)
        result.m[1][2] = CSng(2.0 * (tmp1 - tmp2) * invs)

        return result
    }
}
