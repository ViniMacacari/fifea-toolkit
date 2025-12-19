import { BinaryReaderLike, FifaUtil } from '../../utils/fifa-util'

export namespace AudioBin.GraffitiRuntime {

    export enum EHasTagName {
        f_False = 0,
        f_True = 1
    }

    export class TagTable {
        tagId: number = 0
        tagValue: number = 0
        numTags: number = 0
        offsetRefs: number = 0
        numRefs: number = 0
        dataRefs: number[] = []
        tagName: string = ""

        constructor(r?: BinaryReaderLike, flagHasTagName?: EHasTagName) {
            if (!r || flagHasTagName === undefined) {
                return
            }

            this.tagId = r.readInt32()
            this.tagValue = r.readInt32()
            this.numTags = r.readInt32()
            this.offsetRefs = r.readInt32()

            const mBaseStream = r.position
            r.position = 28 + this.offsetRefs
            this.numRefs = r.readInt32()

            this.dataRefs = new Array(this.numRefs)
            for (let i = 0; i < this.numRefs; i++) {
                this.dataRefs[i] = r.readInt32()
            }

            if (flagHasTagName === EHasTagName.f_True) {
                this.tagName = FifaUtil.readNullTerminatedString(r)
            }

            r.position = mBaseStream
        }
    }

    export class GraffitiRuntimeFile {
        flagHasTagName: EHasTagName = EHasTagName.f_False
        numTables: number = 0
        unknown1: number = 0
        tagTables: TagTable[] = []

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            r.position = 8

            r.readUInt16()
            r.readUInt16()
            r.readUInt16()
            r.readUInt16()

            this.flagHasTagName = r.readInt32()
            this.numTables = r.readInt32()
            this.unknown1 = r.readInt32()

            for (let i = 0; i < (this.numTables * 2); i++) {
                r.readInt32()
            }

            this.tagTables = new Array(this.numTables)
            for (let i = 0; i < this.numTables; i++) {
                this.tagTables[i] = new TagTable(r, this.flagHasTagName)
            }
        }

        public toXml(fileName: string): string {
            let strXml = ""

            this.tagTables.sort((a, b) => a.tagValue - b.tagValue)
            this.tagTables.sort((a, b) => a.tagId - b.tagId)

            strXml += "<AudioFramework>"
            strXml += `\n  <Module type="${this.getModuleType(fileName)}" name="${this.getModuleName(fileName)}">`
            strXml += `\n    <GraffitiDatabase numTables="${this.numTables}" numSamples="${this.getNumSamples()}">`
            strXml += `\n      <Version major="2" minor="1" patch="0" />`

            for (let i = 0; i < this.numTables; i++) {
                strXml += `\n      <TagTable TagName="${this.getTagName(i)}" numRefs="${this.tagTables[i].numRefs}" TagId="${this.tagTables[i].tagId}" TagValue="${this.tagTables[i].tagValue}" NumTags="${this.tagTables[i].numTags}">`
                for (let j = 0; j < this.tagTables[i].numRefs; j++) {
                    strXml += `\n        <DataRef value="${this.tagTables[i].dataRefs[j]}" />`
                }
                strXml += `\n      </TagTable>`
            }

            strXml += `\n    </GraffitiDatabase>`
            strXml += `\n  </Module>`
            strXml += `\n</AudioFramework>`

            return strXml
        }

        private getModuleType(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_graffitiruntime")) {
                return "SpeechModule"
            }
            if (name.includes("commentary_graffitiruntime")) {
                return "SpeechModule"
            }
            if (name.includes("playercalls_graffitiruntime")) {
                return "SpeechModule"
            }
            if (name === "graffitiruntime") {
                return "GraffitiPlayerModule"
            }

            return ""
        }

        private getModuleName(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_graffitiruntime")) {
                return "Announcer"
            }
            if (name.includes("commentary_graffitiruntime")) {
                return "CommentarySpeech"
            }
            if (name.includes("playercalls_graffitiruntime")) {
                return "PlayerCalls"
            }
            if (name === "graffitiruntime") {
                return "GraffitiPlayer"
            }

            return ""
        }

        private getNumSamples(): number {
            const uniqueSamples = new Set<number>()

            for (let i = 0; i < this.numTables; i++) {
                for (let j = 0; j < this.tagTables[i].numRefs; j++) {
                    uniqueSamples.add(this.tagTables[i].dataRefs[j])
                }
            }

            return uniqueSamples.size
        }

        private getTagName(index: number): string {
            if (this.flagHasTagName === EHasTagName.f_True) {
                return this.tagTables[index].tagName
            } else {
                return "name_" + (index + 1)
            }
        }

        private getFileNameWithoutExtension(filePath: string): string {
            const base = filePath.split(/[\\/]/).pop() || ""
            const dotIndex = base.lastIndexOf('.')
            return dotIndex === -1 ? base : base.substring(0, dotIndex)
        }
    }
}