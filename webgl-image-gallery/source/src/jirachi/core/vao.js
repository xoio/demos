/**
 * Creates a VertexAttributeObject aka VAO
 * @param gl a webgl context
 * @param useNative flag for whether or not to use native VAOs (which uses an extension for now)
 */
export function createVAO(gl,useNative=true){
    let vao = null;
    let ext = null;
    // TODO support cards that don't have this extension later
    if(useNative){
       if(gl instanceof WebGL2RenderingContext){
           vao = gl.createVertexArray();
       }else{
           if(gl.hasOwnProperty('OES_vertex_array_object')){
               ext = gl['OES_vertex_array_object'];
               vao = ext.createVertexArrayOES();
           }else{
               ext = gl.getExtension('OES_vertex_array_object');
               vao = ext.createVertexArrayOES();
           }
       }
    }

    return {
        gl:gl,
        vao:vao,
        ext:ext,
        attributes:{},

        /**
         * Helper function to allow an attribute to become instanced.
         * For the time being until WebGL 2 is standardized, this is currently enabled as an
         * extension.
         * @param attribute {String} the name of the attribute to make instanced.
         * @returns {boolean} false if unable to utilize ANGLE_instanced_arrays.
         */
        makeInstancedAttribute(attribute){
            if(gl.vertexAttribDivisor === null || gl.vertexAttribDivisor === undefined){
                let ext = null;
                if(gl.hasOwnProperty('ANGLE_instanced_arrays')){
                    ext = gl.ANGLE_instanced_arrays;
                }else{
                    try {
                        ext = gl.getExtension('ANGLE_instanced_arrays');
                    }catch(e){
                        console.error("cannot utilize instanced attributes on this GPU");
                        return false;
                    }
                }

                ext.vertexAttribDivisorANGLE(this.getAttribute(attribute),1);
            }else{
                gl.vertexAttribDivisor(this.getAttribute(attribute),1);
            }
        },
        /**
         * Sets an attribute's location
         * @param shader {WebGLProgram} a WebGl shader program to associate with the attribute location
         * @param name {String} the name of the attribute
         * @param index {Number} an optional index. If null, will utilize the automatically assigned location
         * @returns {number} returns the location for the attribute
         */
        setAttributeLocation(shader,name,index=null){
            let loc = 0;
            let gl = this.gl;

            // if we don't assign an index, get the automatically generated one
            if(index === null || index === undefined){
                loc = gl.getAttribLocation(shader,name);
            }else{
                loc = gl.bindAttribLocation(shader,index,name);
            }
            return loc;
        },

        /**
         * Enable all of the attributes on a shader onto the VAO.
         * This will automatically set the attribute location to the order in which the
         * attribute was set in the shader settings, but will override that decision if the location index is
         * set in the attribute.
         *
         * @param shader a plane JS object that contains 3 things
         * 1. A WebGLProgram on the key "shader"
         * 2. an array at the key "attributes" that contains the name of all of the attributes we're looking for
         * as well as the size of each attribute.
         */
        enableAttributes(shader){
            let gl = this.gl;
            let attribs = shader.attributes;
            for(let a in attribs){
                let attrib = attribs[a];
                let attribLoc = this.attributes.length;

                // if the attribute has a location parameter, use that to set the attribute location,
                // otherwise use the next index in the attributes array
                if(attrib.hasOwnProperty('location')){
                    attribLoc = attrib.location;
                }

                this.addAttribute(shader,attrib.name,attrib.size,attribLoc)

            }
            return this;
        },

        /**
         * Adds an attribute for the VAO to keep track of
         * @param shader {WebGLProgram} the shader that the attribute is a part of. Takes a WebGLProgram but also accepts a plain object created by the
         * {@link createShader} function
         * @param name {String} the name of the attribute to add/enable
         * @param size {Number} optional - the number of items that compose the attribute. For example, for something like, position, you might have xyz components, thus, 3 would be the size
         * @param location {Number} optional - the number to use as the attribute location. If it's not specified, will simply use it's index in the attributes object
         * @param setData {Boolean} optional - flag for whether or not to immediately run setData on the attribute. TODO enable by default
         * @param dataOptions {Object} optional - any options you might want to add when calling setData like an offset or stride value for the data
         * @returns {addAttribute}
         */
        addAttribute(shader,name,{size=3,location,dataOptions={}}={}){
            let attribLoc = this.attributes.length;
            let webglProg = null;

            if(shader instanceof WebGLProgram){
                webglProg = shader;
            }else{
                webglProg = shader.program;
            }

            // if location is undefined, just set attribute location
            // to be the next index in the attribute set.
            if(location === undefined){
                attribLoc = location;
            }

            let attribLocation = this.setAttributeLocation(webglProg,name,attribLoc);

            this.attributes[name] = {
                loc:attribLocation,
                enabled:true,
                size:size
            }
            //enable the attribute
            this.enableAttribute(name);

            // if we want to just go ahead and set the data , run that
            this.setData(name,dataOptions);
            return this;
        },

        /**
         * Returns the location of the specified attribute
         * @param name {String} the name of the attribute.
         * @returns {*|number}
         */
        getAttribute(name){
            return this.attributes[name].loc
        },

        /**
         * Alias for vertexAttribPointer function. Useful when the vao is not a part of
         * a larger mesh. Should function exactly  like the normal function but makes some
         * assumptions to help you type less.
         * @param idx {Number} the index to point to
         * @param size {Number} the number of items that make up the vertex (will often times either be 3 or 4)
         * @param type {Number} the type of value it is. It is by default assumed to be a Floating point number
         * @param normalized {Boolean} is the content normalized?
         * @param stride {Number} The stride of the value within the buffer
         * @param offset {Number} The number of places the value is offset in the buffer.
         */
        vertexAttribPointer(idx,{
            size=3,
            type=FLOAT,
            normalized=false,
            stride=0,
            offset=0
        }={}){

            this.gl.vertexAttribPointer(idx,size,type,normalized,stride,offset);
        },

        /**
         * Enables a vertex attribute
         * @param name {String} the name of the attribute you want to enable
         */
        enableAttribute(name){
            // enable vertex attribute at the location
            if(typeof name === "number"){

                this.gl.enableVertexAttribArray(name);
            }else{
                this.gl.enableVertexAttribArray(this.attributes[name].loc);
            }
        },

        /**
         * Disables a vertex attribute
         * @param name {String} the name of the vertex attribute to disable
         */
        disableAttribute(name){
            if(typeof name === "number"){
                this.gl.disableVertexAttribArray(name);
            }else{
                this.gl.disableVertexAttribArray(this.attributes[name].loc);
            }
        },

        /**
         * Shorthand for calling gl.vertexAttribPointer. Essentially sets the data into the vao for the
         * currently bound buffer. Some settings are assumed, adjust as necessary
         * @param name {String} the name of the attribute to pass data to in the shader
         * @param options {Object} options for utilizing that information
         */
        setData:function(name,{
			type=gl.FLOAT,
		    normalized=gl.FALSE,
		    stride=0,
		    offset=0
        }={}){
            let loc = this.attributes[name].loc;
            let size = this.attributes[name].size;


            let pointerOptions = {
                type:type,
                //type:gl.SHORT,
                normalized:normalized,
                stride:stride,
                offset:offset
            };

            gl.vertexAttribPointer(loc,size,pointerOptions.type,pointerOptions.normalized,pointerOptions.stride,pointerOptions.offset);
        },

        /**
         * Binds the vao
         */
        bind(){
            if(gl instanceof WebGL2RenderingContext){
                this.gl.bindVertexArray(this.vao);
            }else{
                ext.bindVertexArrayOES(this.vao);
            }
        },

        /**
         * Unbinds the vao
         */

        unbind(){
            if(gl instanceof WebGL2RenderingContext){
                this.gl.bindVertexArray(null);
            }else{
                ext.bindVertexArrayOES(null);
            }
        }
    }

}