declare type IntPtr = any

declare enum PixelFormat {
    Format32bppArgb = 0,
    Format32bppPArgb = 1,
    Format24bppRgb = 2,
    Format8bppIndexed = 3
}

declare namespace Imaging {
    enum PixelFormat {
        Format32bppArgb = 0
    }
}

declare enum ImageLockMode {
    ReadOnly = 0,
    WriteOnly = 1,
    ReadWrite = 2
}

declare enum GraphicsUnit {
    Pixel = 0
}

declare enum InterpolationMode {
    Bilinear = 0,
    Bicubic = 1,
    HighQualityBicubic = 2
}

declare class Rectangle {
    constructor(x: number, y: number, width: number, height: number)
    X: number
    Y: number
    Width: number
    Height: number
    Left: number
    Top: number
}

declare class Size {
    constructor(width: number, height: number)
    Width: number
    Height: number
}

declare class BitmapData {
    Scan0: IntPtr
}

declare class Color {
    static FromArgb(a: number, r: number, g: number, b: number): Color
    static FromArgb(argb: number): Color
    static Transparent: Color
    A: number
    R: number
    G: number
    B: number
    ToArgb(): number
}

declare class Bitmap {
    constructor(width: number, height: number, pixelFormat?: PixelFormat)
    constructor(original: Bitmap, width: number, height: number)
    Width: number
    Height: number
    PixelFormat: PixelFormat
    Size: Size
    GetPixel(x: number, y: number): Color
    SetPixel(x: number, y: number, color: Color): void
    Clone(): Bitmap
    LockBits(rect: Rectangle, mode: ImageLockMode, pixelFormat: PixelFormat): BitmapData
    UnlockBits(data: BitmapData): void
    MakeTransparent(color: Color): void
}

declare class Graphics {
    static FromImage(image: Bitmap): Graphics
    InterpolationMode: InterpolationMode
    Clear(color: Color): void
    DrawImage(image: Bitmap, x: number, y: number, width?: number, height?: number): void
    DrawImage(image: Bitmap, destRect: Rectangle, srcX: number, srcY: number, srcW: number, srcH: number, unit: GraphicsUnit): void
    DrawImage(image: Bitmap, destRect: Rectangle, srcRect: Rectangle, unit: GraphicsUnit): void
    Dispose(): void
}

declare class PictureBox {
    Width: number
    Height: number
    Image: Bitmap | null
}

declare class Marshal {
    static Copy(src: any, dst: any, startIndex: number, length: number): void
    static Copy(src: any, startIndex: number, dst: any, length: number): void
}

declare class Buffer {
    static BlockCopy(src: any, srcOffset: number, dst: any, dstOffset: number, count: number): void
}

declare function MsgBox(message: any): void

declare enum ETextureFormat {
    BC1 = 0,
    BC2 = 1,
    BC3 = 2,
    BC4 = 3,
    BC5 = 4,
    BC6H_UF16 = 5,
    BC7 = 6,
    B8G8R8A8 = 7,
    R8G8B8A8 = 8,
    B8G8R8 = 9,
    L8 = 10,
    L8A8 = 11,
    B4G4R4A4 = 12,
    B5G6R5 = 13,
    B5G5R5A1 = 14,
    R32G32B32A32Float = 15
}

export class GraphicUtil {
    public static AddColorOffset(bitmap: Bitmap, deltaR: number, deltaG: number, deltaB: number): void {
        if (bitmap !== null && bitmap !== undefined) {
            for (let i = 0; i <= bitmap.Width - 1; i += 1) {
                for (let j = 0; j <= bitmap.Height - 1; j += 1) {
                    const pixel: Color = bitmap.GetPixel(i, j)
                    let red: number = (pixel.R + deltaR)
                    let green: number = (pixel.G + deltaG)
                    let blue: number = (pixel.B + deltaB)

                    if (red > 0xFF) red = 0xFF
                    if (green > 0xFF) green = 0xFF
                    if (blue > 0xFF) blue = 0xFF

                    if (red < 0) red = 0
                    if (green < 0) green = 0
                    if (blue < 0) blue = 0

                    bitmap.SetPixel(i, j, Color.FromArgb(pixel.A, red, green, blue))
                }
            }
        }
    }

    public static AddColorOffsetPreservingAlfa(sourceBitmap: Bitmap, dR: number, dG: number, dB: number, preserveAlfa: boolean): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if (sourceBitmap.PixelFormat !== PixelFormat.Format32bppArgb) {
            return null as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        const destination: Int32Array = new Int32Array(length)

        const bitmap: Bitmap = sourceBitmap.Clone() as any
        let rect: Rectangle = new Rectangle(0, 0, bitmap.Width, bitmap.Height)

        const bitmapdata: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const source: IntPtr = bitmapdata.Scan0

        Marshal.Copy(source, destination as any, 0, length)

        for (let i = 0; i <= length - 1; i += 1) {
            const color: Color = Color.FromArgb(destination[i] as any)

            let r: number = color.R
            let g: number = color.G
            let b: number = color.B
            const a: number = color.A

            r = (r + dR)
            g = (g + dG)
            b = (b + dB)

            if (r > 0xFF) r = 0xFF
            if (g > 0xFF) g = 0xFF
            if (b > 0xFF) b = 0xFF

            if (r < 0) r = 0
            if (g < 0) g = 0
            if (b < 0) b = 0

            if (preserveAlfa) {
                destination[i] = (Color.FromArgb(a, r, g, b).ToArgb as any)()
            } else {
                destination[i] = (Color.FromArgb(0xFF, r, g, b).ToArgb as any)()
            }
        }

        Marshal.Copy(destination as any, 0, source, length)
        bitmap.UnlockBits(bitmapdata)

        return bitmap
    }

    public static AddWrinklesBitmap(sourceBitmap: Bitmap, wrinkleBitmap: Bitmap): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if (wrinkleBitmap === null || wrinkleBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const destination: Int32Array = new Int32Array(length)
        const numArray2: Int32Array = new Int32Array(length)

        if (wrinkleBitmap === null || wrinkleBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        sourceBitmap.UnlockBits(bitmapdata)

        if ((wrinkleBitmap.Width !== sourceBitmap.Width) || (wrinkleBitmap.Height !== sourceBitmap.Height)) {
            wrinkleBitmap = GraphicUtil.ResizeBitmap(wrinkleBitmap, sourceBitmap.Width, sourceBitmap.Height, InterpolationMode.Bilinear)
        }

        Marshal.Copy((wrinkleBitmap.LockBits(rect, ImageLockMode.ReadWrite, wrinkleBitmap.PixelFormat) as any).Scan0, numArray2 as any, 0, length)
        wrinkleBitmap.UnlockBits(bitmapdata)

        for (let i = 0; i <= length - 1; i += 1) {
            const color: Color = Color.FromArgb(destination[i] as any)
            const num3: number = (numArray2[i] & 0xFF)
            const num4: number = ((numArray2[i] & 0xFF000000) >> 0x18)
            const num5: number = Math.floor((color.R * num3) / 0xFF)
            const num6: number = Math.floor((color.G * num3) / 0xFF)
            const num7: number = Math.floor((color.B * num3) / 0xFF)
            const num8: number = Math.floor((color.A * num4) / 0xFF)

            destination[i] = ((((((num8 << 8) | num5) << 8) | num6) << 8) | num7) | 0
        }

        const bitmap: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        rect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const ptr: IntPtr = data2.Scan0

        Marshal.Copy(destination as any, 0, ptr, length)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static CanvasSizeBitmap(sourceBitmap: Bitmap, width: number, height: number): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }

        const image: Bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb)
        const graphics1: Graphics = Graphics.FromImage(image)

        graphics1.DrawImage(
            sourceBitmap,
            new Rectangle(0, 0, width, height),
            0, 0, width, height,
            GraphicsUnit.Pixel
        )

        graphics1.Dispose()

        return image
    }

    public static CanvasSizeBitmapCentered(sourceBitmap: Bitmap, width: number, height: number): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if ((width > sourceBitmap.Width) || (height > sourceBitmap.Height)) {
            return null as any
        }

        const num: number = Math.floor((sourceBitmap.Width - width) / 2)
        const bitmap: Bitmap = new Bitmap(width, height, sourceBitmap.PixelFormat)

        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadOnly, sourceBitmap.PixelFormat)

        rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height)
        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.ReadWrite, bitmap.PixelFormat)

        const source: IntPtr = data2.Scan0

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        const num3: number = (bitmap.Width * bitmap.Height)

        const destination: Int32Array = new Int32Array(length)
        const numArray2: Int32Array = new Int32Array(num3)

        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        Marshal.Copy(source, numArray2 as any, 0, num3)

        let index: number = 0
        let num5: number = (Math.floor((sourceBitmap.Height - height) / 2) * sourceBitmap.Width) + num

        for (let i = 0; i <= bitmap.Height - 1; i += 1) {
            for (let j = 0; j <= bitmap.Width - 1; j += 1) {
                numArray2[index] = destination[num5]
                index += 1
                num5 += 1
            }
            num5 = (num5 + (num * 2))
        }

        Marshal.Copy(numArray2 as any, 0, source, num3)

        sourceBitmap.UnlockBits(bitmapdata)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static ColorizeRGBKit(sourceBitmap: Bitmap, color1: Color, color2: Color, color3: Color, preserveArmBand: boolean): boolean {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return false
        }

        const colorArray: Color[][] = Array.from({ length: (0x30) }, () => new Array<Color>(0x100))
        preserveArmBand = ((preserveArmBand && (sourceBitmap.Width === 0x400)) && (sourceBitmap.Height === 0x400))

        if (preserveArmBand) {
            let num: number = 0
            let num2: number = 0

            for (let i = 0x3CF; i <= 0x3FE; i += 1) {
                num2 = 0
                for (let j = 0x180; j <= 0x27F; j += 1) {
                    colorArray[num][num2] = sourceBitmap.GetPixel(j, i)
                    num2 += 1
                }
                num += 1
            }
        }

        const flag: boolean = GraphicUtil.ColorizeRGB(sourceBitmap, color1, color2, color3, 0, sourceBitmap.Height) as any

        if (flag && preserveArmBand) {
            let num5: number = 0
            let num6: number = 0

            for (let i = 0x3CF; i <= 0x3FE; i += 1) {
                num6 = 0
                for (let j = 0x180; j <= 0x27F; j += 1) {
                    sourceBitmap.SetPixel(j, i, colorArray[num5][num6])
                    num6 += 1
                }
                num5 += 1
            }
        }

        return flag
    }

    public static ColorizeRGB(SourceBitmap: any, color1: Color, color2: Color, color3: Color, CoeffBitmap?: Bitmap, ChannelIdCoeffForTransparancy?: number): boolean
    public static ColorizeRGB(SourceBitmap: any, color1: Color, color2: Color, color3: Color, firstRow: number, lastRow: number, CoeffBitmap?: Bitmap, ChannelIdCoeffForTransparancy?: number): boolean
    public static ColorizeRGB(...args: any[]): boolean {
        // VB overloads:
        // 1) ColorizeRGB(ByRef SourceBitmap As Bitmap, color1, color2, color3, Optional CoeffBitmap, Optional ChannelIdCoeffForTransparancy)
        // 2) Private Shared Function ColorizeRGB(SourceBitmap As Bitmap, color1, color2, color3, firstRow, lastRow, Optional CoeffBitmap, Optional ChannelIdCoeffForTransparancy)

        let SourceBitmap: any = args[0]
        const color1: any = args[1]
        const color2: any = args[2]
        const color3: any = args[3]

        const hasRowRange: boolean = (typeof args[4] === 'number' && typeof args[5] === 'number')
        const firstRow: number = hasRowRange ? args[4] : 0
        const lastRow: number = hasRowRange ? args[5] : ((SourceBitmap as any)?.Height ?? 0)

        const CoeffBitmap: any = hasRowRange ? (args[6] ?? null) : (args[4] ?? null)
        const ChannelIdCoeffForTransparancy: number = hasRowRange ? (args[7] ?? 1) : (args[5] ?? 1)

        // Handle ByRef-like callers (optional): allow SourceBitmap.value to be updated
        const isRefWrapper: boolean = (SourceBitmap !== null && SourceBitmap !== undefined && typeof SourceBitmap === 'object' && ('value' in SourceBitmap))
        let bmp: any = isRefWrapper ? SourceBitmap.value : SourceBitmap

        if (!hasRowRange) {
            if (bmp.PixelFormat !== PixelFormat.Format32bppArgb) { // --> should always be with alpha
                bmp = GraphicUtil.Get32bitBitmap(bmp)
                if (isRefWrapper) SourceBitmap.value = bmp
            }
            return GraphicUtil.ColorizeRGB(bmp, color1, color2, color3, 0, bmp.Height, CoeffBitmap, ChannelIdCoeffForTransparancy)
        }

        // Internal (row-range) version
        if (bmp === null || bmp === undefined) {
            return false
        }
        if (bmp.PixelFormat !== PixelFormat.Format32bppArgb) { // --> should always be with alpha
            return false
        }

        const UseCoeff: boolean = (CoeffBitmap !== null && CoeffBitmap !== undefined) && (bmp.Size === CoeffBitmap.Size)

        const rect: Rectangle = new Rectangle(0, 0, bmp.Width, bmp.Height)
        const bitmapdata: BitmapData = bmp.LockBits(rect, ImageLockMode.ReadWrite, bmp.PixelFormat)
        const source: IntPtr = bitmapdata.Scan0

        const num: number = (bmp.Width * bmp.Height)
        const destination: Uint8Array = new Uint8Array((num * 4))

        Marshal.Copy(source, destination as any, 0, (num * 4))

        let id: number = firstRow * bmp.Width
        for (let j = firstRow; j <= lastRow - 1; j += 1) {
            for (let i = 0; i <= bmp.Width - 1; i += 1) {
                // BGRA
                const s_B: number = destination[(id * 4)]
                const s_G: number = destination[(id * 4) + 1]
                const s_R: number = destination[(id * 4) + 2]

                destination[(id * 4)] = Math.min(Math.max(Math.floor((((color1.B * s_R) + (color2.B * s_G) + (color3.B * s_B)) / 255)), 0), 255) // B
                destination[(id * 4) + 1] = Math.min(Math.max(Math.floor((((color1.G * s_R) + (color2.G * s_G) + (color3.G * s_B)) / 255)), 0), 255) // G
                destination[(id * 4) + 2] = Math.min(Math.max(Math.floor((((color1.R * s_R) + (color2.R * s_G) + (color3.R * s_B)) / 255)), 0), 255) // R

                if (UseCoeff) {
                    const CoeffColor: Color = CoeffBitmap.GetPixel(i, j)
                    let color_transparancy: number

                    switch (ChannelIdCoeffForTransparancy) {
                        case 0:
                            color_transparancy = CoeffColor.B
                            break
                        case 2:
                            color_transparancy = CoeffColor.R
                            break
                        case 3:
                            color_transparancy = CoeffColor.A
                            break
                        default:
                            color_transparancy = CoeffColor.G
                            break
                    }

                    destination[(id * 4) + 3] = 255 - color_transparancy // A
                }

                id += 1
            }
        }

        Marshal.Copy(destination as any, 0, source, (num * 4))
        bmp.UnlockBits(bitmapdata)

        return true
    }

    public static ColorizeWhite(srcBitmap: Bitmap, color: Color): Bitmap {
        if (srcBitmap === null || srcBitmap === undefined) {
            return null as any
        }

        const r: number = color.R
        const g: number = color.G
        const b: number = color.B

        for (let i = 0; i <= srcBitmap.Width - 1; i += 1) {
            for (let j = 0; j <= srcBitmap.Height - 1; j += 1) {
                const pixel: Color = srcBitmap.GetPixel(i, j)
                if (pixel !== Color.FromArgb(0, 0, 0, 0)) {
                    srcBitmap.SetPixel(i, j, Color.FromArgb(pixel.A, r, g, b))
                }
            }
        }

        return srcBitmap
    }

    public static ColorTuning(variableBitmap: Bitmap, referenceBitmap: Bitmap, rect: Rectangle): Bitmap {
        const dominantColor: Color = GraphicUtil.GetDominantColor(variableBitmap, rect)
        const color2: Color = GraphicUtil.GetDominantColor(referenceBitmap, rect)

        const deltaR: number = (color2.R - dominantColor.R)
        const deltaG: number = (color2.G - dominantColor.G)
        const deltaB: number = (color2.B - dominantColor.B)

        const bitmap: Bitmap = variableBitmap.Clone() as any
        GraphicUtil.AddColorOffset(bitmap, deltaR, deltaG, deltaB)

        return bitmap
    }

    public static ColorTuning2(variableBitmap: Bitmap, variableRect: Rectangle, referenceBitmap: Bitmap, referenceRect: Rectangle): Bitmap {
        const dominantColor: Color = GraphicUtil.GetDominantColor(variableBitmap, variableRect)
        const color2: Color = GraphicUtil.GetDominantColor(referenceBitmap, referenceRect)

        const deltaR: number = (color2.R - dominantColor.R)
        const deltaG: number = (color2.G - dominantColor.G)
        const deltaB: number = (color2.B - dominantColor.B)

        const bitmap: Bitmap = variableBitmap.Clone() as any
        GraphicUtil.AddColorOffset(bitmap, deltaR, deltaG, deltaB)

        return bitmap
    }

    public static CreateReferenceBitmap(sourceBitmap: Bitmap, c1: Color, c2: Color, c3: Color): Bitmap {
        let r: number
        let g: number
        let b: number
        let num5: number

        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const destination: Int32Array = new Int32Array(length)
        const hist: Int32Array = new Int32Array(3)

        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        sourceBitmap.UnlockBits(bitmapdata)

        const refColors: Color[] = [c1, c2, c3]
        const rgb: Int32Array = new Int32Array(3)

        for (let i = 0; i <= length - 1; i += 1) {
            const tC: Color = Color.FromArgb(destination[i] as any)

            num5 = 0
            r = 0
            g = 0
            b = 0

            if (tC === c1) {
                r = 0xE2
                g = 0
                b = 0
                num5 = 0xFF
            } else if (tC === c2) {
                r = 0
                g = 0xE2
                b = 0
                num5 = 0xFF
            } else if (tC === c3) {
                r = 0
                g = 0
                b = 0xE2
                num5 = 0xFF
            } else if (GraphicUtil.UseColorCombination(refColors, tC, rgb, true, hist)) {
                r = rgb[0]
                g = rgb[1]
                b = rgb[2]
                num5 = 0xFF
            }

            if (num5 === 0xFF) {
                destination[i] = ((((((num5 << 8) | r) << 8) | g) << 8) | b) | 0
            } else {
                r = tC.R
                g = tC.G
                b = tC.B
                num5 = 0
                destination[i] = ((((((num5 << 8) | r) << 8) | g) << 8) | b) | 0
            }
        }

        for (let j = 0; j <= length - 1; j += 1) {
            const tC: Color = Color.FromArgb(destination[j] as any)
            if (tC.A === 0) {
                const num8: number = Math.floor(j / sourceBitmap.Width)
                const num9: number = (j - (num8 * sourceBitmap.Width))

                hist[2] = 0
                let num10: number = 0
                hist[0] = num10
                hist[1] = num10

                for (let k = -2; k <= 2; k += 1) {
                    for (let m = -2; m <= 2; m += 1) {
                        const num13: number = (num8 + k)
                        const num14: number = (num9 + m)

                        if (((num13 >= 0) && (num13 < sourceBitmap.Height)) && ((num14 >= 0) && (num14 < sourceBitmap.Width))) {
                            const color3: Color = Color.FromArgb(destination[(num13 * sourceBitmap.Width) + num14] as any)
                            if (color3.A !== 0) {
                                if (color3.R !== 0) {
                                    hist[0] += 1
                                } else if (color3.G !== 0) {
                                    hist[1] += 1
                                } else if (color3.B !== 0) {
                                    hist[2] += 1
                                }
                            }
                        }
                    }
                }

                GraphicUtil.UseColorCombination(refColors, tC, rgb, false, hist)

                r = rgb[0]
                g = rgb[1]
                b = rgb[2]
                num5 = 0xFF
                destination[j] = ((((((num5 << 8) | r) << 8) | g) << 8) | b) | 0
            }
        }

        const bitmap: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        rect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const ptr: IntPtr = data2.Scan0

        Marshal.Copy(destination as any, 0, ptr, length)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static CreateReferenceBitmap2(sourceBitmap: Bitmap, c1: Color, c2: Color, c3: Color, preserveArmBand: boolean): Bitmap {
        const colorArray: Color[][] = Array.from({ length: 48 }, () => new Array<Color>(256))

        preserveArmBand = ((preserveArmBand && (sourceBitmap.Width === 1024)) && (sourceBitmap.Height === 1024))

        if (preserveArmBand) {
            let num: number = 0
            let num2: number = 0

            for (let y = 975; y <= 1022; y += 1) {
                num2 = 0
                for (let x = 384; ; x += 1) {
                    if (x > 639) {
                        num += 1
                        break
                    }
                    colorArray[num][num2] = sourceBitmap.GetPixel(x, y)
                    num2 += 1
                }
            }
        }

        const bitmap: Bitmap = GraphicUtil.CreateReferenceBitmap(sourceBitmap, c1, c2, c3)

        if (bitmap !== null && bitmap !== undefined && preserveArmBand) {
            let num5: number = 0
            let num6: number = 0

            for (let y = 975; y <= 1022; y += 1) {
                num6 = 0
                for (let x = 384; ; x += 1) {
                    if (x > 639) {
                        num5 += 1
                        break
                    }
                    bitmap.SetPixel(x, y, colorArray[num5][num6])
                    num6 += 1
                }
            }
        }

        return bitmap
    }

    public static DrawOver(belowBitmap: Bitmap, overBitmap: Bitmap, PreserveAlpha: boolean): Bitmap {
        let OriginalBitmap: Bitmap = null as any

        if (PreserveAlpha) {
            OriginalBitmap = (belowBitmap.Clone() as any)
        }

        this.RemoveAlfaChannel(belowBitmap)

        const graphics1: Graphics = Graphics.FromImage(belowBitmap)
        graphics1.DrawImage(overBitmap, 0, 0, overBitmap.Width, overBitmap.Height)
        graphics1.Dispose()

        if (PreserveAlpha) {
            GraphicUtil.FixAlphaChannel(belowBitmap, OriginalBitmap)
        }

        return belowBitmap
    }

    public static FixAlphaChannel(sourceBitmap: Bitmap, AlphaBitmap: Bitmap): boolean {
        const bitmap1: Bitmap = sourceBitmap.Clone() as any

        if ((sourceBitmap === null || sourceBitmap === undefined) || (sourceBitmap.PixelFormat !== PixelFormat.Format32bppArgb)) {
            return false
        }

        const rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)

        const source: IntPtr = bitmapdata.Scan0
        const num: number = (sourceBitmap.Width * sourceBitmap.Height)

        const destination: Uint8Array = new Uint8Array((num * 4))
        Marshal.Copy(source, destination as any, 0, (num * 4))

        let id: number = 0
        for (let j = 0; j <= sourceBitmap.Height - 1; j += 1) {
            for (let i = 0; i <= sourceBitmap.Width - 1; i += 1) {
                const MyColor: Color = AlphaBitmap.GetPixel(i, j)
                const Alpha: number = MyColor.A

                destination[(id * 4) + 3] = Alpha
                id += 1
            }
        }

        Marshal.Copy(destination as any, 0, source, (num * 4))
        sourceBitmap.UnlockBits(bitmapdata)

        return true
    }

    public static EmbossBitmap(sourceBitmap: Bitmap, embossingBitmap: Bitmap): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if (embossingBitmap === null || embossingBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const destination: Int32Array = new Int32Array(length)
        const numArray2: Int32Array = new Int32Array(length)

        if (embossingBitmap === null || embossingBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        sourceBitmap.UnlockBits(bitmapdata)

        if ((embossingBitmap.Width !== sourceBitmap.Width) || (embossingBitmap.Height !== sourceBitmap.Height)) {
            embossingBitmap = GraphicUtil.ResizeBitmap(embossingBitmap, sourceBitmap.Width, sourceBitmap.Height, InterpolationMode.Bilinear)
        }

        Marshal.Copy((embossingBitmap.LockBits(rect, ImageLockMode.ReadWrite, embossingBitmap.PixelFormat) as any).Scan0, numArray2 as any, 0, length)
        embossingBitmap.UnlockBits(bitmapdata)

        for (let i = 0; i <= length - 1; i += 1) {
            const color: Color = Color.FromArgb(destination[i] as any)
            const num3: number = Math.floor((0x7F - ((numArray2[i] & 0xFF00) >> 8)) / 2)

            let num4: number = (color.R + num3)
            if (num4 > 0xFF) num4 = 0xFF
            if (num4 < 0) num4 = 0

            let num5: number = (color.G + num3)
            if (num5 > 0xFF) num5 = 0xFF
            if (num5 < 0) num5 = 0

            let num6: number = (color.B + num3)
            if (num6 > 0xFF) num6 = 0xFF
            if (num6 < 0) num6 = 0

            const a: number = color.A
            destination[i] = ((((((a << 8) | num4) << 8) | num5) << 8) | num6) | 0
        }

        const bitmap: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        rect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const ptr: IntPtr = data2.Scan0

        Marshal.Copy(destination as any, 0, ptr, length)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static Get32bitBitmap(sourceBitmap: Bitmap): Bitmap {
        const image: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        const graphics1: Graphics = Graphics.FromImage(image)
        graphics1.DrawImage(sourceBitmap, 0, 0, sourceBitmap.Width, sourceBitmap.Height)
        graphics1.Dispose()
        return image
    }

    public static Get32bitPBitmap(sourceBitmap: Bitmap): Bitmap {
        const image: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppPArgb)
        const graphics1: Graphics = Graphics.FromImage(image)
        graphics1.DrawImage(sourceBitmap, 0, 0, sourceBitmap.Width, sourceBitmap.Height)
        graphics1.Dispose()
        return image
    }

    public static Get24bitBitmap(sourceBitmap: Bitmap): Bitmap {
        this.RemoveAlfaChannel(sourceBitmap)

        if (sourceBitmap.PixelFormat !== PixelFormat.Format24bppRgb) {
            const image: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format24bppRgb)
            const graphics1: Graphics = Graphics.FromImage(image)
            graphics1.DrawImage(sourceBitmap, 0, 0, sourceBitmap.Width, sourceBitmap.Height)
            graphics1.Dispose()
            return image
        } else {
            return sourceBitmap
        }
    }

    public static GetAlfaFromChannel(sourceBitmap: Bitmap, alfaBitmap: Bitmap, channel: number): boolean {
        if ((sourceBitmap.Width !== alfaBitmap.Width) || (sourceBitmap.Height !== alfaBitmap.Height)) {
            return false
        }

        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)

        rect = new Rectangle(0, 0, alfaBitmap.Width, alfaBitmap.Height)
        const data2: BitmapData = alfaBitmap.LockBits(rect, ImageLockMode.ReadOnly, alfaBitmap.PixelFormat)

        const source: IntPtr = bitmapdata.Scan0
        const num: number = (sourceBitmap.Width * sourceBitmap.Height)

        const destination: Uint8Array = new Uint8Array((num * 4))
        const buffer2: Uint8Array = new Uint8Array((num * 4))

        Marshal.Copy(source, destination as any, 0, (num * 4))
        Marshal.Copy(data2.Scan0, buffer2 as any, 0, (num * 4))

        for (let i = 3; i < (num * 4); i += 4) {
            destination[i] = buffer2[(i - channel)]
        }

        Marshal.Copy(destination as any, 0, source, (num * 4))

        sourceBitmap.UnlockBits(bitmapdata)
        alfaBitmap.UnlockBits(data2)

        return true
    }

    public static GetDominantColor(bitmap: Bitmap, rectangle: Rectangle): Color {
        const numArray: Int32Array = new Int32Array(0x100)

        for (let i = rectangle.X; i <= (rectangle.X + rectangle.Width) - 1; i += 1) {
            for (let m = rectangle.Y; m <= (rectangle.Y + rectangle.Height) - 1; m += 1) {
                const pixel: Color = bitmap.GetPixel(i, m)
                numArray[pixel.R] += 1
            }
        }

        let num: number = -1
        let red: number = 0
        let green: number = 0
        let blue: number = 0

        for (let j = 0; j <= 0x100 - 1; j += 1) {
            if (numArray[j] > num) {
                num = numArray[j]
                red = j
            }
        }

        let num5: number = 0
        let num6: number = 0

        for (let k = rectangle.X; k <= (rectangle.X + rectangle.Width) - 1; k += 1) {
            for (let m = rectangle.Y; m <= (rectangle.Y + rectangle.Height) - 1; m += 1) {
                const pixel: Color = bitmap.GetPixel(k, m)
                if (pixel.R === red) {
                    num5 = (num5 + pixel.G)
                    num6 = (num6 + pixel.B)
                }
            }
        }

        green = Math.floor(num5 / num)
        blue = Math.floor(num6 / num)

        return Color.FromArgb(0xFF, red, green, blue)
    }

    public static LoadPictureImage(picture: PictureBox, bitmap: Bitmap): void {
        if (bitmap === null || bitmap === undefined) {
            picture.Image = bitmap
        } else if ((picture.Width === bitmap.Width) && (picture.Height === bitmap.Height)) {
            picture.Image = bitmap
        } else {
            picture.Image = GraphicUtil.RemapBitmap(bitmap, picture.Width, picture.Height)
        }
    }

    public static MakeAutoTransparent(bitmap: Bitmap): Bitmap {
        const pixel: Color = bitmap.GetPixel(0, 0)
        bitmap.MakeTransparent(pixel)
        return bitmap
    }

    public static MultiplyBitmap(sourceBitmap: Bitmap, multBitmap: Bitmap): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if (multBitmap === null || multBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const destination: Int32Array = new Int32Array(length)
        const numArray2: Int32Array = new Int32Array(length)

        if (multBitmap === null || multBitmap === undefined) {
            return sourceBitmap.Clone() as any
        }

        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        sourceBitmap.UnlockBits(bitmapdata)

        if ((multBitmap.Width !== sourceBitmap.Width) || (multBitmap.Height !== sourceBitmap.Height)) {
            multBitmap = GraphicUtil.ResizeBitmap(multBitmap, sourceBitmap.Width, sourceBitmap.Height, InterpolationMode.Bilinear)
        }

        Marshal.Copy((multBitmap.LockBits(rect, ImageLockMode.ReadWrite, multBitmap.PixelFormat) as any).Scan0, numArray2 as any, 0, length)
        multBitmap.UnlockBits(bitmapdata)

        for (let i = 0; i <= length - 1; i += 1) {
            const color: Color = Color.FromArgb(destination[i] as any)

            const num3: number = (numArray2[i] & 0xFF)
            const num4: number = ((numArray2[i] & 0xFF000000) >> 0x18)

            const num5: number = Math.floor((color.R * num3) / 0xFF)
            const num6: number = Math.floor((color.G * num3) / 0xFF)
            const num7: number = Math.floor((color.B * num3) / 0xFF)
            const num8: number = Math.floor((color.A * num4) / 0xFF)

            destination[i] = ((((((num8 << 8) | num5) << 8) | num6) << 8) | num7) | 0
        }

        const bitmap: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        rect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const ptr: IntPtr = data2.Scan0

        Marshal.Copy(destination as any, 0, ptr, length)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static MultiplyColorToBitmap(sourceBitmap: Bitmap, color: Color, divisor: number, preserveAlfa: boolean): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const destination: Int32Array = new Int32Array(length)

        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        sourceBitmap.UnlockBits(bitmapdata)

        for (let i = 0; i <= length - 1; i += 1) {
            const color2: Color = Color.FromArgb(destination[i] as any)
            let a: number = color2.A

            let num4: number = Math.floor((color.R * color2.R) / divisor)
            let num5: number = Math.floor((color.G * color2.G) / divisor)
            let num6: number = Math.floor((color.B * color2.B) / divisor)

            if (num4 > 0xFF) num4 = 0xFF
            if (num5 > 0xFF) num5 = 0xFF
            if (num6 > 0xFF) num6 = 0xFF

            if (!preserveAlfa) {
                a = 0xFF
            }

            destination[i] = ((((((a << 8) | num4) << 8) | num5) << 8) | num6) | 0
        }

        const bitmap: Bitmap = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb)
        rect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)

        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.WriteOnly, bitmap.PixelFormat)
        const ptr: IntPtr = data2.Scan0

        Marshal.Copy(destination as any, 0, ptr, length)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    public static Overlap(lowerBitmap: Bitmap, upperBitmap: Bitmap, destRectangle: Rectangle): Bitmap {
        if ((lowerBitmap === null || lowerBitmap === undefined) && (upperBitmap === null || upperBitmap === undefined)) {
            return null as any
        }
        if (lowerBitmap === null || lowerBitmap === undefined) {
            return upperBitmap.Clone() as any
        }
        if (upperBitmap === null || upperBitmap === undefined) {
            return lowerBitmap.Clone() as any
        }

        const image: Bitmap = GraphicUtil.ResizeBitmap(upperBitmap, destRectangle.Width, destRectangle.Height, InterpolationMode.Bicubic)

        if (image !== null && image !== undefined) {
            const bitmap1: Bitmap = lowerBitmap.Clone() as any
            const graphics1: Graphics = Graphics.FromImage(bitmap1)
            graphics1.DrawImage(image, destRectangle.Left, destRectangle.Top)
            graphics1.Dispose()
            return bitmap1
        }

        return lowerBitmap
    }

    public static PrepareToColorize(sourceBitmap: Bitmap, firstRow: number, lastRow: number): boolean {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return false
        }

        const rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)

        const source: IntPtr = bitmapdata.Scan0
        const num: number = (sourceBitmap.Width * sourceBitmap.Height)

        const destination: Uint8Array = new Uint8Array((num * 4))
        Marshal.Copy(source, destination as any, 0, (num * 4))

        for (let i = (firstRow * sourceBitmap.Width); i <= (lastRow * sourceBitmap.Width) - 1; i += 1) {
            let num4: number = destination[(i * 4)]
            let num3: number = destination[(i * 4) + 1]
            let num2: number = destination[(i * 4) + 2]

            while (((num2 + num3) + num4) > 0xE2) {
                if (num2 > 0) num2 -= 1
                if (num3 > 0) num3 -= 1
                if (num4 > 0) num4 -= 1
            }

            destination[(i * 4)] = num4
            destination[(i * 4) + 1] = num3
            destination[(i * 4) + 2] = num2
        }

        Marshal.Copy(destination as any, 0, source, (num * 4))
        sourceBitmap.UnlockBits(bitmapdata)

        return true
    }

    public static ReduceBitmap(srcBitmap: Bitmap): Bitmap {
        let width: number = srcBitmap.Width
        let height: number = srcBitmap.Height

        if ((width * height) === 0) {
            return null as any
        }

        width = Math.floor(width / 2)
        height = Math.floor(height / 2)

        if (width === 0) {
            width = 1
        }
        if (height === 0) {
            height = 1
        }

        return GraphicUtil.ResizeBitmap(srcBitmap, width, height, InterpolationMode.HighQualityBicubic)
    }

    public static RemapBitmap(srcBitmap: Bitmap, destWidth: number, destHeight: number): Bitmap {
        const bitmap: Bitmap = new Bitmap(destWidth, destHeight, PixelFormat.Format32bppArgb)

        const height: number = srcBitmap.Height

        // VB uses "\" (integer division) even though variables are Single
        const num2: number = Math.floor(Number(srcBitmap.Width) / Number(destWidth))
        const num3: number = Math.floor(Number(height) / Number(destHeight))

        for (let i = 0; i <= destWidth - 1; i += 1) {
            for (let j = 0; j <= destHeight - 1; j += 1) {
                bitmap.SetPixel(i, j, GraphicUtil.RemapPixel(srcBitmap, (i * num2), (j * num3)))
            }
        }

        return bitmap
    }

    private static RemapPixel(srcBitmap: Bitmap, x: number, y: number): Color {
        const num: number = Math.floor(x)
        const num2: number = Math.floor(y)

        const num3: number = (num < srcBitmap.Width) ? num : (srcBitmap.Width - 1)
        const num4: number = ((num + 1) < srcBitmap.Width) ? (num + 1) : (srcBitmap.Width - 1)
        const num5: number = (num2 < srcBitmap.Height) ? num2 : (srcBitmap.Height - 1)
        const num6: number = ((num2 + 1) < srcBitmap.Height) ? (num2 + 1) : (srcBitmap.Height - 1)

        const pixel: Color = srcBitmap.GetPixel(num3, num5)
        const color2: Color = srcBitmap.GetPixel(num4, num5)
        const color3: Color = srcBitmap.GetPixel(num3, num6)
        const color4: Color = srcBitmap.GetPixel(num4, num6)

        const num7: number = (x - num)
        const num8: number = (y - num2)

        const num9: number = ((1.0 - num7) * (1.0 - num8))
        const num10: number = (num7 * (1.0 - num8))
        const num11: number = ((1.0 - num7) * num8)
        const num12: number = (num7 * num8)

        const red: number = Math.floor((((pixel.R * num9) + (color2.R * num10) + (color3.R * num11) + (color4.R * num12))))
        const green: number = Math.floor((((pixel.G * num9) + (color2.G * num10) + (color3.G * num11) + (color4.G * num12))))
        const blue: number = Math.floor((((pixel.B * num9) + (color2.B * num10) + (color3.B * num11) + (color4.B * num12))))

        const a: number = Math.floor((((pixel.A * num9) + (color2.A * num10) + (color3.A * num11) + (color4.A * num12))))

        return Color.FromArgb(a, red, green, blue)
    }

    public static RemapRectangle(srcBitmap: Bitmap, srcRect: Rectangle, destBitmap: Bitmap, destRect: Rectangle): void {
        const graphics1: Graphics = Graphics.FromImage(destBitmap)
        graphics1.InterpolationMode = InterpolationMode.HighQualityBicubic
        graphics1.DrawImage(srcBitmap, destRect, srcRect, GraphicsUnit.Pixel)
        graphics1.Dispose()
    }

    public static RemoveChannel(sourceBitmap: Bitmap, RemoveChannelId: number): boolean { // -- BGRA
        return GraphicUtil.SetChannel(sourceBitmap, RemoveChannelId, 0)
    }

    public static SetAlfaChannel(sourceBitmap: Bitmap, AlphaValue: number): boolean {
        return GraphicUtil.SetChannel(sourceBitmap, 3, AlphaValue)
    }

    public static SetChannel(sourceBitmap: Bitmap, ChannelId: number, Value: number): boolean { // -- BGRA
        if (sourceBitmap.PixelFormat !== Imaging.PixelFormat.Format32bppArgb) {
            sourceBitmap = GraphicUtil.Get32bitBitmap(sourceBitmap)
        }

        return GraphicUtil.SetChannel_int(sourceBitmap, ChannelId, Value)
    }

    private static SetChannel_int(sourceBitmap: Bitmap, ChannelId: number, Value: number): boolean { // -- BGRA
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return false
        }

        const pf = sourceBitmap.PixelFormat
        const NumBits: number = (pf === PixelFormat.Format24bppRgb) ? 3 : 4

        if (pf !== PixelFormat.Format32bppArgb) {
            return false
        }

        const rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadWrite, sourceBitmap.PixelFormat)
        const source: IntPtr = bitmapdata.Scan0
        const num: number = (sourceBitmap.Width * sourceBitmap.Height)

        const destination: Uint8Array = new Uint8Array((num * NumBits))
        Marshal.Copy(source, destination as any, 0, (num * NumBits))

        let i: number = 0
        while (i < (num * NumBits)) {
            destination[i + ChannelId] = Value
            i += NumBits
        }

        Marshal.Copy(destination as any, 0, source, (num * NumBits))
        sourceBitmap.UnlockBits(bitmapdata)
        return true
    }

    public static RemoveAlfaChannel(sourceBitmap: any): boolean {
        const isRefWrapper: boolean = (sourceBitmap !== null && sourceBitmap !== undefined && typeof sourceBitmap === 'object' && ('value' in sourceBitmap))
        let bmp: any = isRefWrapper ? sourceBitmap.value : sourceBitmap

        if (bmp === null || bmp === undefined) {
            return false
        }

        if (bmp.PixelFormat !== PixelFormat.Format32bppArgb) {
            if (bmp.PixelFormat === PixelFormat.Format24bppRgb) {
                return true
            } else {
                return false
            }
        }

        let rect: Rectangle = new Rectangle(0, 0, bmp.Width, bmp.Height)
        let bitmapdataSource: BitmapData = bmp.LockBits(rect, ImageLockMode.ReadWrite, bmp.PixelFormat)
        let source: IntPtr = bitmapdataSource.Scan0
        const num: number = (bmp.Width * bmp.Height)

        const SourceBytes: Uint8Array = new Uint8Array((num * 4))
        const DestBytes: Uint8Array = new Uint8Array((num * 3))

        Marshal.Copy(source, SourceBytes as any, 0, (num * 4))

        let i_s: number = 3
        let j_d: number = 2

        while (i_s < (num * 4)) {
            // BGRA
            DestBytes[j_d - 2] = SourceBytes[i_s - 3]
            DestBytes[j_d - 1] = SourceBytes[i_s - 2]
            DestBytes[j_d] = SourceBytes[i_s - 1]
            i_s += 4
            j_d += 3
        }

        bmp.UnlockBits(bitmapdataSource)

        bmp = new Bitmap(bmp.Width, bmp.Height, PixelFormat.Format24bppRgb) // 'Get24bitBitmap(sourceBitmap)
        rect = new Rectangle(0, 0, bmp.Width, bmp.Height)
        bitmapdataSource = bmp.LockBits(rect, ImageLockMode.ReadWrite, bmp.PixelFormat)
        source = bitmapdataSource.Scan0

        Marshal.Copy(DestBytes as any, 0, source, (num * 3))
        bmp.UnlockBits(bitmapdataSource)

        if (isRefWrapper) {
            sourceBitmap.value = bmp
        }

        return true
    }

    // Separates the specified channels from the image and returns it as grayscale images.
    public static Separate(sourceBitmap: Bitmap): Bitmap[] {
        let Count: number = 0

        const BytesAlpha: Uint8Array = new Uint8Array((sourceBitmap.Height * sourceBitmap.Width))
        const BytesRed: Uint8Array = new Uint8Array((sourceBitmap.Height * sourceBitmap.Width))
        const BytesGreen: Uint8Array = new Uint8Array((sourceBitmap.Height * sourceBitmap.Width))
        const BytesBlue: Uint8Array = new Uint8Array((sourceBitmap.Height * sourceBitmap.Width))

        for (let i = 0; i <= sourceBitmap.Height - 1; i += 1) {
            for (let j = 0; j <= sourceBitmap.Width - 1; j += 1) {
                BytesBlue[Count] = sourceBitmap.GetPixel(j, i).B
                BytesGreen[Count] = sourceBitmap.GetPixel(j, i).G
                BytesRed[Count] = sourceBitmap.GetPixel(j, i).R
                BytesAlpha[Count] = sourceBitmap.GetPixel(j, i).A
                Count += 1
            }
        }

        const ReturnBitmap: Bitmap[] = new Array<Bitmap>(4)
        ReturnBitmap[0] = GraphicUtil.ReadGreyToBitmap(BytesBlue as any, sourceBitmap.Width, sourceBitmap.Height)
        ReturnBitmap[1] = GraphicUtil.ReadGreyToBitmap(BytesGreen as any, sourceBitmap.Width, sourceBitmap.Height)
        ReturnBitmap[2] = GraphicUtil.ReadGreyToBitmap(BytesRed as any, sourceBitmap.Width, sourceBitmap.Height)
        ReturnBitmap[3] = GraphicUtil.ReadGreyToBitmap(BytesAlpha as any, sourceBitmap.Width, sourceBitmap.Height)

        return ReturnBitmap
    }

    private static ReadGreyToBitmap(RawDataFixed: Uint8Array, width: number, height: number): Bitmap {
        const m_Bitmap: Bitmap = new Bitmap(width, height)
        const rect: Rectangle = new Rectangle(0, 0, width, height)

        const bitmapdata: BitmapData = m_Bitmap.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed)
        const destination: IntPtr = bitmapdata.Scan0
        const num: number = (width * height)

        // VB copies (num * 4) even though Format8bppIndexed is 1 byte per pixel. Keep as-is for fidelity.
        Marshal.Copy(RawDataFixed as any, 0, destination, (num * 4))

        m_Bitmap.UnlockBits(bitmapdata)
        return m_Bitmap
    }

    public static ResizeBitmap(sourceBitmap: Bitmap, newSize: Size): Bitmap
    public static ResizeBitmap(sourceBitmap: Bitmap, width: number, height: number, interpolationMode?: InterpolationMode): Bitmap
    public static ResizeBitmap(sourceBitmap: Bitmap, a: any, b?: any, c?: any): Bitmap {
        // Overload 1: (sourceBitmap, newSize)
        if (typeof a === 'object' && a !== null && a !== undefined && (b === undefined)) {
            const newSize: any = a
            return GraphicUtil.ResizeBitmap(
                sourceBitmap,
                (newSize !== null && newSize !== undefined ? newSize.Width : 0),
                (newSize !== null && newSize !== undefined ? newSize.Height : 0)
            )
        }

        // Overload 2: (sourceBitmap, width, height, Optional interpolationMode)
        let width: number = a
        let height: number = b
        const interpolationMode: any = (c !== undefined ? c : InterpolationMode.HighQualityBicubic)

        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }

        if (width < 0) {
            width = -width
        }
        if (height < 0) {
            height = -height
        }
        if ((width === 0) || (height === 0)) {
            return null as any
        }
        if ((sourceBitmap.Width === width) && (sourceBitmap.Height === height)) {
            return sourceBitmap
        }

        if (sourceBitmap.PixelFormat === PixelFormat.Format24bppRgb) {
            return new Bitmap(sourceBitmap, width, height) as any
        }

        // - resize RGB part
        let imageRGB: Bitmap = (sourceBitmap.Clone as any)()
        GraphicUtil.RemoveAlfaChannel(imageRGB)
        imageRGB = GraphicUtil.ResizeBitmapInternal(imageRGB, width, height, interpolationMode)

        // - resize alpha part
        const imageAlpha: Bitmap = GraphicUtil.ResizeBitmapInternal((sourceBitmap.Clone as any)(), width, height, interpolationMode)

        // - merge RGB & alpha
        GraphicUtil.FixAlphaChannel(imageRGB, imageAlpha)

        return imageRGB
    }

    private static ResizeBitmapInternal(sourceBitmap: Bitmap, width: number, height: number, interpolationMode: InterpolationMode): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }

        if (width < 0) {
            width = -width
        }
        if (height < 0) {
            height = -height
        }
        if ((width === 0) || (height === 0)) {
            return null as any
        }
        if ((sourceBitmap.Width === width) && (sourceBitmap.Height === height)) {
            return sourceBitmap
        }

        const image: Bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb)
        const graphics1: Graphics = Graphics.FromImage(image)
        graphics1.InterpolationMode = interpolationMode
        // graphics1.Clear(Color.Transparent)
        graphics1.DrawImage(
            sourceBitmap,
            new Rectangle(0, 0, width, height),
            0, 0, sourceBitmap.Width, sourceBitmap.Height,
            GraphicsUnit.Pixel
        )
        graphics1.Dispose()
        return image
    }

    public static SubSampleBitmap(sourceBitmap: Bitmap, xStep: number, yStep: number): Bitmap {
        if (sourceBitmap === null || sourceBitmap === undefined) {
            return null as any
        }
        if ((xStep <= 0) || (yStep <= 0)) {
            return null as any
        }
        if ((xStep === 1) && (yStep === 1)) {
            return (sourceBitmap.Clone as any)() as any
        }

        const bitmap: Bitmap = new Bitmap(Math.floor(sourceBitmap.Width / xStep), Math.floor(sourceBitmap.Height / yStep), sourceBitmap.PixelFormat)

        let rect: Rectangle = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height)
        const bitmapdata: BitmapData = sourceBitmap.LockBits(rect, ImageLockMode.ReadOnly, sourceBitmap.PixelFormat)

        rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height)
        const data2: BitmapData = bitmap.LockBits(rect, ImageLockMode.ReadWrite, bitmap.PixelFormat)
        const source: IntPtr = data2.Scan0

        const length: number = (sourceBitmap.Width * sourceBitmap.Height)
        const num2: number = (bitmap.Width * bitmap.Height)

        const destination: Int32Array = new Int32Array(length)
        const numArray2: Int32Array = new Int32Array(num2)

        Marshal.Copy(bitmapdata.Scan0, destination as any, 0, length)
        Marshal.Copy(source, numArray2 as any, 0, num2)

        let index: number = 0
        let num4: number = 0

        for (let i = 0; i <= bitmap.Height - 1; i += 1) {
            for (let j = 0; j <= bitmap.Width - 1; j += 1) {
                numArray2[index] = destination[num4]
                index += 1
                num4 = (num4 + xStep)
            }
            num4 = (num4 + ((yStep - 1) * sourceBitmap.Width))
        }

        Marshal.Copy(numArray2 as any, 0, source, num2)

        sourceBitmap.UnlockBits(bitmapdata)
        bitmap.UnlockBits(data2)

        return bitmap
    }

    private static UseColorCombination(
        refColors: Color[],
        tC: Color,
        rgb: Int32Array | number[],
        useOneColor: boolean,
        hist: Int32Array | number[]
    ): boolean {
        let num4: number
        const numArray: number[] = new Array<number>(3)

        rgb[2] = 0
        num4 = 0
        rgb[0] = num4
        rgb[1] = num4

        let index: number = -1
        let num2: number = -1
        let num3: number = -1

        if (((hist[0] + hist[1]) + hist[2]) !== 0) {
            if (((hist[0] > 0) && (hist[1] === 0)) && (hist[2] === 0)) {
                rgb[0] = GraphicUtil.UseOneColor(refColors[0], tC)
                return true
            }
            if (((hist[1] > 0) && (hist[0] === 0)) && (hist[2] === 0)) {
                rgb[1] = GraphicUtil.UseOneColor(refColors[1], tC)
                return true
            }
            if (((hist[2] > 0) && (hist[0] === 0)) && (hist[1] === 0)) {
                rgb[2] = GraphicUtil.UseOneColor(refColors[2], tC)
                return true
            }

            if (!useOneColor) {
                if ((hist[0] >= hist[2]) && (hist[1] >= hist[2])) {
                    const w1 = { value: rgb[0] }
                    const w2 = { value: rgb[1] }
                    if (GraphicUtil.UseTwoColors(refColors[0], refColors[1], tC, w1, w2)) {
                        rgb[0] = w1.value
                        rgb[1] = w2.value
                        return true
                    }
                } else if ((hist[0] >= hist[1]) && (hist[2] >= hist[1])) {
                    const w1 = { value: rgb[0] }
                    const w2 = { value: rgb[2] }
                    if (GraphicUtil.UseTwoColors(refColors[0], refColors[2], tC, w1, w2)) {
                        rgb[0] = w1.value
                        rgb[2] = w2.value
                        return true
                    }
                } else {
                    const w1 = { value: rgb[1] }
                    const w2 = { value: rgb[2] }
                    if (((hist[1] >= hist[0]) && (hist[2] >= hist[0])) && GraphicUtil.UseTwoColors(refColors[1], refColors[2], tC, w1, w2)) {
                        rgb[1] = w1.value
                        rgb[2] = w2.value
                        return true
                    }
                }
            }
        }

        for (let i = 0; i <= 2; i += 1) {
            rgb[i] = 0
            numArray[i] = (((tC.R - refColors[i].R) * (tC.R - refColors[i].R)) + ((tC.G - refColors[i].G) * (tC.G - refColors[i].G)) + ((tC.B - refColors[i].B) * (tC.B - refColors[i].B)))
            if (refColors[i].A === 0) {
                numArray[i] = 0x7FFFFFFF
            }
        }

        if ((numArray[0] <= numArray[1]) && (numArray[0] <= numArray[2])) {
            index = 0
            if (numArray[1] < numArray[2]) {
                num2 = 1
                num3 = 2
            } else {
                num2 = 2
                num3 = 1
            }
        } else if ((numArray[1] <= numArray[0]) && (numArray[1] <= numArray[2])) {
            index = 1
            if (numArray[0] < numArray[2]) {
                num2 = 0
                num3 = 2
            } else {
                num2 = 2
                num3 = 0
            }
        } else {
            index = 2
            if (numArray[0] < numArray[1]) {
                num2 = 0
                num3 = 1
            } else {
                num2 = 1
                num3 = 0
            }
        }

        if ((numArray[index] * 8) < numArray[num2]) {
            rgb[index] = GraphicUtil.UseOneColor(refColors[index], tC)
            return true
        }

        if (useOneColor) {
            return false
        }

        const w1a = { value: rgb[index] }
        const w2a = { value: rgb[num2] }
        if (((numArray[index] * 8) <= numArray[num2]) || !GraphicUtil.UseTwoColors(refColors[index], refColors[num2], tC, w1a, w2a)) {
            const w1b = { value: rgb[index] }
            const w2b = { value: rgb[num3] }
            if (((numArray[index] * 8) > numArray[num3]) && GraphicUtil.UseTwoColors(refColors[index], refColors[num3], tC, w1b, w2b)) {
                rgb[index] = w1b.value
                rgb[num3] = w2b.value
                return true
            }
            rgb[index] = GraphicUtil.UseOneColor(refColors[index], tC)
        } else {
            rgb[index] = w1a.value
            rgb[num2] = w2a.value
        }

        return true
    }

    private static UseOneColor(refColor: Color, targetColor: Color): number {
        let num3: number

        const num: number = Math.floor(((refColor.R + refColor.G + refColor.B) / 3))
        const num2: number = Math.floor(((targetColor.R + targetColor.G + targetColor.B) / 3))

        if (num2 > num) {
            num3 = (0xE2 + Math.floor((30 * (num2 - num)) / (0xFF - num)))
        } else {
            num3 = Math.floor((0xE2 * num2) / num)
        }

        if (num3 < 0) {
            num3 = 0
        }
        if (num3 > 0xFF) {
            num3 = 0xFF
        }

        return num3
    }

    private static UseTwoColors(c1: Color, c2: Color, tc: Color, w1: { value: number }, w2: { value: number }): boolean {
        const num: number = Math.abs((c1.R - c2.R) | 0)
        const num2: number = Math.abs((c1.G - c2.G) | 0)
        const num3: number = Math.abs((c1.B - c2.B) | 0)

        if ((num >= num2) && (num >= num3)) {
            if (c1.R < c2.R) {
                w1.value = Math.floor(((c2.R - tc.R) * 0xE2) / num)
                w2.value = Math.floor(((tc.R - c1.R) * 0xE2) / num)
            } else {
                w1.value = Math.floor(((tc.R - c2.R) * 0xE2) / num)
                w2.value = Math.floor(((c1.R - tc.R) * 0xE2) / num)
            }
        } else if ((num2 >= num) && (num2 >= num3)) {
            if (c1.G < c2.G) {
                w1.value = Math.floor(((c2.G - tc.G) * 0xE2) / num2)
                w2.value = Math.floor(((tc.G - c1.G) * 0xE2) / num2)
            } else {
                w1.value = Math.floor(((tc.G - c2.G) * 0xE2) / num2)
                w2.value = Math.floor(((c1.G - tc.G) * 0xE2) / num2)
            }
        } else if (c1.B < c2.B) {
            w1.value = Math.floor(((c2.B - tc.B) * 0xE2) / num3)
            w2.value = Math.floor(((tc.B - c1.B) * 0xE2) / num3)
        } else {
            w1.value = Math.floor(((tc.B - c2.B) * 0xE2) / num3)
            w2.value = Math.floor(((c1.B - tc.B) * 0xE2) / num3)
        }

        if (w1.value < 0) {
            w1.value = 0
        }
        if (w1.value > 0xFF) {
            w1.value = 0xFF
        }
        if (w2.value < 0) {
            w2.value = 0
        }
        if (w2.value > 0xFF) {
            w2.value = 0xFF
        }

        return ((w1.value >= 0) && (w2.value >= 0))
    }

    // --> BitmapLeft on the left side, BitmapRight on the right side: supports alpha, sizes should be same!
    public static MergeBitmaps(BitmapLeft: Bitmap, BitmapRight: Bitmap): Bitmap {
        if (BitmapLeft.PixelFormat !== PixelFormat.Format32bppArgb) { // --> should always be with alpha
            BitmapLeft = GraphicUtil.Get32bitBitmap(BitmapLeft)
        }
        if (BitmapRight.PixelFormat !== PixelFormat.Format32bppArgb) { // --> should always be with alpha
            BitmapRight = GraphicUtil.Get32bitBitmap(BitmapRight)
        }

        return GraphicUtil.MergeBitmaps_int(BitmapLeft, BitmapRight)
    }

    // --> BitmapLeft on the left side, BitmapRight on the right side: supports alpha, sizes should be same!
    private static MergeBitmaps_int(BitmapLeft: Bitmap, BitmapRight: Bitmap): Bitmap {
        if ((BitmapLeft.Width !== BitmapRight.Width) || (BitmapLeft.Height !== BitmapRight.Height)) {
            return null as any
        }

        const BitmapOut: Bitmap = new Bitmap(BitmapLeft.Width * 2, BitmapLeft.Height, Imaging.PixelFormat.Format32bppArgb)

        let rect: Rectangle = new Rectangle(0, 0, BitmapLeft.Width, BitmapLeft.Height)
        const bitmapdataLeft: BitmapData = BitmapLeft.LockBits(rect, ImageLockMode.ReadWrite, BitmapLeft.PixelFormat)

        rect = new Rectangle(0, 0, BitmapRight.Width, BitmapRight.Height)
        const bitmapdataRight: BitmapData = BitmapRight.LockBits(rect, ImageLockMode.ReadOnly, BitmapRight.PixelFormat)

        rect = new Rectangle(0, 0, BitmapOut.Width, BitmapOut.Height)
        const bitmapdataOut: BitmapData = BitmapOut.LockBits(rect, ImageLockMode.ReadOnly, BitmapOut.PixelFormat)

        const PtrLeft: IntPtr = bitmapdataLeft.Scan0
        const PtrRight: IntPtr = bitmapdataRight.Scan0
        const PtrOut: IntPtr = bitmapdataOut.Scan0

        const num: number = (BitmapLeft.Width * BitmapLeft.Height)

        const BytesLeft: Uint8Array = new Uint8Array((num * 4))
        const BytesRight: Uint8Array = new Uint8Array((num * 4))
        const BytesOut: Uint8Array = new Uint8Array(((BitmapOut.Width * BitmapOut.Height) * 4))

        Marshal.Copy(PtrLeft, BytesLeft as any, 0, (num * 4))
        Marshal.Copy(PtrRight, BytesRight as any, 0, (num * 4))
        Marshal.Copy(PtrOut, BytesOut as any, 0, ((BitmapOut.Width * BitmapOut.Height) * 4))

        let OffsetLeft: number = 0
        let OffsetRight: number = 0

        for (let i = 0; i <= ((BitmapOut.Width * BitmapOut.Height) * 4) - 1; i += (BitmapLeft.Width * 4 * 2)) {
            Buffer.BlockCopy(BytesLeft as any, OffsetLeft, BytesOut as any, i, BitmapLeft.Width * 4)
            Buffer.BlockCopy(BytesRight as any, OffsetRight, BytesOut as any, i + (BitmapLeft.Width * 4), BitmapRight.Width * 4)

            OffsetLeft += BitmapLeft.Width * 4
            OffsetRight += BitmapRight.Width * 4
        }

        BitmapLeft.UnlockBits(bitmapdataLeft)
        BitmapRight.UnlockBits(bitmapdataRight)

        Marshal.Copy(BytesOut as any, 0, PtrOut, ((BitmapOut.Width * BitmapOut.Height) * 4))
        BitmapOut.UnlockBits(bitmapdataOut)

        return BitmapOut
    }

    public static GetTextureSize(m_width: number, m_height: number, m_TextureFormat: ETextureFormat): number {
        let m_Size: number

        switch (m_TextureFormat) {
            case ETextureFormat.BC1:
            case ETextureFormat.BC4:
                if (m_width < 4) {
                    m_width = 4
                }
                if (m_height < 4) {
                    m_height = 4
                }
                m_Size = Math.floor((m_width * m_height) / 2)
                break

            case ETextureFormat.BC2:
            case ETextureFormat.BC3:
            case ETextureFormat.BC5:
                if (m_width < 4) {
                    m_width = 4
                }
                if (m_height < 4) {
                    m_height = 4
                }
                m_Size = (m_width * m_height)
                break

            case ETextureFormat.B8G8R8A8:
            case ETextureFormat.R8G8B8A8:
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 4)
                break

            case ETextureFormat.B8G8R8: // no samples found, confirmed with gimp
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 3)
                break

            case ETextureFormat.L8:
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height)
                break

            case ETextureFormat.L8A8: // FO3 (F11) jersey_bump texts
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 2)
                break

            case ETextureFormat.B4G4R4A4: // no samples found, confirmed with gimp
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 2)
                break

            case ETextureFormat.B5G6R5:
            case ETextureFormat.B5G5R5A1: // no samples found, confirmed with gimp
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 2)
                break

            case ETextureFormat.R32G32B32A32Float:
                if (m_width < 1) {
                    m_width = 1
                }
                if (m_height < 1) {
                    m_height = 1
                }
                m_Size = (m_width * m_height * 16)
                break

            case ETextureFormat.BC6H_UF16:
                if (m_width < 4) {
                    m_width = 4
                }
                if (m_height < 4) {
                    m_height = 4
                }
                m_Size = (m_width * m_height)
                break

            case ETextureFormat.BC7:
                if (m_width < 4) {
                    m_width = 4
                }
                if (m_height < 4) {
                    m_height = 4
                }
                m_Size = (m_width * m_height)
                break

            default:
                m_Size = (m_width * m_height)
                MsgBox('unknown format')
                break
        }

        return m_Size
    }

    public static GetTexturePitch(m_width: number, m_TextureFormat: ETextureFormat): number {
        // https://docs.microsoft.com/en-us/windows/win32/direct3ddds/dx-graphics-dds-pguide
        // http://www.soccergaming.com/index.php?threads/rx3-file-format-research-thread.6467750/page-2#post-6600051

        let m_Pitch: number = 0

        switch (m_TextureFormat) {
            case ETextureFormat.BC1:
            case ETextureFormat.BC4:
                if (m_width < 4) {
                    m_width = 4
                }
                m_Pitch = Math.max(1, Math.floor((m_width + 3) / 4)) * 8
                break

            case ETextureFormat.BC2:
            case ETextureFormat.BC3:
            case ETextureFormat.BC5:
                if (m_width < 4) {
                    m_width = 4
                }
                m_Pitch = Math.max(1, Math.floor((m_width + 3) / 4)) * 16
                break

            case ETextureFormat.B8G8R8A8:
            case ETextureFormat.R8G8B8A8:
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 32
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.B8G8R8: // no samples found, experimental (pitch from microsoft docs)
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 24
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.L8:
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 8
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.L8A8:
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 16
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.B5G6R5:
            case ETextureFormat.B4G4R4A4:
            case ETextureFormat.B5G5R5A1: // no samples found, experimental
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 16
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.R32G32B32A32Float:
                if (m_width < 1) {
                    m_width = 1
                }
                {
                    const bitsperpixel: number = 128
                    m_Pitch = Math.floor((m_width * bitsperpixel + 7) / 8)
                }
                break

            case ETextureFormat.BC6H_UF16:
                if (m_width < 4) {
                    m_width = 4
                }
                m_Pitch = Math.max(1, Math.floor((m_width + 3) / 4)) * 16
                break

            case ETextureFormat.BC7:
                if (m_width < 4) {
                    m_width = 4
                }
                m_Pitch = Math.max(1, Math.floor((m_width + 3) / 4)) * 16
                break

            default:
                MsgBox('unknown format')
                break
        }

        return m_Pitch as any
    }

    public static CalcNumMips(Width: number, Height: number): number {
        return (1 + Math.floor(Math.log(Math.max(Width, Height)) / Math.log(2)))
    }
}
