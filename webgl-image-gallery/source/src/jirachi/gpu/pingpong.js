import {createFBO} from '../core/fbo'
import {createQuad} from '../quad'
import {createTexture2d,createTextureFormat} from '../core/texture'


/**
 * Helper function to create 2 textures suitable for ping-ponging across FBOs
 * @param gl {WebGLContext} a WebGL Rendering context
 * @param data {Image or ArrayBuffer} the data to associate with a texture, if any. If false, will generate
 * texture with random data.
 * @param width {Number} The width for the texture. by default is 128
 * @param height {Number} The height for the texture, by default it is 128
 */
export function generatePingpongTextures(gl,{
    data=null,
    width=128,
    height=128
}={}){


}