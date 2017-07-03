import {logError} from '../utils'

/**
 * Function to conditionally load shaders depending on the type of WebGL context.
 * @param gl {WebGLRenderingContext}
 * @param shaders {Object} map of shaders to correspond with each type of context.
 * @returns {*}
 */
export function loadContextConditionalShader(gl,shaders){
    if(gl instanceof WebGLRenderingContext){
        return shaders.webgl1;
    }else{
        return shaders.webgl2;
    }
}

/**
 * Compiles either a fragment or vertex shader
 * @param gl a webgl context
 * @param type the type of shader. Should be either gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
 * @param source the source (as a string) for the shader
 * @returns {*} returns the compiled shader
 */
export function compileShader(gl,type,source){
    let shader = gl.createShader(type);
    let shaderTypeName = ""

    // get the string name of the type of shader we're trying to compile.
    if(type === gl.FRAGMENT_SHADER){
        shaderTypeName = "FRAGMENT"
    }else{
        shaderTypeName = "VERTEX";
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        logError(`Error in ${shaderTypeName} shader compilation - ` + gl.getShaderInfoLog(shader),true);
        return false;
    } else {
        return shader;
    }
}

/**
 * The main function for creating a shader. Shader also manages figuring out
 * attribute and uniform location indices.
 *
 * @param gl a webgl context
 * @param vertex the source for the vertex shader
 * @param fragment the source for the fragment shader
 * @param {Object} transformFeedback an object containing two keys
 * 1. varyings - an array with strings of the varyings variables in the GLSL needed for transform feedback
 * 2. mode - a WebGL constant specifying the type of transform feedback attributes being used, should either be
 * gl.SEPERATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS
 * @returns {*} returns the WebGLProgram compiled from the two shaders
 */
export function makeShader(gl,vertex,fragment,transformFeedback=null){
    let vShader = compileShader(gl,gl.VERTEX_SHADER,vertex);
    let fShader = compileShader(gl,gl.FRAGMENT_SHADER,fragment);

    if(vShader !== false && fShader !== false){
        let program = gl.createProgram();
        gl.attachShader(program,vShader);
        gl.attachShader(program,fShader);


        // if we're using transform feedback and have WebGL2
        if(gl.isWebGL2){
            if(transformFeedback !== null){
                gl.transformFeedbackVaryings(program,transformFeedback.varyings,transformFeedback.mode)
            }
        }

        gl.linkProgram(program);

        // TODO is this really necesary?
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);

        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
            logError("Could not initialize WebGLProgram");
            throw ("Couldn't link shader program - " + gl.getProgramInfoLog(program));
            return false;
        }else{
            return program;
        }
    }
}

// ==================== MAIN FUNCTION ====================== //

/**
 * A function to quickly setup a WebGL shader program.
 * Modeled a bit after thi.ng
 * @param gl {WebGLRenderingContext} the WebGL context to use
 * @param spec {Object} a object containing the out line of what the shader would look like.
 * @returns {*} and JS object with the shader information along with some helpful functions
 */
export function createShader(gl=null,spec,transformFeedback=null){
    let uniforms = {};
    let attributes = {};
    let precision = spec.precision !== undefined ? spec.precision : "highp";
    let version = spec.version !== undefined ? spec.version : "#version 300 es \n"

    if(gl === null){
        console.error("createShader requires a WebGL context");
        return false;
    }

    if(!spec.hasOwnProperty("vertex") || !spec.hasOwnProperty("fragment")){
        logError("spec does not contain vertex and/or fragment shader",true);
        return false;
    }

    // if either of the shader sources are arrays, join source files together into one
    // source. This assumes that the variables in the array refer to source strings and not other objects.


    // ============== PROCESS VERTEX ==================== //
    if(spec.vertex instanceof Array){
        // by default, prepend version 300 es for WebGL 2.
        if(gl instanceof WebGL2RenderingContext){
            spec.vertex.unshift(version)
        }else if (gl instanceof WebGLRenderingContext){
            spec.vertex.unshift("#version 120 es");
        }

        spec.vertex = spec.vertex.join("");
    }else {

        // prepend version number for WebGL2
        if(gl instanceof WebGL2RenderingContext){
            spec.vertex = version + spec.vertex;
        }
    }

    // =============== PROCESS FRAGMENT ================= //

    if(spec.fragment instanceof Array){
        // prepend precision
        spec.fragment.unshift(`precision ${precision} float;`)

        // by default, prepend version 300 es for WebGL 2.
        if(gl instanceof WebGL2RenderingContext){
            spec.fragment.unshift(version)
        }else if(gl instanceof WebGLRenderingContext){
            spec.fragment.unshift("#version 120 es \n");
        }

        spec.fragment =  spec.fragment.join("")
    }else{
        if(gl instanceof WebGL2RenderingContext){
            spec.fragment = version + `\n precision ${precision} float; \n` + spec.fragment;
        }


    }

    // build the shader
    let shader = makeShader(gl,spec.vertex,spec.fragment,transformFeedback);


    // set uniforms and their locations (plus default values if specified)
    if(spec.hasOwnProperty('uniforms')){

        if(spec.uniforms instanceof Object && (!spec.uniforms instanceof Array)){

            for(var i in spec.uniforms){
                let itemVal = spec.uniforms[i]

                let loc = gl.getUniformLocation(shader,i);
                uniforms[i] = {};
                uniforms[i].loc= loc;
                uniforms[i].function = itemVal[0];
                uniforms[i].value = itemVal[1];
            }
        }else if(spec.uniforms instanceof Array){
           /**
            * Look through the shader and pre-fetch any uniform location values.
            * If the value is a string, just fetch the location.
            *
            * If the value happens to be an object, try setting the default value,
            * or if the item is an object with the key "buffer", fetch the uniform block index instead.
            *
            * TODO enable setting of default values.
            * @type {Array}
            *
            *
            */

           spec.uniforms.map((value) => {

               if (typeof value === 'string') {

                   let loc = gl.getUniformLocation(shader, value);
                   if(loc !== null){
                       uniforms[value] = loc;
                   }
               } else if (typeof value === 'object') {
                   let loc = null;

                   /**
                    * Handle UBOs
                    */
                   if(value.hasOwnProperty("buffer")){
                       try{
                           loc = gl.getUniformBlockIndex(shader,value.name);
                       }catch(e){
                           logError("Attempt to get UBO location when UBOs are not yet supported by your computer",true);
                       }

                   }else{
                       loc = gl.getUniformLocation(shader,value.name);
                   }

                   // store uniform location under it's shader name
                   uniforms[value.name] = loc;

               }

           });


       }

    }

    /**
     * Arranges all of the attribute data into neat containers
     * to allow for easy processing by a VAO.
     * Attributes should be specified as arrays
     * @deprecated
     */
    if(spec.hasOwnProperty('attributes')){
        let attribs = spec.attributes.map((value) => {

            attributes[value[0]] = {
                size:value[1],
                name:value[0]
            };

            // if a desired uniform location is set ,
            // make sure to reflect that in the information
            if(value[2] !== undefined){
                attributes[value[0]].location = value[2];
            }
        });
    }

    return {
        gl:gl,
        program:shader,
        uniforms:uniforms,
        attributes:attributes,
        /**
         * Binds the shader for use. You can optionally pass in a object containing
         * the projection and view/modelView matrices and specify the specific uniform names
         * which default to projection and modelViewMatrix. You can also pass in an object for "camera" created
         * by the functions in framework/camera.js
         * @param camera an object containing the projection and view/modelView matrices for the shader
         * @param projection the uniform name for the projection matrix
         * @param view the uniform name for the view/modelView matrix
         */
        bind({camera=null,projection="projectionMatrix",view="modelViewMatrix"}={}){
            this.gl.useProgram(this.program);
            if(camera !== null){
                this.set4x4Uniform(projection,camera.projection);
                this.set4x4Uniform(view,camera.view);
            }
        },

        /**
         * Sets a matrix uniform for a 4x4 matrix
         * @deprecated prepare to remove and switch to something more descriptive for a 4x4 matrix
         * @param name the name of the uniform whose value you want to set.
         */
        setMatrixUniform(name,value){
            this.gl.uniformMatrix4fv(this.uniforms[name],false,value);
        },

        /**
         * Sets a mat4 uniform in a shader
         * @param name the name of the uniform
         * @param value the value for the uniform
         * // TODO fix this and other functions to better handle objects and default settings.
         */
        set4x4Uniform(name,value){
            let uniform =  this.uniforms[name];

            this.gl.uniformMatrix4fv(this.uniforms[name],false,value);
        },

        /**
         * Sets a mat3 uniform in a shader
         * @param name  the name of the uniform
         * @param value the value of the uniform
         */
        set3x3Uniform(name,value){
            let uniform =  this.uniforms[name];
            if(uniform instanceof Object){
                this.gl.uniformMatrix3fv(uniform.loc,false,value);
            }else{
                this.gl.uniformMatrix3fv(this.uniforms[name],false,value);
            }
        },
        /**
         * Sets the uniform value for a texture.
         * @param value
         */
        setTextureUniform(name,value){
            this.gl.uniform1i(this.uniforms[name],value);
        },

        /**
         * Returns the uniform location of a shader's uniform
         * @param name  the name of the location you want
         * @returns {*}
         */
        getUniform(name){
            return this.uniforms[name];
        },

        /**
         * sets a vec2 uniform
         * @param name
         * @param value
         */
        setVec2(name,v1,v2){
            this.gl.uniform2f(this.uniforms[name],v1,v2);
        },

        /**
         * Sets a vec3 uniform
         * @param name
         * @param value
         */
        setVec3(name,value){
            this.gl.uniform3fv(this.uniforms[name],value);
        },

        setBooleanUniform(name,value){
            this.gl.uniform1i(this.uniforms[name],value);
        },
        /**
         * General purpose function which sends a uniform to the currently bound shader. Attempts to derive
         * the correct uniform function to use. Should be good for most situations, but still needs work :p
         * @param name {String} name of the uniform
         * @param value {*} the value to send to the uniform
         */
        uniform(name,value){

            /**
             *  "if" statement to properly figure out what uniform function to use.
             *  Assumes all matrix and vector values are in the forms of an Array object.
             *  Currently no great way to differentiate between integers and floating point values
             *  when it comes to non array values.
             *
             *  Currently works with
             *  - 4x4 matrices
             *  - 3x3 matrices
             *  - vec2 arrays represented by a array with just two values
             *  - vec3 arrays represented by an array with just 3 values
             */
            if(value.length !== undefined && value.length === 16){
                this.set4x4Uniform(name,value);
            } else if(value.length !== undefined && value.length === 3){
                this.gl.uniform3fv(this.uniforms[name],value);
            }else if(value.length !== undefined && value.length ===2) {
                this.setVec2(name,value[0],value[1]);
            }else if(value.length !== undefined && value.length ===3){
                this.setVec3(name,value);
            }else{
                this.gl.uniform1f(this.uniforms[name],value);
            }

        }

    }
}

