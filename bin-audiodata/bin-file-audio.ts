import { BinaryReaderLike, FifaUtil } from '../utils/fifa-util'
import { AudioBin as EventNamespace } from '../bin-audiodata/event-system/bin-0tve00cp-event'
import { AudioBin as GraffitiNamespace } from '../bin-audiodata/graffiti-runtime/bin-0frg00cp'
import { AudioBin as RepetitionNamespace } from '../bin-audiodata/repetitions-pools/bin-0per00cp'
import { AudioBin as SentencesNamespace } from '../bin-audiodata/sentences/bin-0cps00cp'

export namespace AudioBin {

    export interface FifaFile {
        isCompressed: boolean
        decompress(): void
        getReader(): BinaryReaderLike
        releaseReader(r: BinaryReaderLike): void
    }

    export class BinFile {
        header: string = ""
        binData: any = null

        load(fileName: string): boolean
        load(fifaFile: FifaFile): boolean
        load(r: BinaryReaderLike): boolean
        load(arg: string | FifaFile | BinaryReaderLike): boolean {
            if (typeof arg === 'string') {
                return false
            } else if (this.isFifaFile(arg)) {
                if (arg.isCompressed) {
                    arg.decompress()
                }
                const r = arg.getReader()
                const flag = this.loadFromReader(r)
                arg.releaseReader(r)

                return flag
            } else {
                return this.loadFromReader(arg)
            }
        }

        loadFromReader(r: BinaryReaderLike): boolean {
            this.header = this.getHeader(r)

            switch (this.header) {
                case "0TVE00CP":
                    this.binData = new EventNamespace.EventSystem.EventSystemFile(r)
                    break
                case "0CPS00CP":
                    this.binData = new SentencesNamespace.Sentences.SentencesFile(r)
                    break
                case "0FRG00CP":
                    this.binData = new GraffitiNamespace.GraffitiRuntime.GraffitiRuntimeFile(r)
                    break
                case "0PER00CP":
                    this.binData = new RepetitionNamespace.RepetitionPools.RepetitionPoolsFile(r)
                    break
                case "0XTC00CP":

                    break
                default:
                    this.binData = null
                    break
            }

            return true
        }

        getHeader(r: BinaryReaderLike): string {
            return FifaUtil.readString(r, 8)
        }

        toXml(
            fileName: string,
            binRepetitionPools?: RepetitionNamespace.RepetitionPools.RepetitionPoolsFile,
            binEventSystem?: EventNamespace.EventSystem.EventSystemFile
        ): string {
            if (this.header !== "" && this.binData !== null) {
                switch (this.header) {
                    case "0TVE00CP":
                        return (this.binData as EventNamespace.EventSystem.EventSystemFile).ToXml(fileName)
                    case "0CPS00CP":
                        return (this.binData as SentencesNamespace.Sentences.SentencesFile).toXml(fileName, binRepetitionPools, binEventSystem)
                    case "0FRG00CP":
                        return (this.binData as GraffitiNamespace.GraffitiRuntime.GraffitiRuntimeFile).toXml(fileName)
                    case "0PER00CP":
                        return (this.binData as RepetitionNamespace.RepetitionPools.RepetitionPoolsFile).toXml(fileName)
                }
            }

            return ""
        }

        private isFifaFile(arg: any): arg is FifaFile {
            return arg && typeof arg.getReader === 'function'
        }
    }
}