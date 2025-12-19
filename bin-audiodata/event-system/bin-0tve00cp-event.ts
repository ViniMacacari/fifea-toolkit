import type { BinaryReaderLike } from '../../utils/fifa-util'
import { FifaUtil } from '../../utils/fifa-util'

export namespace AudioBin {
    export namespace EventSystem {
        export namespace AudioBin {
            export namespace EventSystem {
                export interface EventLike {
                    Name: string
                    InterfaceCrc: number
                    NumParameters: number
                    ParameterIds: number[]
                }

                export interface ParameterValueLike {
                    Name: string
                    Value: number
                }

                export interface ParameterLike {
                    Type: number
                    Id: number
                    NumValues: number
                    Name: string
                    ParameterValues: ParameterValueLike[]
                }

                export class EventSystemFile {
                    SystemCrc = 0
                    NumEvents = 0
                    NumParameters = 0

                    OffsetOffsetsEvents = 0
                    OffsetOffsetsParameters = 0

                    OffsetsEvents: number[] = []
                    OffsetsParameters: number[] = []

                    Events: EventLike[] = []
                    Parameters: ParameterLike[] = []

                    constructor()
                    constructor(r: BinaryReaderLike)
                    constructor(r?: BinaryReaderLike) {
                        if (r) this.load(r)
                    }

                    private load(r: BinaryReaderLike): void {
                        r.position = 8

                        r.readUInt16()
                        r.readUInt16()
                        r.readUInt16()
                        r.readUInt16()

                        this.SystemCrc = r.readInt32()
                        this.NumEvents = r.readInt32()
                        this.NumParameters = r.readInt32()

                        this.OffsetOffsetsEvents = r.readInt32()
                        this.OffsetOffsetsParameters = r.readInt32()

                        r.position = this.OffsetOffsetsEvents
                        this.OffsetsEvents = new Array(this.NumEvents)
                        for (let i = 0; i < this.OffsetsEvents.length; i++) {
                            this.OffsetsEvents[i] = r.readInt32()
                        }

                        r.position = this.OffsetOffsetsParameters
                        this.OffsetsParameters = new Array(this.NumParameters)
                        for (let i = 0; i < this.OffsetsParameters.length; i++) {
                            this.OffsetsParameters[i] = r.readInt32()
                        }

                        this.Events = new Array(this.NumEvents)
                        for (let i = 0; i < this.Events.length; i++) {
                            r.position = this.OffsetsEvents[i]
                            this.Events[i] = new (Event as any)(r)
                        }

                        this.Parameters = new Array(this.NumParameters)
                        for (let i = 0; i < this.Parameters.length; i++) {
                            r.position = this.OffsetsParameters[i]
                            this.Parameters[i] = new (Parameter as any)(r)
                        }
                    }

                    ToXml(fileName: string): string {
                        let strXml = ''

                        this.Parameters = [...this.Parameters].sort((a, b) => a.Id - b.Id)
                        this.Events = [...this.Events].sort((a, b) => (a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0))

                        strXml += '<AudioFramework>'
                        strXml +=
                            '\n  <Module type="' +
                            this.GetModuleType(fileName) +
                            '" name="' +
                            this.GetModuleName(fileName) +
                            '"' +
                            this.GetModuleExtra(fileName) +
                            '>'
                        strXml +=
                            '\n    <EventSystem systemCrc="' +
                            String(this.SystemCrc) +
                            '" numParameters="' +
                            String(this.NumParameters) +
                            '" numEvents="' +
                            String(this.NumEvents) +
                            '">'
                        strXml += '\n      <Version major="1" minor="2" patch="4" />'

                        for (let i = 0; i < this.NumParameters; i++) {
                            const p = this.Parameters[i]

                            switch (p.Type) {
                                case (Parameter as any).BinParameterType?.EnumBit ?? 1: {
                                    strXml +=
                                        '\n      <enum name="' +
                                        p.Name +
                                        '" id="' +
                                        String(p.Id) +
                                        '" type="EnumBit" numValues="' +
                                        String(p.NumValues) +
                                        '">'
                                    for (let j = 0; j < p.NumValues; j++) {
                                        const pv = p.ParameterValues[j]
                                        strXml += '\n        <enumerator name="' + pv.Name + '" value="' + String(pv.Value) + '" />'
                                    }
                                    strXml += '\n      </enum>'
                                    break
                                }

                                case (Parameter as any).BinParameterType?.Int ?? 3: {
                                    strXml += '\n      <parameter name="' + p.Name + '" id="' + String(p.Id) + '" type="Int" />'
                                    break
                                }
                            }
                        }

                        for (let i = 0; i < this.NumEvents; i++) {
                            const e = this.Events[i]

                            if (e.NumParameters === 0) {
                                strXml +=
                                    '\n      <function name="' +
                                    e.Name +
                                    '" interfaceCrc="' +
                                    String(e.InterfaceCrc) +
                                    '" numParameters="' +
                                    String(e.NumParameters) +
                                    '" />'
                            } else {
                                strXml +=
                                    '\n      <function name="' +
                                    e.Name +
                                    '" interfaceCrc="' +
                                    String(e.InterfaceCrc) +
                                    '" numParameters="' +
                                    String(e.NumParameters) +
                                    '">'
                                for (let j = 0; j < e.NumParameters; j++) {
                                    const parameterIndex = this.GetParameterIndex(e.ParameterIds[j])
                                    const p = this.Parameters[parameterIndex]
                                    strXml +=
                                        '\n        <parameter type="' +
                                        p.Name +
                                        '" name="' +
                                        p.Name +
                                        '" parameterId="' +
                                        p.Id +
                                        '" />'
                                }
                                strXml += '\n      </function>'
                            }
                        }

                        strXml += '\n    </EventSystem>'
                        strXml += '\n  </Module>'
                        strXml += '\n</AudioFramework>'

                        return strXml
                    }

                    private GetParameterIndex(parameterId: number): number {
                        for (let i = 0; i < this.NumParameters; i++) {
                            if (this.Parameters[i].Id === parameterId) return i
                        }
                        return 0
                    }

                    private GetModuleType(fileName: string): string {
                        fileName = this.getFileNameWithoutExtension(fileName)

                        switch (true) {
                            case fileName.includes('announcer_eventsystem'):
                                return 'SpeechModule'
                            case fileName.includes('commentary_eventsystem'):
                                return 'SpeechModule'
                            case fileName.includes('playercalls_eventsystem'):
                                return 'SpeechModule'
                            case fileName === 'chant_eventsystem':
                                return 'GraffitiPlayerModule'
                            case fileName === 'crowd_eventsystem':
                                return 'ContextModule'
                            case fileName === 'commentary_triggers_eventsystem':
                                return 'ContextModule'
                        }

                        return ''
                    }

                    private GetModuleName(fileName: string): string {
                        fileName = this.getFileNameWithoutExtension(fileName)

                        switch (true) {
                            case fileName.includes('announcer_eventsystem'):
                                return 'Announcer'
                            case fileName.includes('commentary_eventsystem'):
                                return 'CommentarySpeech'
                            case fileName.includes('playercalls_eventsystem'):
                                return 'PlayerCalls'
                            case fileName === 'chant_eventsystem':
                                return 'GraffitiPlayer'
                            case fileName === 'crowd_eventsystem':
                                return 'CrowdContextModule'
                            case fileName === 'commentary_triggers_eventsystem':
                                return 'ContextModule'
                        }

                        return ''
                    }

                    private GetModuleExtra(fileName: string): string {
                        fileName = this.getFileNameWithoutExtension(fileName)

                        switch (true) {
                            case fileName === 'crowd_eventsystem':
                                return ' maxNumContexts="750" maxNumGroups="100" maxNumValidContexts="400" maxNumTriggeredContexts="100" numPassives="150" priorityDecayRate="1000"'
                            case fileName === 'commentary_triggers_eventsystem':
                                return ' maxNumContexts="1200" maxNumGroups="100" maxNumValidContexts="500" maxNumTriggeredContexts="150" numPassives="150" priorityDecayRate="1000"'
                        }

                        return ''
                    }

                    private getFileNameWithoutExtension(p: string): string {
                        const normalized = p.replace(/\\/g, '/')
                        const base = normalized.split('/').pop() ?? normalized
                        const lastDot = base.lastIndexOf('.')
                        return lastDot >= 0 ? base.slice(0, lastDot) : base
                    }
                }

                declare const Event: new (r: BinaryReaderLike) => EventLike
                declare const Parameter: new (r: BinaryReaderLike) => ParameterLike & {
                    BinParameterType?: { EnumBit: number; Int: number }
                }
            }
        }

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
