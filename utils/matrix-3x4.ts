import { Matrix, Vector3, type Single, type FileReader, type FileWriter } from './matrix'

export class Matrix3x4 {
    public readonly NUM_ROWS: number = 3
    public readonly NUM_COLS: number = 4

    public readonly m: Single[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    public constructor() {
        for (let i = 0; i <= this.NUM_ROWS - 1; i++) {
            const row: Single[] = [0, 0, 0, 0]
            if (i < this.NUM_COLS) {
                row[i] = 1.0
            }
            this.m[i] = row
        }
    }

    public get Rotation(): Matrix {
        const matrix: Matrix = Matrix.Identity()
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                matrix.m[i][j] = this.m[i][j]
            }
        }
        return matrix
    }

    public set Rotation(matrix: Matrix) {
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                this.m[i][j] = matrix.m[i][j]
            }
        }
    }

    public get Offset(): Vector3 {
        return new Vector3(this.m[0][3], this.m[1][3], this.m[2][3])
    }

    public set Offset(vector: Vector3) {
        this.m[0][3] = vector.X
        this.m[1][3] = vector.Y
        this.m[2][3] = vector.Z
    }

    public Load(r: FileReader): void {
        for (let i = 0; i <= this.m.length - 1; i++) {
            for (let j = 0; j <= this.m[i].length - 1; j++) {
                this.m[i][j] = r.ReadSingle()
            }
        }
    }

    public Save(w: FileWriter): void {
        for (let i = 0; i <= this.m.length - 1; i++) {
            for (let j = 0; j <= this.m[i].length - 1; j++) {
                w.Write(this.m[i][j])
            }
        }
    }
}
