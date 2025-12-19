declare const require: any

export type UInt32 = number
export type Int32 = number

export interface BinaryReaderLike {
    position: number
    length: number
    peekByte(): number
    readByte(): number
    readBytes(length: number): Uint8Array
    readInt16(): number
}

export interface BinaryWriterLike {
    position: number
    writeByte(value: number): void
    writeBytes(bytes: Uint8Array): void
    writeInt16(value: number): void
    writeUInt32(value: number): void
}

export class BufferReader implements BinaryReaderLike {
    position = 0
    constructor(public readonly buffer: Uint8Array, startPosition = 0) {
        this.position = startPosition
    }

    get length() {
        return this.buffer.length
    }

    peekByte(): number {
        if (this.position >= this.buffer.length) return -1
        return this.buffer[this.position]
    }

    readByte(): number {
        if (this.position >= this.buffer.length) throw new Error('EOF')
        return this.buffer[this.position++]
    }

    readBytes(length: number): Uint8Array {
        const end = this.position + length
        if (end > this.buffer.length) throw new Error('EOF')
        const out = this.buffer.slice(this.position, end)
        this.position = end
        return out
    }

    readInt16(): number {
        const b0 = this.readByte()
        const b1 = this.readByte()
        const v = (b0 | (b1 << 8)) & 0xffff
        return v & 0x8000 ? v - 0x10000 : v
    }
}

export class BufferWriter implements BinaryWriterLike {
    private data: number[] = []
    private pos = 0

    get position() {
        return this.pos
    }

    set position(v: number) {
        const next = v | 0
        if (next < 0) throw new Error('Invalid position')
        if (next > this.data.length) {
            for (let i = this.data.length; i < next; i++) this.data[i] = 0
        }
        this.pos = next
    }

    writeByte(value: number) {
        this.data[this.pos] = value & 0xff
        this.pos += 1
    }

    writeBytes(bytes: Uint8Array) {
        for (let i = 0; i < bytes.length; i++) this.writeByte(bytes[i])
    }

    writeInt16(value: number) {
        const v = value & 0xffff
        this.writeByte(v & 0xff)
        this.writeByte((v >>> 8) & 0xff)
    }

    writeUInt32(value: number) {
        const v = value >>> 0
        this.writeByte(v & 0xff)
        this.writeByte((v >>> 8) & 0xff)
        this.writeByte((v >>> 16) & 0xff)
        this.writeByte((v >>> 24) & 0xff)
    }

    toUint8Array(): Uint8Array {
        return Uint8Array.from(this.data)
    }
}


export interface VertexElement {
    DataType: D3DDECLTYPE
    Offset: number
}

export enum D3DDECLTYPE {
    FLOAT1,
    FLOAT2,
    FLOAT3,
    FLOAT4,
    INT1,
    INT2,
    INT4,
    UINT1,
    UINT2,
    UINT4,
    INT1N,
    INT2N,
    INT4N,
    UINT1N,
    UINT2N,
    UINT4N,
    D3DCOLOR,
    UBYTE4,
    BYTE4,
    UBYTE4N,
    BYTE4N,
    SHORT2,
    SHORT4,
    USHORT2,
    USHORT4,
    SHORT2N,
    SHORT4N,
    USHORT2N,
    USHORT4N,
    UDEC3,
    DEC3,
    UDEC3N,
    DEC3N,
    UDEC4,
    DEC4,
    UDEC4N,
    DEC4N,
    UHEND3,
    HEND3,
    UHEND3N,
    HEND3N,
    UDHEN3,
    DHEN3,
    UDHEN3N,
    DHEN3N,
    FLOAT16_2,
    FLOAT16_4
}

export class FifaUtil {
    private static readonly encoder = new TextEncoder()
    private static readonly decoder = new TextDecoder('utf-8')

    private static readonly c_LanguageHashtable: Uint32Array = new Uint32Array([
        0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324,
        3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648,
        2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636,
        335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145,
        1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101,
        3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705,
        3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565,
        1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290,
        251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866,
        2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202,
        4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538,
        1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467,
        855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635,
        3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443,
        3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523,
        3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580,
        2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920,
        282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732,
        1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512,
        3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109,
        3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625,
        752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877,
        83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881,
        2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934,
        4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406,
        1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270,
        936918000, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150,
        3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471,
        3272380065, 1510334235, 755167117
    ])

    private static toUInt32(v: number): UInt32 {
        return v >>> 0
    }

    private static imul(a: number, b: number): number {
        return Math.imul(a, b) | 0
    }

    private static uint32ToFloat(u: number): number {
        const buf = new ArrayBuffer(4)
        const dv = new DataView(buf)
        dv.setUint32(0, u >>> 0, true)
        return dv.getFloat32(0, true)
    }

    private static swap16(x: number): number {
        return ((x & 0xff) << 8) | ((x >>> 8) & 0xff)
    }

    private static swap32(x: number): number {
        const u = x >>> 0
        return (
            ((u & 0xff) << 24) |
            ((u & 0xff00) << 8) |
            ((u >>> 8) & 0xff00) |
            ((u >>> 24) & 0xff)
        ) >>> 0
    }

    private static swap64(x: bigint): bigint {
        const u = x & 0xffffffffffffffffn
        return (
            ((u & 0xffn) << 56n) |
            ((u & 0xff00n) << 40n) |
            ((u & 0xff0000n) << 24n) |
            ((u & 0xff000000n) << 8n) |
            ((u >> 8n) & 0xff000000n) |
            ((u >> 24n) & 0xff0000n) |
            ((u >> 40n) & 0xff00n) |
            ((u >> 56n) & 0xffn)
        )
    }

    private static adler32(bytes: Uint8Array, length: number): UInt32 {
        let a = 1
        let b = 0
        const mod = 0xfff1
        for (let i = 0; i < length; i++) {
            a = (a + bytes[i]) % mod
            b = (b + a) % mod
        }
        return (((b << 16) | a) >>> 0)
    }

    private static APHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0xaaaaaaaa >>> 0
        for (let i = 0; i < length; i++) {
            const c = bytes[i] >>> 0
            if ((i & 1) === 0) {
                h = (h ^ (((h << 7) >>> 0) ^ (FifaUtil.imul(c, (h >>> 3) >>> 0) >>> 0))) >>> 0
            } else {
                const t = (((h << 11) >>> 0) + (c ^ (h >>> 5))) >>> 0
                h = (h ^ (~t >>> 0)) >>> 0
            }
        }
        return h >>> 0
    }

    private static BKDRHash(bytes: Uint8Array, length: number): UInt32 {
        const seed = 0x83
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            h = (FifaUtil.imul(h, seed) + bytes[i]) >>> 0
        }
        return h >>> 0
    }

    private static BPHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            h = (((h << 7) >>> 0) ^ bytes[i]) >>> 0
        }
        return h >>> 0
    }

    static compareWildcardString(pattern: string, target: string): boolean {
        let p = 0
        let t = 0
        let star = 0
        pattern = pattern.toLowerCase()
        target = target.toLowerCase()

        while (t < target.length && p < pattern.length) {
            const pc = pattern[p]
            const tc = target[t]

            if (pc === '?') {
                p += 1
            } else if (pc === '\\' || pc === '/') {
                if (star === 0) {
                    if (tc !== '\\' && tc !== '/') return false
                    p += 1
                } else if (tc === '\\' || tc === '/') {
                    star = 0
                    p += 1
                }
            } else if (pc === '*') {
                if (p === pattern.length - 1) return true
                p += 1
                star = 1
            } else {
                if (star === 0) {
                    if (pc !== tc) return false
                    p += 1
                } else if (pc === tc) {
                    star = 0
                    p += 1
                }
            }

            t += 1
        }

        return t === target.length && p === pattern.length
    }

    static computeAlignement(v: number): number {
        let mask = 1
        if (v === 0) return 1
        for (let i = 0; i < 0x1f; i++) {
            if ((v & mask) !== 0) return ((mask + 1) / 2) | 0
            mask = (mask * 2 + 1) | 0
        }
        return 0
    }

    static computeAlignementLong(v: bigint): number {
        let mask = 1n
        if (v === 0n) return 1
        for (let i = 0; i < 0x3f; i++) {
            if ((v & mask) !== 0n) return Number((mask + 1n) / 2n)
            mask = mask * 2n + 1n
        }
        return 0
    }

    static computeBhHash(name: string): bigint {
        let h = 0x1505n
        for (let i = 0; i < name.length; i++) {
            h = (h * 33n + BigInt(name.charCodeAt(i))) & 0xffffffffffffffffn
        }
        return h
    }

    static computeBhHashBytes(bytes: Uint8Array, length: number): bigint {
        let h = 0x1505n
        for (let i = 0; i < length; i++) {
            h = (h * 33n + BigInt(bytes[i])) & 0xffffffffffffffffn
        }
        return h
    }

    static computeBitUsed(range: UInt32): number {
        const r = range >>> 0
        if (r === 0) return 1
        for (let i = 0x20; i > 0; i--) {
            const m = (1 << (i - 1)) >>> 0
            if ((r & m) !== 0) return i
        }
        return 0
    }

    static computeBucket(hash: number, extension: string): number {
        const ext = extension.toLowerCase()
        let base: number

        if (ext === '.fsh') base = 0x00
        else if (ext === '.jdi' || ext === '.ini') base = 0x20
        else if (ext === '.tvb' || ext === '.irr') base = 0x40
        else if (ext === '.loc' || ext === '.cs') base = 0x60
        else if (ext === '.shd' || ext === '.txt' || ext === '.dat' || ext === '.hud') base = 0x80
        else if (ext === '.ttf' || ext === '.bin' || ext === '.skn') base = 0xc0
        else if (ext === '.o' || ext === '.big' || ext === '.ebo') base = 0xe0
        else return 0

        return (((0x21 * hash + base) % 0x100) & 0xff) | 0
    }

    static computeCrcDb11(bytes: Uint8Array): Int32 {
        let crc = -1 | 0
        for (let i = 0; i < bytes.length; i++) {
            crc = (crc ^ ((bytes[i] & 0xff) << 24)) | 0
            for (let bit = 0; bit < 8; bit++) {
                if (crc >= 0) {
                    crc = (crc << 1) | 0
                } else {
                    crc = ((crc << 1) ^ 0x04c11db7) | 0
                }
            }
        }
        return crc | 0
    }

    static computeCrcDb11Text(text: string): Int32 {
        return FifaUtil.computeCrcDb11(FifaUtil.encoder.encode(text))
    }

    static computeHash(fileName: string): Int32 {
        let h = 0x47b8a2 | 0
        for (let i = 0; i < fileName.length; i++) {
            h = (h + fileName.charCodeAt(i)) | 0
            h = FifaUtil.imul(h, 0x21) | 0
        }
        return h | 0
    }

    static computeLanguageHash(name: string): UInt32 {
        const bytes = FifaUtil.encoder.encode(name)
        return FifaUtil.EAHash(bytes, bytes.length)
    }

    static convertBytesToString(bytes: Uint8Array): string {
        return FifaUtil.decoder.decode(bytes)
    }

    static convertStringToBytes(str: string): Uint8Array {
        return FifaUtil.encoder.encode(str)
    }

    static convertFromDate(date: Date): number {
        const base = new Date(Date.UTC(0x62e, 9, 14, 0, 0, 0))
        const diffMs = date.getTime() - base.getTime()
        return Math.floor(diffMs / 86400000)
    }

    static convertToDate(gregorian: number): Date {
        const base = new Date(Date.UTC(0x62e, 9, 14, 12, 0, 0))
        if (gregorian < 0) return base
        return new Date(base.getTime() + gregorian * 86400000)
    }

    static decompress(float16Bit: number): number {
        const h = float16Bit & 0xffff
        let s = (h >> 15) & 0x1
        let e = (h >> 10) & 0x1f
        let f = h & 0x3ff

        if (e === 0) {
            if (f === 0) {
                return FifaUtil.uint32ToFloat((s << 31) >>> 0)
            }
            while ((f & 0x400) === 0) {
                f <<= 1
                e -= 1
            }
            e += 1
            f &= ~0x400
        } else if (e === 31) {
            if (f === 0) return FifaUtil.uint32ToFloat(((s << 31) | 0x7f800000) >>> 0)
            return FifaUtil.uint32ToFloat(((s << 31) | 0x7f800000 | (f << 13)) >>> 0)
        }

        e = e + (127 - 15)
        f = f << 13
        const bits = ((s << 31) | (e << 23) | f) >>> 0
        return FifaUtil.uint32ToFloat(bits)
    }

    private static DEKHash(bytes: Uint8Array, length: number): UInt32 {
        let h = length >>> 0
        for (let i = 0; i < length; i++) {
            h = ((((h << 5) >>> 0) ^ (h >>> 27)) ^ bytes[i]) >>> 0
        }
        return h >>> 0
    }

    private static DJBHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0x1505 >>> 0
        for (let i = 0; i < length; i++) {
            h = (((h << 5) + h + bytes[i]) >>> 0)
        }
        return h >>> 0
    }

    private static EAHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            let idx = bytes[i] & 0xff
            idx = idx & 0xdf
            idx = (idx ^ h) & 0xff
            h = (h >>> 8) >>> 0
            h = (h ^ FifaUtil.c_LanguageHashtable[idx]) >>> 0
        }
        return (h ^ 0x80000000) >>> 0
    }

    private static ELFHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        let x = 0 >>> 0
        for (let i = 0; i < length; i++) {
            h = (((h << 4) >>> 0) + bytes[i]) >>> 0
            x = (h & 0xf0000000) >>> 0
            if (x !== 0) h = (h ^ (x >>> 24)) >>> 0
            h = (h & (~x >>> 0)) >>> 0
        }
        return h >>> 0
    }

    private static fletcher32(bytes: Uint8Array, length: number): UInt32 {
        let sum1 = 0 >>> 0
        let sum2 = 0 >>> 0
        for (let i = 0; i < length; i++) {
            sum1 = (sum1 + bytes[i]) >>> 0
            if (sum1 >= 0xffff) sum1 = (sum1 - 0xffff) >>> 0
            sum2 = (sum2 + sum1) >>> 0
            if (sum2 >= 0xffff) sum2 = (sum2 - 0xffff) >>> 0
        }
        return (((sum2 << 16) | sum1) >>> 0)
    }

    static FNVHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 2166136261 >>> 0
        for (let i = 0; i < length; i++) {
            let c = bytes[i] & 0xff
            if (c >= 65 && c <= 90) c = (c + 32) & 0xff
            h = (h ^ c) >>> 0
            h = Math.imul(h, 16777619) >>> 0
        }
        return h >>> 0
    }

    static isFileLocked(filePath: string): boolean {
        try {
            const fs = require('node:fs') as typeof import('node:fs')
            const fd = fs.openSync(filePath, 'r+')
            fs.closeSync(fd)
            return false
        } catch {
            return true
        }
    }

    private static jenkins_one_at_a_time_hash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        let i = 0
        while (i < length) {
            h = (h + bytes[i]) >>> 0
            h = (h + ((h << 10) >>> 0)) >>> 0
            h = (h ^ (h >>> 6)) >>> 0
            i += 1
        }
        h = (h + ((h << 3) >>> 0)) >>> 0
        h = (h ^ (h >>> 11)) >>> 0
        h = (h + ((h << 15) >>> 0)) >>> 0
        return h >>> 0
    }

    private static JSHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0x4e67c6a7 >>> 0
        for (let i = 0; i < length; i++) {
            h = (h ^ (((h << 5) >>> 0) + bytes[i] + (h >>> 2))) >>> 0
        }
        return h >>> 0
    }

    static limit(val: number, min: number, max: number): number {
        if (val < min) return min
        if (val > max) return max
        return val
    }

    private static MurmurHash2(bytes: Uint8Array, lengthIn: number): UInt32 {
        let length = lengthIn | 0
        let h = (length >>> 0) >>> 0
        let index = 0
        const m = 0x5bd1e995 >>> 0

        while (length >= 4) {
            let k = bytes[index] >>> 0
            k = (k * 0x100 + bytes[index + 1]) >>> 0
            k = (k * 0x100 + bytes[index + 2]) >>> 0
            k = (k * 0x100 + bytes[index + 3]) >>> 0

            k = Math.imul(k, m) >>> 0
            k = (k ^ (k >>> 24)) >>> 0
            k = Math.imul(k, m) >>> 0

            h = Math.imul(h, m) >>> 0
            h = (h ^ k) >>> 0

            index += 4
            length -= 4
        }

        if (length === 3) h = (h ^ ((bytes[index + 2] & 0xff) << 16)) >>> 0
        if (length >= 2) h = (h ^ ((bytes[index + 1] & 0xff) << 8)) >>> 0
        h = (h ^ (bytes[index] & 0xff)) >>> 0

        h = Math.imul(h, m) >>> 0
        h = (h ^ (h >>> 13)) >>> 0
        h = Math.imul(h, m) >>> 0
        return (h ^ (h >>> 15)) >>> 0
    }

    static padBlanks(s: string, len: number): string {
        if (len > s.length) {
            const count = len - s.length
            for (let i = 0; i < count; i++) s = ' ' + s
        }
        return s
    }

    private static PJWHash(bytes: Uint8Array, length: number): UInt32 {
        const BitsInUnsignedInt = 0x20
        const ThreeQuarters = ((BitsInUnsignedInt * 3) / 4) | 0
        const OneEighth = (BitsInUnsignedInt / 8) | 0
        const HighBits = ((0xffffffff << (BitsInUnsignedInt - OneEighth)) >>> 0)

        let h = 0 >>> 0
        let test = 0 >>> 0

        for (let i = 0; i < length; i++) {
            h = (((h << OneEighth) >>> 0) + bytes[i]) >>> 0
            test = (h & HighBits) >>> 0
            if (test !== 0) {
                h = ((h ^ (test >>> ThreeQuarters)) & (~HighBits >>> 0)) >>> 0
            }
        }

        return h >>> 0
    }

    static readNullPaddedString(r: BinaryReaderLike, length: number): string {
        const bytes = r.readBytes(length)
        let i = 0
        while (i < length && bytes[i] !== 0) i += 1
        if (i === 0) return ''
        return FifaUtil.decoder.decode(bytes.slice(0, i))
    }

    static readNullTerminatedByteArray(r: BinaryReaderLike, length: number): string {
        const chars: number[] = new Array(length)
        let end = 0
        for (let i = 0; i < length; i++) {
            if (r.peekByte() === -1) {
                end = i
                break
            }
            const b = r.readByte() & 0xff
            if (b === 0 && end === 0) end = i
            chars[i] = b
        }
        const outBytes = Uint8Array.from(chars.slice(0, end))
        return new TextDecoder('latin1').decode(outBytes)
    }

    static readNullTerminatedString(r: BinaryReaderLike): string {
        const bytes: number[] = []
        while (r.peekByte() !== 0) {
            const b = r.readByte()
            bytes.push(b)
        }
        r.readByte()
        return new TextDecoder('latin1').decode(Uint8Array.from(bytes))
    }

    static readNullTerminatedStringAligned(r: BinaryReaderLike, padding: number): string {
        const s = FifaUtil.readNullTerminatedString(r)
        const mod = (s.length + 1) % padding
        if (mod !== 0) r.readBytes(padding - mod)
        return s
    }

    static readString(r: BinaryReaderLike, offset: number): string {
        const pos = r.position
        r.position = offset
        const count = r.readInt16()
        r.position = pos
        return FifaUtil.decoder.decode(r.readBytes(count))
    }

    static readStringFixed(r: BinaryReaderLike, offset: number, length: number): string {
        r.position = offset
        return FifaUtil.decoder.decode(r.readBytes(length))
    }

    static roundUp(v: number, align: number): number {
        return ((v + (align - 1)) & ~(align - 1)) | 0
    }

    static roundUpLong(v: bigint, align: bigint): bigint {
        return (v + (align - 1n)) & ~(align - 1n)
    }

    static roundUp4(v: number): number {
        return ((v + 3) & -4) | 0
    }

    private static RSHash(bytes: Uint8Array, length: number): UInt32 {
        let a = 0x5c6b7 >>> 0
        let b = 0xf8c9 >>> 0
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            h = (Math.imul(h, b) + bytes[i]) >>> 0
            b = Math.imul(b, a) >>> 0
        }
        return h >>> 0
    }

    private static sdbm(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            let t = (h << 6) >>> 0
            t = (t + ((h << 16) >>> 0)) >>> 0
            t = (t - h) >>> 0
            h = (bytes[i] + t) >>> 0
        }
        return h >>> 0
    }

    private static SDBMHash(bytes: Uint8Array, length: number): UInt32 {
        let h = 0 >>> 0
        for (let i = 0; i < length; i++) {
            h = (bytes[i] + ((h << 6) >>> 0) + ((h << 16) >>> 0) - h) >>> 0
        }
        return h >>> 0
    }

    static stringSize(s: string): number {
        const byteCount = FifaUtil.encoder.encode(s).length
        return FifaUtil.roundUp4((byteCount + 2) | 0)
    }

    static swapEndianInt32(x: number): number {
        const swapped = FifaUtil.swap32(x)
        return swapped | 0
    }

    static swapEndianInt64(x: bigint): bigint {
        return FifaUtil.swap64(x)
    }

    static swapEndianUInt16(x: number): number {
        return FifaUtil.swap16(x) & 0xffff
    }

    static swapEndianUInt32(x: number): number {
        return FifaUtil.swap32(x)
    }

    static swapEndianUInt64(x: bigint): bigint {
        return FifaUtil.swap64(x) & 0xffffffffffffffffn
    }

    static tryAllaCrc32(bytes: Uint8Array, expected: UInt32): boolean {
        const length = bytes.length
        const expectedSwapped = FifaUtil.swapEndianUInt32(expected)
        let h = FifaUtil.sdbm(bytes, length)

        const ok = (x: number) => (x >>> 0) === (expected >>> 0) || (x >>> 0) === (expectedSwapped >>> 0)

        if (!ok(h)) {
            h = FifaUtil.RSHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.JSHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.PJWHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.ELFHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.BKDRHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.SDBMHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.DJBHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.DEKHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.BPHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.APHash(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.adler32(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.fletcher32(bytes, length)
            if (ok(h)) return true

            h = FifaUtil.jenkins_one_at_a_time_hash(bytes, length)
            if (ok(h)) return true

            h = Number(FifaUtil.computeBhHashBytes(bytes, length) & 0xffffffffn) >>> 0
            if (ok(h)) return true

            h = FifaUtil.toUInt32(FifaUtil.computeCrcDb11(bytes))
            if (!ok(h)) return false
        }

        return true
    }

    static writeNullPaddedString(w: BinaryWriterLike, str: string | null | undefined, length: number) {
        const s = str ?? ''
        const bytes = FifaUtil.encoder.encode(s)
        if (bytes.length > length) {
            w.writeBytes(bytes.slice(0, length))
        } else {
            w.writeBytes(bytes)
            for (let i = bytes.length; i < length; i++) w.writeByte(0)
        }
    }

    static writeNullTerminatedByteArray(w: BinaryWriterLike, s: string, nBytes: number) {
        const bytes = new TextEncoder().encode(s)
        for (let i = 0; i < nBytes; i++) {
            w.writeByte(i < bytes.length ? bytes[i] : 0)
        }
    }

    static writeNullTerminatedString(w: BinaryWriterLike, s: string) {
        const bytes = new TextEncoder().encode(s)
        w.writeBytes(bytes)
        w.writeByte(0)
    }

    static writeString(w: BinaryWriterLike, offset: number, s: string | null | undefined): number {
        const current = w.position
        w.position = offset

        const text = s ?? ' '
        const bytes = FifaUtil.encoder.encode(text)
        const byteCount = bytes.length & 0xffff
        const total = byteCount + 2

        w.writeInt16(byteCount)
        w.writeBytes(bytes)

        if ((total & 3) !== 0) {
            const pad = 4 - (total & 3)
            for (let i = 0; i < pad; i++) w.writeByte(0)
        }

        w.position = current
        return w.position | 0
    }

    static DEC3NtoFloats(var32Bit: number): number[] {
        let x = var32Bit & 1023
        let y = (var32Bit >> 10) & 1023
        let z = (var32Bit >> 20) & 1023

        let xf: number
        let yf: number
        let zf: number

        if (x > 511) {
            xf = x / 512 - 2
        } else {
            xf = x / 511
        }

        if (y > 511) {
            yf = y / 512 - 2
        } else {
            yf = y / 511
        }

        if (z > 511) {
            zf = z / 512 - 2
        } else {
            zf = z / 511
        }

        return [xf, yf, zf]
    }

    static floatsToDEC3N(x: number, y: number, z: number): number {
        const px = FifaUtil.packFloatTo10Bit(x)
        const py = FifaUtil.packFloatTo10Bit(y)
        const pz = FifaUtil.packFloatTo10Bit(z)
        return (px | (py << 10) | (pz << 20)) >>> 0
    }

    static packFloatTo10Bit(value: number): number {
        if (value < 0.0) return Math.round((value + 2) * 512.0) | 0
        return Math.round(value * 511.0) | 0
    }

    static packWFloatTo2Bit(value: number): number {
        return Math.trunc(value * 3.0) | 0
    }

    static writeAlignment16(w: BinaryWriterLike) {
        FifaUtil.writeAlignment(w, 16)
    }

    static writeAlignment(w: BinaryWriterLike, alignment: number) {
        while ((w.position % alignment) !== 0) w.writeByte(0)
    }

    static writeValue(w: BinaryWriterLike, value: UInt32, offset: number) {
        const current = w.position
        w.position = offset
        w.writeUInt32(value >>> 0)
        w.position = current
    }

    static writeSectionTotalSize(w: BinaryWriterLike, offsetStart: number): number
    static writeSectionTotalSize(w: BinaryWriterLike, offsetStart: number, offsetEnd: number, swapEndian: any): number
    static writeSectionTotalSize(
        w: BinaryWriterLike,
        offsetStart: number,
        offsetEnd?: number,
        swapEndian?: any
    ): number {
        const end = (offsetEnd !== undefined) ? offsetEnd : w.position
        const totalSize = (end - offsetStart) >>> 0

        FifaUtil.writeValue(w, totalSize as any, offsetStart)

        return totalSize
    }

    static writeNullPaddings(w: BinaryWriterLike, nBytes: number) {
        for (let i = 0; i < nBytes; i++) w.writeByte(0)
    }

    static read64SizedString(r: BinaryReaderLike): string {
        const bytes: number[] = []
        let count = 0
        while (r.peekByte() !== 0 && count < 64) {
            bytes.push(r.readByte() & 0xff)
            count += 1
        }

        const padding = 64 - bytes.length
        if (padding > 0) r.readBytes(padding)
        return new TextDecoder('latin1').decode(Uint8Array.from(bytes))
    }

    static write64SizedString(w: BinaryWriterLike, s: string) {
        const bytes = new TextEncoder().encode(s)
        w.writeBytes(bytes.slice(0, 64))
        const padding = 64 - Math.min(bytes.length, 64)
        for (let i = 0; i < padding; i++) w.writeByte(0)
    }

    static getValueFrom32bit(value: number, offset: number, length: number): UInt32 {
        let v = value >>> 0
        if (offset > 0) v = v >>> offset
        let mask = Math.pow(2, length) | 0
        mask = (mask - 1) | 0
        return (v & (mask >>> 0)) >>> 0
    }

    static getValueFrom16bit(value: number, offset: number, length: number): number {
        let v = value & 0xffff
        if (offset > 0) v = v >>> offset
        const mask = (Math.pow(2, length) - 1) & 0xffff
        return (v & mask) & 0xffff
    }

    static setValueTo32bit(targetValue: number, value: number, offset: number, length: number): UInt32 {
        const mask = (0xffffffff - (((Math.pow(2, length) - 1) << offset) >>> 0)) >>> 0
        let t = (targetValue >>> 0) & mask
        t = (t | ((value >>> 0) << offset)) >>> 0
        return t >>> 0
    }

    static setValueTo16bit(targetValue: number, value: number, offset: number, length: number): number {
        const mask = (0xffff - (((Math.pow(2, length) - 1) << offset) & 0xffff)) & 0xffff
        let t = (targetValue & 0xffff) & mask
        t = (t | ((value & 0xffff) << offset)) & 0xffff
        return t & 0xffff
    }

    static getIndexStride(indexData: number[]): number {
        let max = 0
        for (let i = 0; i < indexData.length; i++) if (indexData[i] > max) max = indexData[i]
        return max > 0xffff ? 4 : 2
    }

    static getVertexStride(vertexFormat: VertexElement[]): number {
        let stride = 0
        for (let i = 0; i < vertexFormat.length; i++) {
            stride += FifaUtil.getVFormatTypeSize(vertexFormat[i].DataType)
        }
        return stride >>> 0
    }

    static calcVFormatOffsets(vertexFormat: VertexElement[]) {
        for (let i = 0; i < vertexFormat.length; i++) {
            if (i === 0) {
                vertexFormat[i].Offset = 0
            } else {
                vertexFormat[i].Offset = vertexFormat[i - 1].Offset + FifaUtil.getVFormatTypeSize(vertexFormat[i - 1].DataType)
            }
        }
    }

    private static getVFormatTypeSize(dataType: D3DDECLTYPE): number {
        switch (dataType) {
            case D3DDECLTYPE.FLOAT1: return 4
            case D3DDECLTYPE.FLOAT2: return 8
            case D3DDECLTYPE.FLOAT3: return 12
            case D3DDECLTYPE.FLOAT4: return 16
            case D3DDECLTYPE.INT1: return 4
            case D3DDECLTYPE.INT2: return 8
            case D3DDECLTYPE.INT4: return 16
            case D3DDECLTYPE.UINT1: return 4
            case D3DDECLTYPE.UINT2: return 8
            case D3DDECLTYPE.UINT4: return 16
            case D3DDECLTYPE.INT1N: return 4
            case D3DDECLTYPE.INT2N: return 8
            case D3DDECLTYPE.INT4N: return 16
            case D3DDECLTYPE.UINT1N: return 4
            case D3DDECLTYPE.UINT2N: return 8
            case D3DDECLTYPE.UINT4N: return 16
            case D3DDECLTYPE.D3DCOLOR: return 4
            case D3DDECLTYPE.UBYTE4: return 4
            case D3DDECLTYPE.BYTE4: return 4
            case D3DDECLTYPE.UBYTE4N: return 4
            case D3DDECLTYPE.BYTE4N: return 4
            case D3DDECLTYPE.SHORT2: return 4
            case D3DDECLTYPE.SHORT4: return 8
            case D3DDECLTYPE.USHORT2: return 4
            case D3DDECLTYPE.USHORT4: return 8
            case D3DDECLTYPE.SHORT2N: return 4
            case D3DDECLTYPE.SHORT4N: return 8
            case D3DDECLTYPE.USHORT2N: return 4
            case D3DDECLTYPE.USHORT4N: return 8
            case D3DDECLTYPE.UDEC3: return 4
            case D3DDECLTYPE.DEC3: return 4
            case D3DDECLTYPE.UDEC3N: return 4
            case D3DDECLTYPE.DEC3N: return 4
            case D3DDECLTYPE.UDEC4: return 4
            case D3DDECLTYPE.DEC4: return 4
            case D3DDECLTYPE.UDEC4N: return 4
            case D3DDECLTYPE.DEC4N: return 4
            case D3DDECLTYPE.UHEND3: return 4
            case D3DDECLTYPE.HEND3: return 4
            case D3DDECLTYPE.UHEND3N: return 4
            case D3DDECLTYPE.HEND3N: return 4
            case D3DDECLTYPE.UDHEN3: return 4
            case D3DDECLTYPE.DHEN3: return 4
            case D3DDECLTYPE.UDHEN3N: return 4
            case D3DDECLTYPE.DHEN3N: return 4
            case D3DDECLTYPE.FLOAT16_2: return 4
            case D3DDECLTYPE.FLOAT16_4: return 8
            default: return 0
        }
    }

    static str2Hash(str: string): number {
        let h = 5321 >>> 0
        for (let i = 0; i < str.length; i++) {
            h = (Math.imul(h, 33) + str.charCodeAt(i)) >>> 0
        }
        return h >>> 0
    }
}
