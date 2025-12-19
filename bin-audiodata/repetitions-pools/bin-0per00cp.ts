import { BinaryReaderLike, FifaUtil } from '../../utils/fifa-util'

export namespace AudioBin.RepetitionPools {

    export enum EPoolType {
        TimedRepetitionPool = 0,
        UseOnceRepetitionPool = 1,
        ShuffleRepetitionPool = 2
    }

    export class Pool {
        id: number = 0
        offsetPool: number = 0
        poolType: EPoolType = EPoolType.TimedRepetitionPool
        poolSize: number = 0
        repeatTime: number = 0
        name: string = ""

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            this.id = r.readInt32()
            this.offsetPool = r.readInt32()

            const mBaseStream = r.position
            r.position = this.offsetPool

            this.poolType = this.getPoolType(r)

            switch (this.poolType) {
                case EPoolType.TimedRepetitionPool:
                    this.id = r.readInt32()
                    r.readInt32()
                    this.poolSize = r.readInt32()
                    r.readInt32()
                    this.repeatTime = FifaUtil.readFloat(r)
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    this.name = FifaUtil.readNullTerminatedString(r)
                    break

                case EPoolType.UseOnceRepetitionPool:
                    this.id = r.readInt32()
                    this.poolSize = r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    this.name = FifaUtil.readNullTerminatedString(r)
                    break

                case EPoolType.ShuffleRepetitionPool:
                    this.id = r.readInt32()
                    this.poolSize = r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    r.readInt32()
                    this.name = FifaUtil.readNullTerminatedString(r)
                    break
            }

            r.position = mBaseStream
        }

        private getPoolType(r: BinaryReaderLike): EPoolType {
            const strType = FifaUtil.readString(r, 4)

            switch (strType) {
                case "0MIT":
                    return EPoolType.TimedRepetitionPool
                case "0ESU":
                    return EPoolType.UseOnceRepetitionPool
                case "0FHS":
                    return EPoolType.ShuffleRepetitionPool
                default:
                    return EPoolType.TimedRepetitionPool
            }
        }
    }

    export class RepetitionPoolsFile {
        numPools: number = 0
        unknown1: number = 0
        pools: Pool[] = []

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            r.position = 8

            r.readUInt16()
            r.readUInt16()
            r.readUInt16()
            r.readUInt16()

            this.numPools = r.readInt32()
            this.unknown1 = r.readInt32()

            this.pools = new Array(this.numPools)
            for (let i = 0; i < this.numPools; i++) {
                this.pools[i] = new Pool(r)
            }
        }

        public toXml(fileName: string): string {
            let strXml = ""

            this.pools.sort((a, b) => a.id - b.id)

            strXml += "<AudioFramework>"
            strXml += `\n  <Module type="${this.getModuleType(fileName)}" name="${this.getModuleName(fileName)}">`
            strXml += `\n    <RepetitionManager numPools="${this.numPools}">`
            strXml += `\n      <Version major="1" minor="1" patch="0" />`

            for (let i = 0; i < this.numPools; i++) {
                const pool = this.pools[i]

                switch (pool.poolType) {
                    case EPoolType.TimedRepetitionPool:
                        strXml += `\n      <TimedRepetitionPool name="${pool.name}" id="${pool.id}" poolSize="${pool.poolSize}" repeatTime="${pool.repeatTime}" />`
                        break
                    case EPoolType.UseOnceRepetitionPool:
                        strXml += `\n      <UseOnceRepetitionPool name="${pool.name}" id="${pool.id}" poolSize="${pool.poolSize}" />`
                        break
                    case EPoolType.ShuffleRepetitionPool:
                        strXml += `\n      <ShuffleRepetitionPool name="${pool.name}" id="${pool.id}" poolSize="${pool.poolSize}" />`
                        break
                }
            }

            strXml += `\n    </RepetitionManager>`
            strXml += `\n  </Module>`
            strXml += `\n</AudioFramework>`

            return strXml
        }

        private getModuleType(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_repetitionpools")) {
                return "SpeechModule"
            }
            if (name.includes("commentary_repetitionpools")) {
                return "SpeechModule"
            }
            if (name.includes("playercalls_repetitionpools")) {
                return "SpeechModule"
            }
            if (name === "repetitionpools") {
                return "GraffitiPlayerModule"
            }

            return ""
        }

        private getModuleName(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_repetitionpools")) {
                return "Announcer"
            }
            if (name.includes("commentary_repetitionpools")) {
                return "CommentarySpeech"
            }
            if (name.includes("playercalls_repetitionpools")) {
                return "PlayerCalls"
            }
            if (name === "repetitionpools") {
                return "GraffitiPlayer"
            }

            return ""
        }

        private getFileNameWithoutExtension(filePath: string): string {
            const base = filePath.split(/[\\/]/).pop() || ""
            const dotIndex = base.lastIndexOf('.')
            return dotIndex === -1 ? base : base.substring(0, dotIndex)
        }
    }
}