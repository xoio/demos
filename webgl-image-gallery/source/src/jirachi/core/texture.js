import {logError} from '../utils'


/**
 * Creates a depth texture for an FBO.
 * @param gl
 * @param width
 * @param height
 */
export function createDepthTexture(gl,{width=128,height=128,depthType}={}){
    let depthbuffer = gl.createTexture();
    depthType = depthType !== undefined ? depthType : gl.DEPTH_COMPONENT;
    let format = null;

    if(gl instanceof WebGL2RenderingContext){
        depthType = gl.DEPTH_COMPONENT16
    }

    let settings = {
        wrapS:CLAMP_TO_EDGE,
        wrapT:CLAMP_TO_EDGE,
        minFilter:LINEAR,
        magFilter:LINEAR
    };


    gl.bindTexture(gl.TEXTURE_2D,depthbuffer);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,settings.magFilter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,settings.minFilter);

    gl.texParameteri(TEXTURE_2D,WRAP_S,settings.wrapS);
    gl.texParameteri(TEXTURE_2D,WRAP_T,settings.wrapT);

    if(gl instanceof WebGLRenderingContext){
        gl.texImage2D(gl.TEXTURE_2D,0,depthType,width,height,0,depthType,gl.UNSIGNED_SHORT,null);
    }else{
        gl.texImage2D(gl.TEXTURE_2D,0,depthType,width,height,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_SHORT,null);
    }

    gl.bindTexture(gl.TEXTURE_2D,null);

    return depthbuffer;

}

/**
 * A stand alone function for creating data based textures with TypedArrays.
 * Usable on it's own, but recommended that you use the {@link createTexture2d}
 * function
 * @param gl {WebGLRenderingContext} a WebGLRenderingContext
 * @param data {TypedArray} a TypedArray of data you want to write onto the texture
 * @param options {Object} a map of options for the texture creation. Needs the following keys
 * - width
 * - height
 * - internalFormat (gl.RGBA, etc)
 * - format (in WebGL 1, this should be the same as internalFormat, may change in WebGL2)
 * - type (gl.FLOAT, etc)
 * @returns {*}
 */
export function createDataTexture(gl,data,options){
    let texture = gl.createTexture();
	gl.bindTexture(TEXTURE_2D,texture);


	// set the image
	// known to work with random floating point data
    //gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,width,height,0,gl.RGBA,gl.FLOAT,data);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		options.internalFormat,
		options.width,
		options.height,
		0,
		options.format,
		options.texelType,
		data
	);
	// set min and mag filters
	gl.texParameteri(TEXTURE_2D,MAG_FILTER,options.magFilter);
	gl.texParameteri(TEXTURE_2D,MIN_FILTER,options.minFilter)

	//set wrapping
	gl.texParameteri(TEXTURE_2D,WRAP_S,options.wrapS)
	gl.texParameteri(TEXTURE_2D,WRAP_T,options.wrapT)

	// generate mipmaps if necessary
	if(options.generateMipMaps){
		gl.generateMipmap(TEXTURE_2D);
	}

	gl.bindTexture(TEXTURE_2D,null);
	// store contents as an attribute of the texture object
	texture.contents = data;
	return texture;
}

/**
 * builds a Cubemap from a dds image file. Partially adapted from
 * @yiwenl's GLCubeTexture.js
 *
 * @param gl {WebGLRenderingContext} a webgl rendering context.
 * @param ddssource {Array} the source array containing the data from the dds file. Assumes
 * file was loaded using Imageloader::loadDDS
 * @param textureFormat {Object} Object containing texture format information created from createTextureFormat
 */
export function createCubemapFromDDS(gl,ddssource,textureFormat){
    const targets = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    if(textureFormat === undefined){
        textureFormat = createTextureFormat({
            format:gl.RGBA,
            internalFormat:gl.RGBA16F,
            texelType:gl.FLOAT
        });
    }


    // there are mips, so adjust filtering
    textureFormat.minFilter = gl.LINEAR_MIPMAP_LINEAR;
    let numLevels = 1;
    let index = 0;
    numLevels = ddssource.length / 6;

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < numLevels; i++) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

            index = j * numLevels + i;

            if(ddssource[index].shape) {
                 gl.texImage2D(targets[j], i, textureFormat.internalFormat, ddssource[index].shape[0], ddssource[index].shape[1], 0, textureFormat.format, textureFormat.texelType, ddssource[index].data);
            } else {
                gl.texImage2D(targets[j], i, textureFormat.format, textureFormat.internalFormat, textureFormat.texelType, ddssource[index]);
            }

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, textureFormat.wrapS);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, textureFormat.wrapT);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, textureFormat.magFilter);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, textureFormat.minFilter);
        }
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);


    return {
        raw:texture,
        bind(index=0){
            gl.activeTexture(TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.raw);
        },

        unbind(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
    }

}


/**
 * Creates a CubeMap from a set of images
 * @param gl {WebGLRenderingContext} a WebGl context
 * @param images {Array} array of 6 images that will make up the CubeMap
 * @returns {*}
 */
export function createCubemap(gl,images,textureFormat){
    const targets = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    if(images.length < 6){
        logError("createCubemap error - not enough images to form cubemap",true);
        return;
    }

    if(textureFormat === undefined){
        textureFormat = createTextureFormat();
    }


    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    for (let j = 0; j < 6; j++) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        if(images[j].shape) {
            gl.texImage2D(targets[j], 0, textureFormat.format, images[j].shape.width, images[j].shape.height, 0, textureFormat.format, textureFormat.texelType, images[j].data);
        } else {
            gl.texImage2D(targets[j], 0, textureFormat.format, textureFormat.format, textureFormat.texelType, images[j]);
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, textureFormat.wrapS);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, textureFormat.wrapT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, textureFormat.magFilter);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, textureFormat.minFilter);
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    return {
        raw:texture,
        bind(index=0){
            gl.activeTexture(TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.raw);
        },

        unbind(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
    }
}

/**
 * Create an image based texture. Usable on it's own, but recommended that you use the {@link createTexture2d}
 * function
 * @param gl {WebGLRenderingContext} a WebGLRenderingContext
 * @param image {Image} and image object
 * @param options {Object} a map of options for the texture creation
 * @returns {*}
 */
export function createImageTexture(gl,image,options){
    let texture = gl.createTexture();
    gl.bindTexture(TEXTURE_2D,texture);


    // set the image
    gl.texImage2D(TEXTURE_2D,0,options.format,options.format,options.texelType,image);
	//gl.texImage2D(TEXTURE_2D,0,options.format,options.format,gl.UNSIGNED_BYTE,image);

    // set min and mag filters
    gl.texParameteri(TEXTURE_2D,MAG_FILTER,options.magFilter);
    gl.texParameteri(TEXTURE_2D,MIN_FILTER,options.minFilter)

    //set wrapping
    gl.texParameteri(TEXTURE_2D,WRAP_S,options.wrapS)
    gl.texParameteri(TEXTURE_2D,WRAP_T,options.wrapT)

    // generate mipmaps if necessary
    if(options.generateMipMaps){
        gl.generateMipmap(TEXTURE_2D);
    }

    if(options.flipY){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    }

    gl.bindTexture(TEXTURE_2D,null);

    // store contents as an attribute of the texture object
    texture.contents = image;
    return texture;
}

/**
 * Ensures that the specified width/height for the texture doesn't exceed the max for the
 * current card
 * @param gl {WebGLRenderingContext} a WebGL context
 * @param width {Number} the width
 * @param height {Number} the height
 * @returns {boolean}
 */
export function checkTextureSize(gl,width,height){
    var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    if(width < 0 || width > maxTextureSize || height < 0 || height  > maxTextureSize) {
        logError('Invalid texture shape specified',true);
        return false;
    }else{
        return true;
    }
}
// =================== MAIN FUNCTIONS ===================== //

/**
 * Creates an object of texture settings that can be used in the creation of a texture.
 * Note that default settings are based on a WebGL1 spec of rendering floating point textures
 * @param options {Object} options for how to create your texture.
 * @returns {{format: *, internalFormat: *, type: *, wrapS: *, wrapT: *, minFilter: *, magFilter: *, generateMipMaps: boolean}}
 */
export function createTextureFormat({
    format=RGBA,
    internalFormat=RGBA,
    texelType=UNSIGNED_BYTE,
    wrapS=CLAMP_TO_EDGE,
    wrapT=CLAMP_TO_EDGE,
    minFilter=LINEAR,
    magFilter=LINEAR,
    generateMipMaps=false,
    depth=false,
    flipY=true
}={}){


    if(depth !== false){
        depth = gl.DEPTH_COMPONENT;
    }

    // NOTES
    // 1. in WebGL 1 , internalFormat and format ought to be the same value. TODO does this change in WebGL2?
    // 2. UNSIGNED_BYTE corresponds to a Uint8Array, float corresponds to a Float32Array
    let tformat = {
        format:format,
        internalFormat:internalFormat,
        wrapS:wrapS,
        wrapT:wrapT,
        texelType:texelType,
        minFilter:minFilter,
        magFilter:magFilter,
        generateMipMaps:generateMipMaps,
        depth:depth
    };


    return tformat;
}

/**
 * Helper when doing things like ping-ponging - creates a an array of duplicate textures.
 * @param gl
 * @param data
 * @param textureFormat
 * @param width
 * @param floatingPoint
 * @param height
 * @param randomInit
 */
export function createTexturePair(gl,{
	data,
    floatingPoint=false,
    textureFormat=null,
    width=128,height=128,
    randomInit=false
}={}){

    return [
        createTexture2d(gl,{
			width:width,
			height:height,
			randomInit:randomInit,
            textureFormat:textureFormat,
			floatingPoint:true,
            data:data
        }),
		createTexture2d(gl,{
			width:width,
			height:height,
			textureFormat:textureFormat,
            randomInit:randomInit,
			floatingPoint:true,
			data:data
		})
    ]
}

/**
 * Simple function for creating a basic texture
 * @param gl {WebGLRenderingContext} a WebGL context
 * @param data {Object} the initial texture data to use. Can be a TypedArray or an image.
 * @param textureFormat {Object} any options for how to process the resulting texture. Will call createTextureFormat by default if null.
 * @param width {Number} The width of the texture
 * @param height {Number} The height of the texture
 * @param randomInit {Boolean} a flag indicating whether or not we want random information written to the texture.
 * Useful for things like GPU ping-pong. False by default.
 * @returns {*}
 */
export function createTexture2d(gl,{data,floatingPoint=false,textureFormat=null,width=128,height=128,randomInit=false}={}){
    let texture = null;


    // if texture format is not specified, generate default format
    let textureSettings = textureFormat;
	if(textureSettings === null) {
		textureSettings = createTextureFormat();
	}

    // if we have data, process it as such, otherwise generate a blank texture of random floating point data
    if(data === undefined){
        let data = null;


		/**
		 * WebGL2 has some slightly different requirements that need to be
		 * accounted for to get our random floating point texture.
		 * TODO RGBA32F doesn't work for some reason even with what should be acceptable settings
		 */
		if(gl instanceof WebGL2RenderingContext && floatingPoint === true){

		    // need to enable this extension for some reason to do floating point stuff.
            // https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html
            gl.getExtension("EXT_color_buffer_float");

            textureSettings.internalFormat = gl.RGBA16F;
			textureSettings.texelType = gl.FLOAT
		}

		if(gl instanceof WebGLRenderingContext && floatingPoint === true){
			textureSettings.texelType = gl.FLOAT
		}

        //simplify the above a bit, leaving it for testing.
        if(textureSettings.texelType === FLOAT){
            data = new Float32Array(width * height * 4);
        }else{
            data = new Uint8Array(width * height * 4);
        }

        // if we just need a smattering of random data, apply that here if the flag is set
        if(randomInit){

            for(let i = 0; i < (width * height * 4);i += 4){
                data[i] = Math.random() * 2;
                data[i + 1] = Math.random() * 2;
                data[i + 2] = Math.random() * 2;
                data[i + 3] = 1.0;
            }
            textureSettings.data = data;
        }


        textureSettings["width"] = width;
        textureSettings["height"] = height;
        texture = createDataTexture(gl,data,textureSettings);


        // if we have data
    }else{


		textureSettings["width"] = width;
        textureSettings["height"] = height;

        if(gl instanceof WebGL2RenderingContext && floatingPoint === true){

            // need to enable this extension for some reason to do floating point stuff.
            // https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html
            gl.getExtension("EXT_color_buffer_float");

            textureSettings.internalFormat = gl.RGBA16F;
            textureSettings.texelType = gl.FLOAT
        }

		if(gl instanceof WebGLRenderingContext && floatingPoint === true){
			textureSettings.texelType = gl.FLOAT
		}


        // if it's an image, build an image texture
        if(data instanceof Image){
            texture = createImageTexture(gl,data,textureSettings);
        }

        // if it's a float 32 array we, build a data texture.
        if(data instanceof Float32Array){
            texture = createDataTexture(gl,data,textureSettings);
        }

        // if it's a float 32 array we, build a data texture.
        if(data instanceof Uint8Array){
            if(textureSettings.type !== FLOAT){
                textureSettings.type = FLOAT;
            }
            texture = createDataTexture(gl,data,textureSettings);
        }

        if(data instanceof Array){
            if(textureSettings.type !== FLOAT){
                textureSettings.type = FLOAT;
            }
            texture = createDataTexture(gl,new Float32Array(data),textureSettings);
        }

        textureSettings.data = data;

    }

    return {
        gl:gl,
        texture:texture,
        raw:texture,
        settings:textureSettings,
        name:"Texture",
        getTexture(){
            return this.texture;
        },

        /**
         * Resizes a texture
         * @param w the new width
         * @param h the new height
         */
        resize(w,h){
            let options = this.settings;
            this.settings.width = w;
            this.settings.height = h;

            if(checkTextureSize(this.gl,w,h)){

                this.bind();
                gl.texImage2D(
                    TEXTURE_2D,
                    0,
                    options.internalFormat,
                    this.settings.width,
                    this.settings.height,
                    0,
                    options.format,
                    options.texelType,
                    options.data
                );
                this.unbind(0)
            }
        },
        bind(index=0){
            let gl = this.gl;
            //gl.activeTexture(TEXTURE0 + index);
            gl.activeTexture(gl[`TEXTURE${index}`]);
            gl.bindTexture(gl.TEXTURE_2D,this.texture);

            this.isBound = true;
        },

        unbind(){
            gl.bindTexture(gl.TEXTURE_2D,null);
        }
    }
}
