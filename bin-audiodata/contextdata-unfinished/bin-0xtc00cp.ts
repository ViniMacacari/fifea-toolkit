import { BinaryReaderLike } from "../../utils/fifa-util"
import { Bin_0TVE00CP_Parameter } from "../bin-0tve00cp-parameter"
import { Bin_0XTC00CP_Id } from "./bin-0xtc00cp-ld"

export class Bin_0XTC00CP {
    OffsetScriptNames: number = 0
    Unknown_1: number = 0
    Num_1: number = 0
    Num_2: number = 0
    Num_3: number = 0
    Unknown_2: number = 0
    Unknown_3: number = 0

    OffsetsEvents: number[] = []
    OffsetsParameters: number[] = []

    Ids: Bin_0XTC00CP_Id[] = []
    Parameters: Bin_0TVE00CP_Parameter[] = []

    constructor()
    constructor(r: BinaryReaderLike)
    constructor(r?: BinaryReaderLike) {
        if (r) this.Load(r)
    }

    Load(r: BinaryReaderLike): boolean {
        r.position = 8

        r.readUInt16()
        r.readUInt16()
        this.OffsetScriptNames = r.readInt32()

        this.Unknown_1 = r.readInt32()
        this.Num_1 = r.readInt32()
        this.Num_2 = r.readInt32()
        this.Num_3 = r.readInt32()

        this.Unknown_2 = r.readInt32()
        this.Unknown_3 = r.readInt32()

        this.Ids = new Array(this.Num_2)
        for (let i = 0; i < this.Ids.length; i++) {
            this.Ids[i] = new Bin_0XTC00CP_Id(r)
        }

        r.position = this.Num_2
        this.OffsetsEvents = new Array(this.Unknown_1)
        for (let i = 0; i < this.OffsetsEvents.length; i++) {
            this.OffsetsEvents[i] = r.readInt32()
        }

        r.position = this.Num_3
        this.OffsetsParameters = new Array(this.Num_1)
        for (let i = 0; i < this.OffsetsParameters.length; i++) {
            this.OffsetsParameters[i] = r.readInt32()
        }

        this.Parameters = new Array(this.Num_1)
        for (let i = 0; i < this.Parameters.length; i++) {
            r.position = this.OffsetsParameters[i]
            this.Parameters[i] = new Bin_0TVE00CP_Parameter(r)
        }

        return true
    }

    ToXml(FileName: string): string {
        let StrXml = ''

        this.Parameters = this.Parameters.slice().sort((a, b) => (a.Id as number) - (b.Id as number))
        this.Ids = this.Ids.slice().sort((a, b) => (a.Name || '').localeCompare(b.Name || ''))

        const vbNewLine = '\r\n'

        StrXml += '<AudioFramework>'
        StrXml += vbNewLine + '  <Module type="' + this.GetModuleType(FileName) + '" name="' + this.GetModuleName(FileName) + '"' + this.GetModuleExtra(FileName) + '>'
        StrXml += vbNewLine + '    <EventSystem systemCrc="' + String(this.OffsetScriptNames) + '" numParameters="' + String(this.Num_1) + '" numEvents="' + String(this.Unknown_1) + '">'
        StrXml += vbNewLine + '      <Version major="1" minor="2" patch="4" />'

        for (let i = 0; i < this.Num_1; i++) {
            switch (this.Parameters[i].Type) {
                case Bin_0TVE00CP_Parameter.BinParameterType.EnumBit:
                    StrXml += vbNewLine + '      <enum name="' + this.Parameters[i].Name + '" id="' + String(this.Parameters[i].Id) + '" type="EnumBit" numValues="' + String(this.Parameters[i].NumValues) + '">'
                    for (let j = 0; j < this.Parameters[i].NumValues; j++) {
                        StrXml += vbNewLine + '        <enumerator name="' + this.Parameters[i].ParameterValues[j].Name + '" value="' + String(this.Parameters[i].ParameterValues[j].Value) + '" />'
                    }
                    StrXml += vbNewLine + '      </enum>'
                    break

                case Bin_0TVE00CP_Parameter.BinParameterType.Int:
                    StrXml += vbNewLine + '      <parameter name="' + this.Parameters[i].Name + '" id="' + String(this.Parameters[i].Id) + '" type="Int" />'
                    break
            }
        }

        for (let i = 0; i < this.Unknown_1; i++) {
            if (this.Ids[i].NumParameters === 0) {
                StrXml += vbNewLine + '      <function name="' + this.Ids[i].Name + '" interfaceCrc="' + String(this.Ids[i].InterfaceCrc) + '" numParameters="' + String(this.Ids[i].NumParameters) + '" />'
            } else {
                StrXml += vbNewLine + '      <function name="' + this.Ids[i].Name + '" interfaceCrc="' + String(this.Ids[i].InterfaceCrc) + '" numParameters="' + String(this.Ids[i].NumParameters) + '">'
                for (let j = 0; j < this.Ids[i].NumParameters; j++) {
                    const ParameterIndex = this.GetParameterIndex(this.Ids[i].ParameterIds[j])
                    StrXml += vbNewLine + '        <parameter type="' + this.Parameters[ParameterIndex].Name + '" name="' + this.Parameters[ParameterIndex].Name + '" parameterId="' + String(this.Parameters[ParameterIndex].Id) + '" />'
                }
                StrXml += vbNewLine + '      </function>'
            }
        }

        StrXml += vbNewLine + '    </EventSystem>'
        StrXml += vbNewLine + '  </Module>'
        StrXml += vbNewLine + '</AudioFramework>'

        return StrXml
    }

    private GetParameterIndex(ParameterId: number): number {
        for (let i = 0; i < this.Num_1; i++) {
            if (this.Parameters[i].Id === ParameterId) return i
        }
        return 0
    }

    private GetModuleType(FileName: string): string {
        const name = this.fileNameWithoutExtension(FileName)

        if (name.includes('announcer_eventsystem')) return 'SpeechModule'
        if (name.includes('commentary_eventsystem')) return 'SpeechModule'
        if (name.includes('playercalls_eventsystem')) return 'SpeechModule'
        if (name === 'chant_eventsystem') return 'GraffitiPlayerModule'
        if (name === 'crowd_eventsystem') return 'ContextModule'
        if (name === 'commentary_triggers_eventsystem') return 'ContextModule'

        return ''
    }

    private GetModuleName(FileName: string): string {
        const name = this.fileNameWithoutExtension(FileName)

        if (name.includes('announcer_eventsystem')) return 'Announcer'
        if (name.includes('commentary_eventsystem')) return 'CommentarySpeech'
        if (name.includes('playercalls_eventsystem')) return 'PlayerCalls'
        if (name === 'chant_eventsystem') return 'GraffitiPlayer'
        if (name === 'crowd_eventsystem') return 'CrowdContextModule'
        if (name === 'commentary_triggers_eventsystem') return 'ContextModule'

        return ''
    }

    private GetModuleExtra(FileName: string): string {
        const name = this.fileNameWithoutExtension(FileName)

        if (name === 'crowd_eventsystem') {
            return ' maxNumContexts="750" maxNumGroups="100" maxNumValidContexts="400" maxNumTriggeredContexts="100" numPassives="150" priorityDecayRate="1000"'
        }

        if (name === 'commentary_triggers_eventsystem') {
            return ' maxNumContexts="1200" maxNumGroups="100" maxNumValidContexts="500" maxNumTriggeredContexts="150" numPassives="150" priorityDecayRate="1000"'
        }

        return ''
    }

    private fileNameWithoutExtension(p: string): string {
        const lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'))
        const base = lastSlash >= 0 ? p.slice(lastSlash + 1) : p
        const dot = base.lastIndexOf('.')
        return dot > 0 ? base.slice(0, dot) : base
    }
}