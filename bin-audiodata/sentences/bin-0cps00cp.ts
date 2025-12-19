import { BinaryReaderLike, FifaUtil } from '../../utils/fifa-util'
import { AudioBin as RepetitionNamespace } from '../repetitions-pools/bin-0per00cp'
import { AudioBin as EventNamespace } from '../event-system/bin-0tve00cp-event'

export namespace AudioBin.Sentences {

    export class Parameter {
        type: EType = 0 as EType
        eventIndex: number = 0
        unknown2: number = 0
        unknown3: number = 0
        tagId: number = 0
        tagValue: number = 0

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            this.type = r.readByte()
            this.eventIndex = r.readByte()
            this.unknown2 = r.readByte()
            this.unknown3 = r.readByte()

            this.tagId = r.readInt32()
            this.tagValue = r.readInt32()
        }
    }

    export enum EType {
        TagBuilderFixed = 2,
        TagBuilderEventRef = 1
    }

    export class Phrase {
        repetitionId: number = 0
        numParameters: number = 0
        unknown1: number = 0
        parameters: Parameter[] = []

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            this.repetitionId = r.readInt16()
            this.numParameters = r.readByte()
            this.unknown1 = r.readByte()

            this.parameters = new Array(this.numParameters)
            for (let i = 0; i < this.numParameters; i++) {
                this.parameters[i] = new Parameter(r)
            }
        }
    }

    export class Section {
        numSentences: number = 0
        unknown1: number = 0
        sentences: Sentence[] = []
        triggerName: string = ""

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            this.numSentences = r.readInt32()
            this.unknown1 = r.readInt32()

            this.sentences = new Array(this.numSentences)
            for (let i = 0; i < this.numSentences; i++) {
                const offset = r.readUInt32() // Use UInt32 for offsets usually
                const mBaseStream = r.position

                r.position = offset
                this.sentences[i] = new Sentence(r)

                r.position = mBaseStream
            }

            this.triggerName = FifaUtil.readNullTerminatedString(r)
        }
    }

    export class Sentence {
        id: number = 0
        unknown1: number = 0
        priority: number = 0
        numPhrases: number = 0
        phrases: Phrase[] = []

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            this.id = r.readInt32()
            this.unknown1 = r.readInt32()

            this.priority = r.readInt32()
            this.numPhrases = r.readInt32()

            this.phrases = new Array(this.numPhrases)
            for (let i = 0; i < this.numPhrases; i++) {
                const offset = r.readUInt32()
                const mBaseStream = r.position

                r.position = offset
                this.phrases[i] = new Phrase(r)

                r.position = mBaseStream
            }
        }
    }

    class XmlSorter {
        id: number = 0
        strValue: string = ""
    }

    export class SentencesFile {
        numSections: number = 0
        unknown1: number = 0
        sections: Section[] = []

        constructor(r?: BinaryReaderLike) {
            if (!r) return

            r.position = 8

            r.readUInt16()
            r.readUInt16()
            r.readUInt16()
            r.readUInt16()

            this.numSections = r.readInt32()
            this.unknown1 = r.readInt32()

            this.sections = []

            for (let i = 0; i < this.numSections; i++) {
                const numSecs = r.readInt32()
                const offset = r.readInt32()

                if (offset !== -1) {
                    const mBaseStream = r.position

                    for (let j = 0; j < numSecs; j++) {
                        r.position = offset + (j * 8)
                        const sectionUnknown = r.readInt32()
                        const sectionOffset = r.readInt32()

                        r.position = sectionOffset
                        this.sections.push(new Section(r))
                    }

                    r.position = mBaseStream
                }
            }
        }

        public toXml(
            fileName: string,
            binRepetitionPools?: RepetitionNamespace.RepetitionPools.RepetitionPoolsFile,
            binEventSystem?: EventNamespace.EventSystem.EventSystemFile
        ): string {
            let strXml = ""
            let xmlSorter: XmlSorter[] = []

            strXml += "<AudioFramework>"
            strXml += `\n  <Module type="${this.getModuleType(fileName)}" name="${this.getModuleName(fileName)}">`
            strXml += `\n    <Version major="3" minor="5" patch="0" />`

            let counter = 0

            for (let i = 0; i < this.sections.length; i++) {
                for (let j = 0; j < this.sections[i].numSentences; j++) {
                    const sentence = this.sections[i].sentences[j]

                    const sorterItem = new XmlSorter()
                    sorterItem.id = sentence.id

                    sorterItem.strValue += `\n    <Sentence triggerName="${this.sections[i].triggerName}" id="${sentence.id}" priority="${sentence.priority}" numPhrases="${sentence.numPhrases}">`

                    for (let k = 0; k < sentence.numPhrases; k++) {
                        const phrase = sentence.phrases[k]
                        sorterItem.strValue += `\n      <Phrase numParameters="${phrase.numParameters}" repetitionPool="${this.getRepetitionPool(binRepetitionPools, phrase.repetitionId)}" repetitionId="${phrase.repetitionId}">`

                        for (let l = 0; l < phrase.numParameters; l++) {
                            const param = phrase.parameters[l]

                            switch (param.type) {
                                case EType.TagBuilderFixed:
                                    counter++
                                    sorterItem.strValue += `\n        <TagBuilderFixed TagName="${this.getBuilderFixedTagName(param.tagId)}" TagId="${param.tagId}" TagValueName="${this.getBuilderFixedTagValueName(counter)}" TagValue="${param.tagValue}" />`
                                    break
                                case EType.TagBuilderEventRef:
                                    sorterItem.strValue += `\n        <TagBuilderEventRef TagName="${this.getBuilderEventRefTagName(binEventSystem, param.tagId)}" TagId="${param.tagId}" EventIndex="${param.eventIndex}" />`
                                    break
                            }
                        }
                        sorterItem.strValue += `\n      </Phrase>`
                    }
                    sorterItem.strValue += `\n    </Sentence>`

                    xmlSorter.push(sorterItem)
                }
            }

            xmlSorter.sort((a, b) => a.id - b.id)

            for (const item of xmlSorter) {
                strXml += item.strValue
            }

            strXml += `\n  </Module>`
            strXml += `\n</AudioFramework>`

            return strXml
        }

        private getModuleType(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_sentences")) return "SpeechModule"
            if (name.includes("commentary_sentences")) return "SpeechModule"
            if (name.includes("playercalls_sentences")) return "SpeechModule"

            return ""
        }

        private getModuleName(fileName: string): string {
            const name = this.getFileNameWithoutExtension(fileName).toLowerCase()

            if (name.includes("announcer_sentences")) return "Announcer"
            if (name.includes("commentary_sentences")) return "CommentarySpeech"
            if (name.includes("playercalls_sentences")) return "PlayerCalls"

            return ""
        }

        private getRepetitionPool(binRepetitionPools: RepetitionNamespace.RepetitionPools.RepetitionPoolsFile | undefined, repetitionId: number): string {
            if (binRepetitionPools) {
                for (let i = 0; i < binRepetitionPools.numPools; i++) {
                    if (binRepetitionPools.pools[i].id === repetitionId) {
                        return binRepetitionPools.pools[i].name
                    }
                }
            }
            return ""
        }

        private getBuilderFixedTagName(tagId: number): string {
            return "SecretName_SampleBank"
        }

        private getBuilderFixedTagValueName(counter: number): string {
            return "name_" + counter
        }

        private getBuilderEventRefTagName(binEventSystem: EventNamespace.EventSystem.EventSystemFile | undefined, tagId: number): string {
            if (binEventSystem) {
                for (let i = 0; i < binEventSystem.NumParameters; i++) {
                    if (binEventSystem.Parameters[i].Id === tagId) {
                        return binEventSystem.Parameters[i].Name
                    }
                }
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