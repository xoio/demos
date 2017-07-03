import {createTexture2d,createTextureFormat,createDepthTexture} from "./texture"
import {logError,logWarn} from '../utils'

/**
 * A helper function for checking whether or not building a framebuffer was successful
 * @param gl {WebGLContext} a webgl rendering context.
 * @param status {Number} the value obtained from calling gl.checkFramebufferStatus
 * @returns {boolean} returns true or throws an error.
 */
function throwFBOError(gl,status) {
    switch(status){
        case gl.FRAMEBUFFER_UNSUPPORTED:
            throw new Error('gl-fbo: Framebuffer unsupported')
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw new Error('gl-fbo: Framebuffer incomplete attachment')
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw new Error('gl-fbo: Framebuffer incomplete dimensions')
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw new Error('gl-fbo: Framebuffer incomplete missing attachment')

        case gl.FRAMEBUFFER_COMPLETE:
            return true;
        default:
            console.error("unknown error creating framebuffer")
            return false;

    }
}

//================== MAIN FUNCTION ======================== //

/**
 * This is used to help setup multi-attachment FBOs.
 * @param gl {WebGLRenderingContext} a webgl context
 * @param attachments {Number} Number of attachments desired
 * @param textures {Array} Array of textures for each attachment. Note that each item's indice maps to the same attachment, IE textures[0] maps to COLOR_ATTACHMENT0
 * @returns {{attachments: *, maxAttachments: *}}
 */
export function createFBOAttachmentFormat(gl,{
    // items in textures array should be nested arrays
    textures=[]
}={}){

    // setup attachment constants
    let attachPts = [];
    let maxAttachments;
    let ext = null;
    let attachments = textures.length;
    if(gl instanceof WebGL2RenderingContext){
        maxAttachments = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)
    }else{
        ext = gl.getExtension('WEBGL_draw_buffers');
        maxAttachments = gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL);
    }

    // ensure attachments is less than max and ensure texture length is the same too
    // before storing necessary constants.
    // store associations with any texture and attachment points if necessary.
    // The textures array is assumed to be the same length as the number of attachments specified.
    if(attachments > 0 && attachments < maxAttachments){

        if(attachments === textures.length){

            for(let i = 0; i < attachments; ++i){

                // by default, COLOR_ATTACHMENT_0 is already occupied when creating FBO, so remember
                // to offset by 1
                if(gl instanceof WebGL2RenderingContext){
                    attachPts.push(
                        {
                            texture:textures[i],
                            attachPoint:gl.COLOR_ATTACHMENT0 + i
                        }
                    )
                }else{
                    attachPts.push(
                        {
                            texture:textures[i],
                            attachPoint:ext[`COLOR_ATTACHMENT${i}_WEBGL`]
                        }
                    )
                }
            }
        }else{
            console.error("fbo.js::createFBOAttachmentFormat - the number of desired attachments doesn't match the number of textures passed in");
        }

    }


    return {
        // all compiled attachment constants with their corresponding textures, if any.
        // If no attachments, will be false
        attachments:attachPts.length > 0 ? attachPts : false,
        maxAttachments:maxAttachments,
        ext:ext !== null ? ext : false
    }
}

// =================== MAIN FUNCTION ================ //
/**
 * Creates an FBO
 * @param gl {WebGLRenderingContext} A WebGL contex t
 * @param width {Number} Width for the FBO. Defaults to 128
 * @param height {Number} Height for the FBO. Defaults to 128
 * @param initTexture {Texture} a texture object made with Jirachi::createTexture.
 * @param depthTexture {Boolean} Whether or not we need a depth layer to the texture
 * @param format {Object} Format for how to setup the internal textures TODO see about deprecation since we really ought to enforce adding textures.
 *
 * @returns {*}
 */
export function createFBO(gl,{

    width=512,
    height=512,
    initTexture=null,
    depthTexture=false,
    format=null
}={}){

    let framebuffer = gl.createFramebuffer();
    let attachmentTextures = [];
    let attachmentPoints = [];

    // =========== BUILD FBO TEXTURE =========== //

    /**
     * Check for initialization texture, if not and we're not creating a multi-attachment fbo, create a default texture.
     * @type {null}
     */
    let texture = null;
    if(initTexture !== null){
        texture = initTexture;
    }else{

        if(format !== null){
            if(format.attachments === false){
                texture = createTexture2d(gl,{
                    width:width,
                    height:height,
                    floatingPoint:true,
                })
            }
        }

        if(format === null){
            texture = createTexture2d(gl,{
                width:width,
                height:height,
                floatingPoint:true,
            })
        }
    }



    // =========== BUILD FBO =========== //
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);



    if(format === null){
        // attach primary drawing texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.raw, 0);
    }else{


        // apply all color attachments
        let attLen = format.attachments.length;
        // loop through attachments and append
        for(let i = 0; i < attLen; ++i){
            let attachment = format.attachments[i];
            let aTex = attachment.texture;
            let point = attachment.attachPoint;



            gl.framebufferTexture2D(gl.FRAMEBUFFER,point, gl.TEXTURE_2D, aTex.raw, 0);
            // store attachment points so we can call drawBuffers later on
            attachmentPoints.push(point);
            attachmentTextures.push(aTex);
        }

    }


    /**
     * If we need a depth texture, build it and add.
     */
    if(depthTexture){
        let depth = createDepthTexture(gl,{
            width:width,
            height:height
        });
        gl.framebufferTexture2D(FRAMEBUFFER,gl.DEPTH_ATTACHMENT,TEXTURE_2D,depth,0);

    }

    // make sure FBO is complete
    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    throwFBOError(gl,status);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);



    return {
        gl:gl,
        name:"FBO",
        drawTexture:texture,
        fbo:framebuffer,
        attachmentPoints:attachmentPoints,
        attachmentTextures:attachmentTextures.length > 0 ? attachmentTextures : false,
        ext:format !== null ? format.ext : false,
        numAttachments:attachmentTextures.length,
        /**
         * Get the texture for the FBO. You can pass in an optional index if you're dealing with multiple
         * color attachments. Will return the default texture if no texture attachments are associated with
         * the fbo.
         * @param idx {Number} an optional index to grab the specific texture you want
         * @returns {*}
         */
        getTexture(idx=0){
            if(attachmentTextures !== false && idx < attachmentTextures.length){
                return this.attachmentTextures[idx];
            }else{
                return texture;
            }
        },
        /**
         * For binding the Fbo to draw onto it.
         */
        bind(){
            gl.bindFramebuffer(FRAMEBUFFER,framebuffer);
        },

        /**
         * Unbinds the previously bound FBO, returning drawing commands to
         * the main context Framebuffer.
         */
        unbind(){
            gl.bindFramebuffer(FRAMEBUFFER,null);
        },

        /**
         * Alias for gl.drawBuffers - enables all currently enabled color attachments
         */
        drawBuffers(custom_array=[]){
            let ext = this.ext;
            if(gl instanceof WebGL2RenderingContext){
                gl.drawBuffers(this.attachmentPoints);
            }else{
                if(ext !== false){
                    ext.drawBuffersWEBGL(this.attachmentPoints);
                }
            }
        },

        /**
         * Gets the texture at the associated color attachment point on the fbo
         * @deprecated
         * @param idx
         * @returns {*}
         */
        getColorAttachmentTexture(idx = 0){
            return this.attachmentTextures[idx];
        },
        /**
         * Binds the texture of the framebuffer
         * @param index the index to bind the texture to
         */
        bindTexture(index=0){
            this.drawTexture.bind(index);
        },

        bindAttachmentTextures(){
            for(let i = 0; i < this.numAttachments;++i){
                this.attachmentTextures[i].bind(i);
            }
        },

        /**
         * Resizes the drawing texture of the FBO
         * @param w {Number} The new width for the texture. Defaults to window width
         * @param h {Number} The new height for the texture. Defaults to window height
         */
        resize(w=window.innerWidth,h=window.innerHeight){
            this.drawTexture.resize(w,h);
        },
        /**
         * Helper function for unbinding the currently bound
         * texture.
         */
        unbindTexture(){
            gl.bindTexture(gl.TEXTURE_2D,null);
        }
    }
}