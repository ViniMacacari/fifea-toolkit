import type { BinaryReaderLike } from '../../utils/fifa-util'
import { FifaUtil } from '../../utils/fifa-util'

export namespace AudioBin {
    export namespace EventSystem {
        export class ParameterValue {
            Unknown_1 = 0
            Value = 0
            Name = ''

            constructor()
            constructor(r: BinaryReaderLike)
            constructor(r?: BinaryReaderLike) {
                if (r) this.Load(r)
            }

            Load(r: BinaryReaderLike): boolean {
                this.Unknown_1 = r.readInt32()
                this.Value = r.readInt32()
                this.Name = FifaUtil.readNullTerminatedString(r)
                return true
            }
        }

        export enum BinParameterType {
            EnumBit = 1,
            Int = 3
        }

        export class Parameter {
            Type: BinParameterType = BinParameterType.Int
            Id = 0
            NumValues = 0
            Unknown_1 = 0
            OffsetOffsetsValues = 0
            Name = ''
            OffsetsValues: number[] = []
            ParameterValues: ParameterValue[] = []

            constructor()
            constructor(r: BinaryReaderLike)
            constructor(r?: BinaryReaderLike) {
                if (r) this.Load(r)
            }

            Load(r: BinaryReaderLike): boolean {
                this.Type = r.readInt32() as BinParameterType
                this.Id = r.readInt32()
                this.NumValues = r.readInt32()
                this.Unknown_1 = r.readInt32()
                this.OffsetOffsetsValues = r.readInt32()
                this.Name = FifaUtil.readNullTerminatedString(r)

                r.position = this.OffsetOffsetsValues
                this.OffsetsValues = new Array(this.NumValues)
                for (let i = 0; i < this.OffsetsValues.length; i++) {
                    this.OffsetsValues[i] = r.readInt32()
                }

                this.ParameterValues = new Array(this.NumValues)
                for (let i = 0; i < this.ParameterValues.length; i++) {
                    r.position = this.OffsetsValues[i]
                    this.ParameterValues[i] = new ParameterValue(r)
                }

                return true
            }
        }

        export class Event {
            SizeParameters = 0
            NumParameters = 0
            Value_2 = 0
            Value_3 = 0
            Value_4 = 0

            SystemCrc = 0
            InterfaceCrc = 0

            Value_5 = 0
            Value_6 = 0
            Value_7 = 0
            Value_8 = 0
            Value_9 = 0
            Value_10 = 0

            ParameterIds: number[] = []
            Name = ''

            constructor()
            constructor(r: BinaryReaderLike)
            constructor(r?: BinaryReaderLike) {
                if (r) this.Load(r)
            }

            Load(r: BinaryReaderLike): boolean {
                this.SizeParameters = r.readInt32()
                this.NumParameters = r.readInt32()
                this.Value_2 = r.readInt32()
                this.Value_3 = r.readInt32()
                this.Value_4 = r.readInt32()

                this.SystemCrc = r.readInt16()
                this.InterfaceCrc = r.readInt16()

                this.Value_5 = r.readInt32()
                this.Value_6 = r.readInt32()
                this.Value_7 = r.readInt32()
                this.Value_8 = r.readInt32()
                this.Value_9 = r.readInt32()
                this.Value_10 = r.readInt32()

                this.ParameterIds = new Array(this.NumParameters)
                for (let i = 0; i < this.ParameterIds.length; i++) {
                    this.ParameterIds[i] = r.readInt32()
                }

                this.Name = FifaUtil.readNullTerminatedString(r)

                return true
            }
        }
    }
}
