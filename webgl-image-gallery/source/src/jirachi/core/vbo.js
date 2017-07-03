/**
 * Simple function to create a VBO aka buffer
 * @param gl a WebGLRendering context
 * @param data the information for the buffer. If it's a regular array, it'll be turned into a TypedArray
 * @param indexed the type this buffer should be. By default, it's an ARRAY_BUFFER, pass in true for indexed if you're holding indices
 * @param usage the usage for the buffer. by default it's STATIC_DRAW
 */
export function createVBO(gl,{data=null,indexed=false,usage="STATIC_DRAW"}={}){
    let buffer = null;

    // set the buffer type
    let bufferType = "ARRAY_BUFFER";
    if(indexed === true){
        bufferType = "ELEMENT_ARRAY_BUFFER";
    }
    let name = bufferType;
    bufferType = gl[bufferType];

    // set the usage
    usage = gl[usage];
    buffer = gl.createBuffer();


    let obj = {
        gl:gl,
        buffer:buffer,
        bufferTypeName:name,
        type:bufferType,
        usage:usage,

        raw(){
            return this.buffer;
        },
        /**
         * Updates the buffer with new information
         * @param data a array of some kind containing your new data
         */
        updateBuffer(data){
            if(data instanceof Array){
                if(this.bufferTypeName === "ARRAY_BUFFER"){
                    data = new Float32Array(data);
                }else{
                    data = new Uint16Array(data);
                }
            }
            this.bind();
            this.gl.bufferSubData(this.type,0,data);
            this.unbind();
        },

        /**
         * Alternate function to fill buffer with data
         * @param data
         * @param usage {Int} the usage pattern for the buffer. IE gl.STATIC_DRAW or gl.DYNAMIC_DRAW
         */
        fill(data,usage){
            usage = usage !== undefined ? usage : this.gl.STATIC_DRAW;
            if(data instanceof Array){
                if(this.bufferTypeName === "ARRAY_BUFFER"){
                    data = new Float32Array(data);

                }else{
                    data = new Uint16Array(data);
                }
            }
            this.bind();
            this.gl.bufferData(this.type,data,usage);
            this.unbind();
            this.data = data;
        },

        /**
         * Sets data onto the vbo.
         * @param data the data for the vbo. Can either be a regular array or a typed array.
         * If a regular array is used, will determine buffer type based on the settings.
         */
        bufferData(data){
            if(data instanceof Array){
                if(this.bufferTypeName === "ARRAY_BUFFER"){
                    data = new Float32Array(data);
                }else{
                    data = new Uint16Array(data);
                }
            }
            this.gl.bufferData(this.type,data,usage);
            this.data = data;
        },

        bind(){
            this.gl.bindBuffer(this.type,this.buffer);
        },

        unbind(){
            this.gl.bindBuffer(this.type,null);
        }
    };


    // build out data if passed in as part of the options object
    if(data !== null){
        obj.bind();
        obj.bufferData(data);
        obj.unbind();
    }

    return obj;
}