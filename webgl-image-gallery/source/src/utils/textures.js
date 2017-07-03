import {createTexture2d} from '../jirachi/core/texture'


/**
 * A companion function to when using PreloadJS - the lib returns images as
 * blob urls, which WebGL doesn't like apparently(at least on Windows).
 * This takes the raw blob, converts to base64, and then creates the texture.
 * @param gl {WebGLRenderingContext} A webgl context
 * @param file {Object} a object created by PreloadJS as the result of a file load.
 * @returns {Promise} returns promise and resolves once texture is created.
 */
export function blobToTexture(gl,file){

	return new Promise((res,rej) => {

        let textures = [];
        let reader = new FileReader();

        reader.readAsDataURL(file.rawResult);

        reader.onloadend = () => {

            // store base64 in case we might need it again
            file["base64"] = reader.result;


            // build texture
            let image = new Image();
            image.src = reader.result;
            let tex;

            image.onload = () => {
                tex = createTexture2d(gl,{
                    data:image
                });
                file["texture"] = tex;

                res(file);
            }


        }
	})
}