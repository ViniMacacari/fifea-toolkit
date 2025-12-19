import { BufferReader, FifaUtil, type BinaryReaderLike } from '../utils/fifa-util'

export enum ETextureFormat {
    BC1,
    BC2,
    BC3,
    BC4,
    BC5,
    BC6H_UF16,
    BC7,

    B8G8R8A8,
    B8G8R8,
    B4G4R4A4,
    B5G6R5,
    B5G5R5A1,
    L8,
    L8A8,
    R32G32B32A32Float,
    R8G8B8A8
}

export enum PixelFormat {
    Format24bppRgb = 'Format24bppRgb',
    Format32bppArgb = 'Format32bppArgb'
}

export enum ImageLockMode {
    WriteOnly = 'WriteOnly'
}

export class Rectangle {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly width: number,
        public readonly height: number
    ) { }
}

export class BitmapData {
    constructor(
        public readonly scan0: number,
        public readonly stride: number
    ) { }
}

export class Bitmap {
    readonly width: number
    readonly height: number
    readonly pixelFormat: PixelFormat
    readonly stride: number
    readonly buffer: Uint8Array

    constructor(width: number, height: number, pixelFormat: PixelFormat) {
        this.width = width | 0
        this.height = height | 0
        this.pixelFormat = pixelFormat

        const bpp = this.getBytesPerPixel(pixelFormat)
        const rawStride = this.width * bpp

        // GDI+ stride: alinhado em 4 bytes
        // stride = ((bitsPerRow + 31) / 32) * 4
        // para bytes: roundUp(rawStride, 4)
        this.stride = (rawStride + 3) & ~3

        this.buffer = new Uint8Array(this.stride * this.height)
    }

    LockBits(rect: Rectangle, mode: ImageLockMode, pf: PixelFormat): BitmapData {
        if (pf !== this.pixelFormat) {
            // no VB, você passa Format24bppRgb fixo no 24bpp e m_Bitmap.PixelFormat no 32bpp
            // aqui mantemos a mesma exigência
            throw new Error('PixelFormat mismatch')
        }
        if (mode !== ImageLockMode.WriteOnly) throw new Error('Unsupported lock mode')
        if (rect.x !== 0 || rect.y !== 0 || rect.width !== this.width || rect.height !== this.height)
            throw new Error('Only full-rect LockBits is supported')

        // scan0 seria ponteiro no .NET; aqui é offset 0
        return new BitmapData(0, this.stride)
    }

    UnlockBits(_bitmapData: BitmapData): void { }

    private getBytesPerPixel(pf: PixelFormat): number {
        if (pf === PixelFormat.Format24bppRgb) return 3
        if (pf === PixelFormat.Format32bppArgb) return 4
        throw new Error('Unsupported PixelFormat')
    }
}

function marshalCopyToBitmap(source: Uint8Array, destinationBitmap: Bitmap, length: number) {
    if (length < 0) throw new Error('Invalid length')
    if (length > source.length) throw new Error('Source too small')
    if (length > destinationBitmap.buffer.length) throw new Error('Destination too small')
    destinationBitmap.buffer.set(source.subarray(0, length), 0)
}

export interface GraphicUtilLike {
    GetTextureSize(width: number, height: number, fmt: ETextureFormat): number
}

export const GraphicUtil: GraphicUtilLike = {
    GetTextureSize: (_w, _h, _f) => {
        throw new Error('GraphicUtil.GetTextureSize não implementado aqui')
    }
}

export enum CompressionMethod {
    DXT1 = 'DXT1',
    DXT3 = 'DXT3',
    DXT5 = 'DXT5'
}

export enum CompressionFormat {
    BC1WithAlpha = 'BC1WithAlpha',
    BC2 = 'BC2',
    BC3 = 'BC3',
    BC4 = 'BC4',
    BC5 = 'BC5',
    BC6 = 'BC6',
    BC7 = 'BC7'
}

export interface BcDecoderLike {
    OutputOptions: {
        blueRecalculate: boolean
    }
    DecodeRawData(rawData: Uint8Array, width: number, height: number, format: CompressionFormat): Bitmap
}

export class RawImage {
    private m_Width: number
    private m_Height: number
    private m_TextureFormat: ETextureFormat
    private m_Size: number
    private m_SwapEndian_DxtBlock: boolean
    private m_Tiled360: boolean

    private m_Bitmap: Bitmap32 | Bitmap24 | null = null
    private m_RawData: Uint8Array = new Uint8Array(0)

    NeedToSaveRawData = false

    get Width() {
        return this.m_Width
    }
    set Width(v: number) {
        this.m_Width = v >>> 0
    }

    constructor(
        width: number,
        height: number,
        TextureFormat: ETextureFormat,
        size: number,
        SwapEndian_DxtBlock: boolean,
        Tiled360 = false
    ) {
        this.m_Width = width >>> 0
        this.m_Height = height >>> 0
        this.m_TextureFormat = TextureFormat
        this.m_Size = size >>> 0
        this.m_SwapEndian_DxtBlock = SwapEndian_DxtBlock
        this.m_Tiled360 = Tiled360
        this.m_Bitmap = null
    }

    private CreateRawData(): void {
        if (this.m_Width < 1) this.m_Width = 1
        if (this.m_Height < 1) this.m_Height = 1

        if (!this.m_Bitmap) throw new Error('m_Bitmap is Nothing')
        if (GraphicUtil.GetTextureSize(this.m_Bitmap.width, this.m_Bitmap.height, this.m_TextureFormat) > this.m_RawData.length) {
            return // VB: Exit Sub
        }

        switch (this.m_TextureFormat) {
            case ETextureFormat.BC1:
            case ETextureFormat.BC2:
            case ETextureFormat.BC3:
            case ETextureFormat.BC5:
            case ETextureFormat.BC4:
            case ETextureFormat.BC6H_UF16:
            case ETextureFormat.BC7:
                this.WriteBitmapToDxt()
                break

            case ETextureFormat.B8G8R8A8:
                this.WriteBitmapToB8G8R8A8()
                break

            case ETextureFormat.B8G8R8:
                this.WriteBitmapToB8G8R8()
                break

            case ETextureFormat.B4G4R4A4:
                this.WriteBitmapToB4G4R4A4()
                break

            case ETextureFormat.B5G6R5:
                this.WriteBitmapToB5G6R5()
                break

            case ETextureFormat.B5G5R5A1:
                this.WriteBitmapToB5G5R5A1()
                break

            case ETextureFormat.L8:
                this.WriteBitmapToL8()
                break

            case ETextureFormat.L8A8:
                this.WriteBitmapToL8A8()
                break

            case ETextureFormat.R32G32B32A32Float:
                this.WriteBitmapToR32G32B32A32F()
                break

            case ETextureFormat.R8G8B8A8:
                this.WriteBitmapToR8G8B8A8()
                break

            default:
                return
        }
    }

    public Load(r: BinaryReaderLike): boolean {
        if (this.m_Height <= 1 || this.Width <= 1) {
            if (this.m_Height <= 1) this.m_Height = 1
            if (this.Width <= 1) this.Width = 1
        }

        this.m_RawData = r.readBytes(this.m_Size)

        this.NeedToSaveRawData = false
        return true
    }

    private GetBCnEncoderFormat(m_TextureFormat: ETextureFormat): CompressionFormat | null {
        switch (m_TextureFormat) {
            case ETextureFormat.BC1:
                return CompressionFormat.BC1WithAlpha
            case ETextureFormat.BC2:
                return CompressionFormat.BC2
            case ETextureFormat.BC3:
                return CompressionFormat.BC3
            case ETextureFormat.BC4:
                return CompressionFormat.BC4
            case ETextureFormat.BC5:
                return CompressionFormat.BC5
            case ETextureFormat.BC6H_UF16:
                return CompressionFormat.BC6
            case ETextureFormat.BC7:
                return CompressionFormat.BC7
        }

        return null
    }

    private GetImageMagickCompressionMethod(TextureFormat: ETextureFormat): CompressionMethod | null {
        switch (TextureFormat) {
            case ETextureFormat.BC1:
                return CompressionMethod.DXT1
            case ETextureFormat.BC2:
                return CompressionMethod.DXT3
            case ETextureFormat.BC3:
                return CompressionMethod.DXT5
        }

        return null
    }

    private WriteBitmapToDxt(): void {
        throw new Error('WriteBitmapToDxt não implementado aqui')
    }
    private WriteBitmapToB8G8R8A8(): void {
        throw new Error('WriteBitmapToB8G8R8A8 não implementado aqui')
    }
    private WriteBitmapToB8G8R8(): void {
        throw new Error('WriteBitmapToB8G8R8 não implementado aqui')
    }
    private WriteBitmapToB4G4R4A4(): void {
        throw new Error('WriteBitmapToB4G4R4A4 não implementado aqui')
    }
    private WriteBitmapToB5G6R5(): void {
        throw new Error('WriteBitmapToB5G6R5 não implementado aqui')
    }
    private WriteBitmapToB5G5R5A1(): void {
        throw new Error('WriteBitmapToB5G5R5A1 não implementado aqui')
    }
    private WriteBitmapToL8(): void {
        throw new Error('WriteBitmapToL8 não implementado aqui')
    }
    private WriteBitmapToL8A8(): void {
        throw new Error('WriteBitmapToL8A8 não implementado aqui')
    }
    private WriteBitmapToR32G32B32A32F(): void {
        throw new Error('WriteBitmapToR32G32B32A32F não implementado aqui')
    }
    private WriteBitmapToR8G8B8A8(): void {
        throw new Error('WriteBitmapToR8G8B8A8 não implementado aqui')
    }

    private CreateBcDecoder(): BcDecoderLike {
        throw new Error('BCn decoder não implementado aqui (plugar lib equivalente ao BCnEncoder.NET)')
    }

    private CreateBitmap(): void {
        let RawDataFixed = this.m_RawData.slice()

        if (this.m_Tiled360) {
            RawDataFixed = this.ConvertToLinearTexture(
                this.m_RawData.slice(),
                this.m_Width,
                this.m_Height,
                this.m_TextureFormat
            )
        }

        if (this.m_SwapEndian_DxtBlock) {
            const SwapNumBytes = this.GetSwapNumBytes(this.m_TextureFormat)
            if (SwapNumBytes === 0) throw new Error('Invalid SwapNumBytes (0)')

            for (let x = 0; x <= RawDataFixed.length - 1; x += SwapNumBytes) {
                this.reverseRange(RawDataFixed, x, SwapNumBytes)
            }
        }

        if (this.m_Width < 1) this.m_Width = 1
        if (this.m_Height < 1) this.m_Height = 1

        switch (this.m_TextureFormat) {
            case ETextureFormat.BC1:
            case ETextureFormat.BC2:
            case ETextureFormat.BC3:
            case ETextureFormat.BC5:
            case ETextureFormat.BC4:
            case ETextureFormat.BC6H_UF16:
            case ETextureFormat.BC7:
                this.ReadDxtToBitmap(RawDataFixed)
                break

            case ETextureFormat.B8G8R8A8:
                this.ReadB8G8R8A8ToBitmap(RawDataFixed)
                break

            case ETextureFormat.B8G8R8:
                this.ReadB8G8R8ToBitmap(RawDataFixed)
                break

            case ETextureFormat.B4G4R4A4:
                this.ReadB4G4R4A4ToBitmap(RawDataFixed)
                break

            case ETextureFormat.B5G6R5:
                this.ReadB5G6R5ToBitmap(RawDataFixed)
                break

            case ETextureFormat.B5G5R5A1:
                this.ReadB5G5R5A1ToBitmap(RawDataFixed)
                break

            case ETextureFormat.L8:
                this.ReadL8ToBitmap(RawDataFixed)
                break

            case ETextureFormat.L8A8:
                this.ReadL8A8ToBitmap(RawDataFixed)
                break

            case ETextureFormat.R32G32B32A32Float:
                this.ReadR32G32B32A32FToBitmap(RawDataFixed)
                break

            case ETextureFormat.R8G8B8A8:
                this.ReadR8G8B8A8ToBitmap(RawDataFixed)
                break

            default:
                return
        }
    }

    private ReadR8G8B8A8ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        let Index = 0
        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const red = RawDataFixed[Index]; Index += 1
                const green = RawDataFixed[Index]; Index += 1
                const blue = RawDataFixed[Index]; Index += 1
                const alpha = RawDataFixed[Index]; Index += 1

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, red, green, blue))
            }
        }
    }

    private ReadR32G32B32A32FToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        const r = new BufferReader(RawDataFixed)

        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const red = Math.min(FifaUtil.readFloat(r) * 255, 255)
                const green = Math.min(FifaUtil.readFloat(r) * 255, 255)
                const blue = Math.min(FifaUtil.readFloat(r) * 255, 255)
                const alpha = Math.min(FifaUtil.readFloat(r) * 255, 255)

                this.m_Bitmap.setPixel(
                    j,
                    i,
                    Color32.fromArgb(
                        VbConv.toInt32(alpha),
                        VbConv.toInt32(red),
                        VbConv.toInt32(green),
                        VbConv.toInt32(blue)
                    )
                )
            }
        }
    }

    private ReadL8A8ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        let Index = 0
        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const Lum = RawDataFixed[Index]; Index += 1
                const alpha = RawDataFixed[Index]; Index += 1

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, Lum, Lum, Lum))
            }
        }
    }

    private ReadL8ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        let Index = 0
        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const Lum = RawDataFixed[Index]; Index += 1
                const alpha = 255

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, Lum, Lum, Lum))
            }
        }
    }

    private ReadB5G5R5A1ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        const r = new BufferReader(RawDataFixed)

        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const Value = r.readUInt16() & 0xffff

                const blue = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 0, 5) / 31) * 255)
                const green = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 5, 5) / 31) * 255)
                const red = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 10, 5) / 31) * 255)
                const alpha = (FifaUtil.getValueFrom16bit(Value, 15, 1) & 0xffff) * 255

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, red, green, blue))
            }
        }
    }

    private ReadB5G6R5ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap24(this.m_Width, this.m_Height)

        const r = new BufferReader(RawDataFixed)

        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const Value = r.readUInt16() & 0xffff

                const blue = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 0, 5) / 31) * 255)
                const green = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 5, 6) / 63) * 255)
                const red = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 11, 5) / 31) * 255)
                const alpha = 255

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, red, green, blue))
            }
        }
    }

    private ReadB4G4R4A4ToBitmap(RawDataFixed: Uint8Array): void {
        this.m_Bitmap = new Bitmap32(this.m_Width, this.m_Height)

        const r = new BufferReader(RawDataFixed)

        for (let i = 0; i <= this.m_Bitmap.height - 1; i++) {
            for (let j = 0; j <= this.m_Bitmap.width - 1; j++) {
                const Value = r.readUInt16() & 0xffff

                const blue = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 0, 4) / 15) * 255)
                const green = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 4, 4) / 15) * 255)
                const red = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 8, 4) / 15) * 255)
                const alpha = VbConv.toInt32((FifaUtil.getValueFrom16bit(Value, 12, 4) / 15) * 255)

                this.m_Bitmap.setPixel(j, i, Color32.fromArgb(alpha, red, green, blue))
            }
        }
    }

    private reverseRange(arr: Uint8Array, start: number, count: number): void {
        let i = start
        let j = start + count - 1
        while (i < j) {
            const tmp = arr[i]
            arr[i] = arr[j]
            arr[j] = tmp
            i++
            j--
        }
    }

    // Existem na classe completa; aqui ficam como “assinaturas” (igual ao VB chamar esses métodos)
    private ConvertToLinearTexture(raw: Uint8Array, width: number, height: number, fmt: ETextureFormat): Uint8Array {
        throw new Error('ConvertToLinearTexture não implementado aqui')
    }
    private GetSwapNumBytes(fmt: ETextureFormat): number {
        throw new Error('GetSwapNumBytes não implementado aqui')
    }
    private ReadDxtToBitmap(raw: Uint8Array): void {
        throw new Error('ReadDxtToBitmap não implementado aqui')
    }
    private ReadB8G8R8A8ToBitmap(raw: Uint8Array): void {
        throw new Error('ReadB8G8R8A8ToBitmap não implementado aqui')
    }
    private ReadB8G8R8ToBitmap(raw: Uint8Array): void {
        throw new Error('ReadB8G8R8ToBitmap não implementado aqui')
    }
}

// --------------------
// Infra “precisa” p/ reproduzir VB/System.Drawing
// --------------------

class VbConv {
    // VB/CInt (Double/Single -> Integer) = MidpointRounding.ToEven
    static toInt32(value: number): number {
        if (!Number.isFinite(value)) throw new Error('Invalid numeric conversion')
        const sign = value < 0 ? -1 : 1
        const a = Math.abs(value)

        const floor = Math.floor(a)
        const frac = a - floor

        let rounded: number
        if (frac < 0.5) rounded = floor
        else if (frac > 0.5) rounded = floor + 1
        else rounded = (floor % 2 === 0) ? floor : floor + 1

        const out = sign * rounded
        if (out < -2147483648 || out > 2147483647) throw new Error('Overflow')
        return out | 0
    }
}

class Color32 {
    constructor(
        public readonly a: number,
        public readonly r: number,
        public readonly g: number,
        public readonly b: number
    ) { }

    static fromArgb(a: number, r: number, g: number, b: number): Color32 {
        // System.Drawing.Color.FromArgb valida 0..255
        if ((a | 0) !== a || (r | 0) !== r || (g | 0) !== g || (b | 0) !== b)
            throw new Error('Color components must be Int32')

        if (a < 0 || a > 255 || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)
            throw new Error('ARGB out of range (0..255)')

        return new Color32(a, r, g, b)
    }
}

class Bitmap32 {
    readonly width: number
    readonly height: number
    readonly data: Uint8Array

    constructor(width: number, height: number) {
        this.width = width | 0
        this.height = height | 0
        if (this.width <= 0 || this.height <= 0) throw new Error('Invalid bitmap size')
        this.data = new Uint8Array(this.width * this.height * 4) // RGBA
    }

    setPixel(x: number, y: number, c: Color32): void {
        const idx = ((y * this.width) + x) * 4
        this.data[idx] = c.r & 0xff
        this.data[idx + 1] = c.g & 0xff
        this.data[idx + 2] = c.b & 0xff
        this.data[idx + 3] = c.a & 0xff
    }
}

class Bitmap24 {
    readonly width: number
    readonly height: number
    readonly data: Uint8Array

    constructor(width: number, height: number) {
        this.width = width | 0
        this.height = height | 0
        if (this.width <= 0 || this.height <= 0) throw new Error('Invalid bitmap size')
        this.data = new Uint8Array(this.width * this.height * 3) // RGB
    }

    setPixel(x: number, y: number, c: Color32): void {
        const idx = ((y * this.width) + x) * 3
        this.data[idx] = c.r & 0xff
        this.data[idx + 1] = c.g & 0xff
        this.data[idx + 2] = c.b & 0xff
    }
}