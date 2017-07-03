// adapted parse-dds npm package in es6 module format.
// original here https://github.com/Jam3/parse-dds.
// and here https://github.com/yiwenl/Alfrid/blob/0ae538184ac54eb9ab96e7cd0fc2b26e5e248d31/src/alfrid/GLCubeTexture.js

import {clamp} from '../math/core'

var DDS_MAGIC = 0x20534444
var DDSD_MIPMAPCOUNT = 0x20000
var DDPF_FOURCC = 0x4

var FOURCC_DXT1 = fourCCToInt32('DXT1')
var FOURCC_DXT3 = fourCCToInt32('DXT3')
var FOURCC_DXT5 = fourCCToInt32('DXT5')
var FOURCC_DX10 = fourCCToInt32('DX10')
var FOURCC_FP32F = 116 // DXGI_FORMAT_R32G32B32A32_FLOAT

var DDSCAPS2_CUBEMAP = 0x200
var D3D10_RESOURCE_DIMENSION_TEXTURE2D = 3
var DXGI_FORMAT_R32G32B32A32_FLOAT = 2

// The header length in 32 bit ints
var headerLengthInt = 31

// Offsets into the header array
var off_magic = 0
var off_size = 1
var off_flags = 2
var off_height = 3
var off_width = 4
var off_mipmapCount = 7
var off_pfFlags = 20
var off_pfFourCC = 21
var off_caps2 = 28



function parseHeaders (arrayBuffer) {
    var header = new Int32Array(arrayBuffer, 0, headerLengthInt)

    if (header[off_magic] !== DDS_MAGIC) {
        throw new Error('Invalid magic number in DDS header')
    }

    if (!header[off_pfFlags] & DDPF_FOURCC) {
        throw new Error('Unsupported format, must contain a FourCC code')
    }

    var blockBytes
    var format
    var fourCC = header[off_pfFourCC]
    switch (fourCC) {
        case FOURCC_DXT1:
            blockBytes = 8
            format = 'dxt1'
            break
        case FOURCC_DXT3:
            blockBytes = 16
            format = 'dxt3'
            break
        case FOURCC_DXT5:
            blockBytes = 16
            format = 'dxt5'
            break
        case FOURCC_FP32F:
            format = 'rgba32f'
            break
        case FOURCC_DX10:
            var dx10Header = new Uint32Array(arrayBuffer.slice(128, 128 + 20))
            format = dx10Header[0]
            var resourceDimension = dx10Header[1]
            var miscFlag = dx10Header[2]
            var arraySize = dx10Header[3]
            var miscFlags2 = dx10Header[4]

            if (resourceDimension === D3D10_RESOURCE_DIMENSION_TEXTURE2D && format === DXGI_FORMAT_R32G32B32A32_FLOAT) {
                format = 'rgba32f'
            } else {
                throw new Error('Unsupported DX10 texture format ' + format)
            }
            break
        default:
            throw new Error('Unsupported FourCC code: ' + int32ToFourCC(fourCC))
    }

    var flags = header[off_flags]
    var mipmapCount = 1

    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[off_mipmapCount])
    }

    var cubemap = false
    var caps2 = header[off_caps2]
    if (caps2 & DDSCAPS2_CUBEMAP) {
        cubemap = true
    }

    var width = header[off_width]
    var height = header[off_height]
    var dataOffset = header[off_size] + 4
    var texWidth = width
    var texHeight = height
    var images = []
    var dataLength

    if (fourCC === FOURCC_DX10) {
        dataOffset += 20
    }

    if (cubemap) {
        for (var f = 0; f < 6; f++) {
            if (format !== 'rgba32f') {
                throw new Error('Only RGBA32f cubemaps are supported')
            }
            var bpp = 4 * 32 / 8

            width = texWidth
            height = texHeight

            // cubemap should have all mipmap levels defined
            // Math.log2(width) + 1
            var requiredMipLevels = Math.log(width) / Math.log(2) + 1

            for (var i = 0; i < requiredMipLevels; i++) {
                dataLength = width * height * bpp
                images.push({
                    offset: dataOffset,
                    length: dataLength,
                    shape: [ width, height ]
                })
                // Reuse data from the previous level if we are beyond mipmapCount
                // This is hack for CMFT not publishing full mipmap chain https://github.com/dariomanesku/cmft/issues/10
                if (i < mipmapCount) {
                    dataOffset += dataLength
                }
                width = Math.floor(width / 2)
                height = Math.floor(height / 2)
            }
        }
    } else {
        for (var i = 0; i < mipmapCount; i++) {
            dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes

            images.push({
                offset: dataOffset,
                length: dataLength,
                shape: [ width, height ]
            })
            dataOffset += dataLength
            width = Math.floor(width / 2)
            height = Math.floor(height / 2)
        }
    }

    return {
        shape: [ texWidth, texHeight ],
        images: images,
        format: format,
        flags: flags,
        cubemap: cubemap
    }
}

function fourCCToInt32 (value) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24)
}

function int32ToFourCC (value) {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    )
}

/**
 * Parses a DDS image file loaded as an ArrayBuffer
 * @param mArrayBuffer {ArrayBuffer} an ArrayBuffer containing the loaded dds data
 * @returns {Array} parseable array for loading into a cubemap
 */
export default function parseDDS(mArrayBuffer){
    //	CHECKING MIP MAP LEVELS
    const ddsInfos = parseHeaders(mArrayBuffer);
    const { flags } = ddsInfos;
    const header = new Int32Array(mArrayBuffer, 0, headerLengthInt);
    let mipmapCount = 1;
    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[OFF_MIPMAPCOUNT]);
    }
    const DDSD_MIPMAPCOUNT = 0x20000;
    const OFF_MIPMAPCOUNT = 7;
    const headerLengthInt = 31;
    const sources = ddsInfos.images.map((img) => {
        const faceData = new Float32Array(mArrayBuffer.slice(img.offset, img.offset + img.length));
        return {
            data: faceData,
            shape: img.shape,
            mipmapCount,
        };
    });

    return sources;
}