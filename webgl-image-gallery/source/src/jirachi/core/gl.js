import {logWarn} from '../utils'
import {range,randFloat,randInt,clamp} from '../math/core'

/**
 * This is meant to provide some convinience functions on top of a
 * WebGLContext object
 * @param width width for the canvas
 * @param height height for the canvas.
 * @constructor
 */
var RendererFormat = function(width,height){
    this.viewportX = 0;
    this.viewportY = 0;
    this.clear_color = [0,0,0,1];
    this.width = width;
    this.height = height;
}

RendererFormat.prototype = {
    /**
     * Appends the canvas to the DOM.
     * @param {node} el the element you want to append to. By default will append to body
     */
    attachToScreen(el=document.body){
        el.appendChild(this.canvas);
        return this;
    },

    // alias for the above function
    anchorToScreen(el=document.body){
        this.attachToScreen(el);
    },

    /**
     * Shorthand for enabling blending.
     */
    enableBlending(){
        this.enable(this.BLEND);
    },

    /**
     * Shorthand for setting the current blend function.
     * @param funcName1 {String} the mode for the src pixel
     * @param funcName2 {String} mode for the destination pixel
     */
    setBlendFunction(funcName1,funcName2){
        this.blendFunc(this[funcName1],this[funcName2]);
    },

    /**
     * Enables alpha blending
     */
    enableAlphaBlending(){
        this.enable(this.BLEND);
        this.setBlendFunction("SRC_ALPHA","ONE");
    },

    testAdditive(){
        this.enable(this.BLEND);
        this.blendFunc(this.ONE,this.ONE);
    },
    /**
     * Enables additive blending.
     * Note - that it assumes depth testing is already turned off.
     */
    enableAdditiveBlending(){
        this.enable(this.BLEND);
        this.blendEquationSeparate( this.FUNC_ADD, this.FUNC_ADD );
        this.blendFuncSeparate( this.ONE, this.ONE, this.ONE, this.ONE );

    },

    /**
     * Sets the size of the gl canvas
     * @param width {Number} Width that the canvas should be. Defaults to entire window
     * @param height { Number} Height that the canvas should be. Defaults to window.innerHeight
     * @returns {RendererFormat}
     */
    setSize(width=window.innerWidth,height=window.innerHeight){
        this.canvas.width = width;
        this.canvas.height = height;
        return this;
    },

    /**
     * Sets the blend function so that multiple textures can get overlaid
     * on top of each other.
     */
    blendLayers(){
        this.setBlendFunction("ONE","ONE_MINUS_SRC_ALPHA");
    },

    /**
     * Shorthand for disabling blending.
     */
    disableBlending(){
        this.disable(this.BLEND);
    },

    /**
     * Enables an attribute to become instanced.
     * @param attributeLoc the attribute location of the attribute you want to be instanced.
     * @param divisor The divisor setting for that attribute. It is 1 by default which should fit most
     * use cases.
     */
    enableInstancedAttribute(attributeLoc,divisor=1){

        if(!this.isWebGL2){
            if(this.hasOwnProperty("ANGLE_instanced_arrays")){
                let ext = this.ANGLE_instanced_arrays;
                ext.vertexAttribDivisorANGLE(attributeLoc,divisor);
            }else{
                console.warn("Current GPU does not support the ANGLE_instance_arrays extension");
            }
        }else{
            this.vertexAttribDivisor(attributeLoc,divisor);
        }

        return this;
    },

    /**
     * Disables an attribute to become instanced.
     * @param attributeLoc the attribute location of the attribute you want to be instanced.
     */
    disableInstancedAttribute(attributeLoc){

        if(!this.isWebGL2){
            if(this.hasOwnProperty("ANGLE_instance_arrays")){
                let ext = this.ANGLE_instanced_arrays;
                ext.vertexAttribDivisorANGLE(attributeLoc,0);
            }else{
                console.warn("Current GPU does not support the ANGLE_instance_arrays extension");
            }
        }else{
            this.vertexAttribDivisor(attributeLoc,0);
        }
    },
    /**
     * Runs the drawArraysInstanced command of the context. If the context is
     * webgl 1, it attempts to try and use the extension, if webgl 2, it runs the
     * regular command.
     * @param mode A GLenum specifying the type primitive to render, ie GL_TRIANGLE, etc..:
     * @param first {Number} a number specifying the starting index in the array of vector points.
     * @param count {Number} a number specifying the number of vertices
     * @param primcount {Number} a number specifying the number of instances to draw
     */
    drawInstancedArrays(mode,first,count,primcount){
        if(!this.isWebGL2){
            if(this.hasOwnProperty("ANGLE_instanced_arrays")){
                this.ANGLE_instanced_arrays.drawArraysInstancedANGLE(mode,first,count,primcount);
            }else{
                console.error("Unable to draw instanced geometry - extension is not available");
            }
        }else{
            this.drawArraysInstanced(mode,first,count,primcount);
        }
    },


    /**
     * Drawing function to use for instanced items that have indices
     * @param mode {Number} the drawing mode, gl.TRIANGLES, etc..
     * @param numElements {Number} the number of element to draw(aka the number of indices)
     * @param numInstances {Number} the number of instances of the object to draw
     * @param type {Number} the data type of the index data, defaults to gl.UNSIGNED_SHORT
     * @param offset {Number} A GLintptr specifying an offset in the element array buffer. Must be a valid multiple of the size of the given type.
     */
    drawInstancedElements(mode,numElements,numInstances,{type=UNSIGNED_SHORT,offset=0}={}){
        if(!this.isWebGL2){
            if(this.hasOwnProperty("ANGLE_instanced_arrays")){
                this.ANGLE_instanced_arrays.drawElementsInstancedANGLE(mode,numElements,type,offset,numInstances)
            }else{
                console.error("Unable to draw instanced geometry - extension is not available");
            }
        }else{
            this.drawElementsInstanced(mode,numElements,type,offset,numInstances);
        }

    },

    /**
     * Sets the context to be full screen.
     * @param {function} customResizeCallback specify an optional callback to deal with what happens
     * when the screen resizes.
     * @returns {RendererFormat}
     */
    setFullscreen(customResizeCallback=null){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        //set the viewport size
        this.setViewport();

        if(customResizeCallback){
            window.addEventListener("resize",customResizeCallback);
        }else {
            window.addEventListener("resize",() => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.setViewport();
            });
        }
        return this;
    },

    /**
     * Helper function for clearing the screen, clear with a clear color,
     * set the viewport and clear the depth and color buffer bits
     * @param {number} r the value for the red channel of the clear color.
     * @param {number} g the value for the green channel of the clear color.
     * @param {number} b the value for the blue channel of the clear color.
     * @param {number} a the value for the alpha channel
     */
    clearScreen(r=0,g=0,b=0,a=1){
        this.clearColor(r,g,b,a);
        this.viewport(this.viewportX,this.viewportY, this.canvas.width,this.canvas.height);
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this;
    },

    /**
     * This clears all currently bound textures
     */
    clearTextures(){
        this.bindTexture(this.TEXTURE_2D,null);
    },

    /**
     * Useful when overlaying FBOs,
     * clears the buffer with a transparent overlay
     */
    clearTransparent(r=0,g=0,b=0,a=0){
        this.clearColor(r,g,b,a);
        this.viewport(this.viewportX,this.viewportY, this.canvas.width,this.canvas.height);
        this.clear(this.COLOR_BUFFER_BIT);
        return this;
    },
    /**
     * Resets the current clear color.
     * @param {number} r the value for the red channel of the clear color.
     * @param {number} g the value for the green channel of the clear color.
     * @param {number} b the value for the blue channel of the clear color.
     * @param {number} a the value for the alpha channel
     */
    setClearColor(r=0,g=0,b=0,a=1){
        this.clearColor(r,g,b,a);
    },

    /**
     * Enable depth testing
     */
    enableDepth(){
        this.enable(this.DEPTH_TEST);
        return this;
    },

    /**
     * Disables Depth testing
     */
    disableDepth(){
        this.disable(this.DEPTH_TEST);
    },

    /**
     * Returns the maximum texture size that the current card
     * supports.
     */
    getMaxTextureSize(){
        return this.getParameter(this.gl.MAX_TEXTURE_SIZE);
    },

    /**
     * Sets the viewport for the context
     * @param {number} x the x coordinate for the viewport
     * @param {number} y the y coordinate for the viewport
     * @param {number} width the width for the viewport
     * @param {number} height the height for the viewport
     */
    setViewport(x=0,y=0,width=window.innerWidth,height=window.innerHeight){
        this.viewport(x,y,width,height);
    },


    /**
     * Saves some typing when applying general camera uniforms.
     * @param shader {Object} shader object to use that was created with src/core/shader.js
     * @param camera {Object} camera object to use that was created with src/framework/Camera or any other kind of object
     * that consists of projection and view keys.
     * @param projection {String} name of the projection matrix uniform
     * @param view {String} name of the view matrix uniform
     */
    applyCameraUniforms(shader,camera,{
        projection="projection",
        view="view"
    }={}){

        shader.set4x4Uniform(projection,camera.projection);
        shader.set4x4Uniform(view,camera.view);

    }
}




/**
 * Enables some extensions that are commonly used in WebGL 1.
 * @param gl {WebGLRenderingContext} a WebGL 1 context
 * @returns {{}}
 */
export function getExtensions(gl){
    let exts = {};

    // common extensions we might want
    const extensions = [
        "OES_texture_float",
        "OES_vertex_array_object",
        "ANGLE_instanced_arrays",
        "OES_texture_half_float",
        "OES_texture_float_linear",
        "OES_texture_half_float_linear",
        "WEBGL_color_buffer_float",
        "EXT_color_buffer_half_float",
        "OES_standard_derivatives",
        "WEBGL_draw_buffers",
        "WEBGL_depth_texture"
    ];

    extensions.forEach(name => {
        // try getting the extension
        let ext = gl.getExtension(name);

        // if debugging is active, show warning message for any missing extensions
        if(ext === null){
            logWarn(`Unable to get extension ${name}, things might look weird or just plain fail`);
        }
        exts[name] = ext;
    });

    return exts;
}

/**
 * Creates a WebGLRendering context
 * @param node {DOMNode} an optional node to build the context from. If nothing is provided, we generate a canvas
 * @param options {Object} any options for the context
 * @param webgl1 {Boolean} boolean value to indicate that we intentionally want to create a WebGL1 context
 * @returns {*} the resulting WebGLRenderingContext
 */
export function createContext(node=null,options={},webgl1=false){
    let el = node !== null ? node : document.createElement("canvas");
    let isWebGL2 = false;
    let defaults = {
        alpha:true,
        antialias:true,
        depth: true
    };

    // override any defaults if set
    for(var i in defaults){
        if(options.hasOwnProperty(i)){
            defaults[i] = options[i];
        }
    }

    for(var i in options){
        defaults[i] = options[i];
    }

    options = defaults;


    // the possible context flags, try for webgl 2 first.
    let types = [];
    if(!webgl1){
        types = [
            "webgl2",
            "experimental-webgl2",
            "webgl",
            "experimental-webgl"
        ];
    }else{
        types = [
            "webgl",
            "experimental-webgl"
        ];
    }

    // loop through trying different context settings.
    var ctx = types.map(type => {
        var tCtx = el.getContext(type,options);
        if(tCtx !== null){
            if(type === "webgl2" || type === "experimental-webgl2"){
                isWebGL2 = true;
            }
            return tCtx;
        }
    }).filter(val => {
        if(val !== undefined){
            return val;
        }
    });



    // make sure to note that this is a webgl 2 context
    if(isWebGL2){
        window.hasWebGL2 = true;
    }else{
        window.hasWebGL2 = false;
    }

    ctx[0]["isWebGL2"] = isWebGL2;
    // just return 1 context
    return ctx[0];
}

/**
 * Sets up some WebGL constant values on top of the
 * window object for ease of use so you don't have to always have a
 * context object handy.
 * @param gl {WebGLRenderingContext} a WebGLRenderingContext
 */
export function setupConstants(gl){
    var constants = {
        "FLOAT":gl.FLOAT,
        "UNSIGNED_BYTE":gl.UNSIGNED_BYTE,
        "UNSIGNED_SHORT":gl.UNSIGNED_SHORT,
        "ARRAY_BUFFER":gl.ARRAY_BUFFER,
        "ELEMENT_BUFFER":gl.ELEMENT_ARRAY_BUFFER,
        "RGBA":gl.RGBA,
        "RGB":gl.RGB,
        "RGBA16F":gl.RGBA16F,
        "TEXTURE_2D":gl.TEXTURE_2D,
        "STATIC_DRAW":gl.STATIC_DRAW,
        "DYNAMIC_DRAW":gl.DYNAMIC_DRAW,
        "TRIANGLES":gl.TRIANGLES,
        "TRIANGLE_STRIP":gl.TRIANGLE_STRIP,
        "POINTS":gl.POINTS,
        "FRAMEBUFFER":gl.FRAMEBUFFER,
        "COLOR_ATTACHMENT0":gl.COLOR_ATTACHMENT0,
        // texture related
        "CLAMP_TO_EDGE":gl.CLAMP_TO_EDGE,
        "LINEAR":gl.LINEAR,
        "NEAREST":gl.NEAREST,
        "MAG_FILTER":gl.TEXTURE_MAG_FILTER,
        "MIN_FILTER":gl.TEXTURE_MIN_FILTER,
        "WRAP_S":gl.TEXTURE_WRAP_S,
        "WRAP_T":gl.TEXTURE_WRAP_T,
        "TEXTURE0":gl.TEXTURE0,
        "TEXTURE1":gl.TEXTURE1,
        "TEXTURE2":gl.TEXTURE2,

        // uniform related
        "UNIFORM_BUFFER":gl.UNIFORM_BUFFER,

        // simplify some math related stuff
        "PI":3.14149,
        "M_PI":3.14149, // same but Cinder alternative var
        "M_2_PI":3.14149 * 3.14149, // same but also from Cinder in case I accidentally ever get the two mixed up
        "2_PI": 3.14149 * 3.14149,
        "sin":Math.sin,
        "cos":Math.cos,
        "tan":Math.tan,
        "random":Math.random,
        "randFloat":randFloat,
        "randInt":randInt,
        "clamp":clamp,
        "range":range
    };

    /**
     * WebGL 2 contexts directly support certain constants
     * that were previously only available via extensions.
     * Add those here.
     *
     * Your context must have a "isWebGL2" property in order for this to get
     * triggered.
     *
     * TODO at some point, should look and see if there might be native way to differentiate between ES 2.0 and 3.0 contexts
     */
    if(gl instanceof WebGL2RenderingContext){

        // add more color attachment constants
        constants["COLOR_ATTACHMENT1"] = gl.COLOR_ATTACHMENT1;
        constants["COLOR_ATTACHMENT2"] = gl.COLOR_ATTACHMENT2;
        constants["COLOR_ATTACHMENT3"] = gl.COLOR_ATTACHMENT3;
        constants["COLOR_ATTACHMENT4"] = gl.COLOR_ATTACHMENT4;
        constants["COLOR_ATTACHMENT5"] = gl.COLOR_ATTACHMENT5;
    }

    if(!window.GL_CONSTANTS_SET){
        for(var i in constants){
            window[i] = constants[i];
        }
        window.GL_CONSTANTS_SET = true;
    }
}
//================= MAIN FUNCTION ==================== //

/**
 * Builds the WebGLRendering context
 * @param canvas {DomElement} an optional canvas, if you'd rather use one already in the DOM
 * @param ctxOptions {Object} options for the context
 * @param getCommonExtensions {Bool} include the common extensions for doing neat things in WebGL 1
 */
export function createRenderer({canvas=null,webgl1=false,ctxOptions={},getCommonExtensions=true,width=300,height=150}={}){
    let gl = createContext(canvas,ctxOptions,webgl1);
    var format = new RendererFormat(width,height);
    let ext = null;

    //setup constants
    setupConstants(gl);

    // assign some convenience functions onto the gl context
    var newProps = Object.assign(gl.__proto__,format.__proto__);
    gl.__proto__ = newProps;

    // need to do this too to get props created in constructor.
    Object.assign(gl,format);

    // if the width and height of the canvas settings are something other than the default,
    // set the new width and height.
    if(gl.width !== 300 || gl.height !== 150){
        gl.canvas.width = gl.width;
        gl.canvas.height = gl.height;
    }

    /**
     * Fetch common extensions if we're not on WebGl 2 and
     * getCommonExtensions is true
     */
    if(getCommonExtensions){
        if(!gl.isWebGL2){
            ext = getExtensions(gl);
            // loop through and assign extensions onto the context as well
            for(var i in ext){
                gl[i] = ext[i];
            }
        }
    }

    return gl;
}

