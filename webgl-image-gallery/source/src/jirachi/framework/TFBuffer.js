import {createVAO} from '../core/vao'
import {createVBO} from '../core/vbo'
import {createShader} from '../core/shader'

class TFBuffer {
    constructor(gl){
        this.gl = gl;

        // transform feedback object.
        this.tf = gl.createTransformFeedback();

        // vaos to bounce data back and forth on
        this.vaos = [createVAO(gl),createVAO(gl)]

        // the mode in which attributes are stored in the transform
        // feedback buffer
        this.mode = gl.SEPARATE_ATTRIBS;

        // varyings to keep track of
        this.varyings = [];

        // array of attributes to keep track og
        this.attributes = [];

        // this keeps track of the number of items to update.
        this.numItems = 100;

        // flag to help with switching
        this.flag = 0;
    }

    /**
     * Binds vao for use
     */
    bind(){
        this.vaos[this.flag].bind();
    }

    /**
     * Unbinds currently bound vao.
     */
    unbind(){
        this.vaos[this.flag].unbind();
    }

    /**
     * Adds an attribute to the stack of data to manipulate
     * @param data an array of data. Can be either regular array or Typed array
     * @param size the size of each vertex. 3 by default
     * @param name {String} optional - a name to reference a buffer by
     * @param datatype {Number} the format of the data you want to manipulate
     * @param normalized {Boolean} whether or not the data is normalized
     * @param stride {Number} the stride and how the data is laid out
     * @param offset {Number} the number of spaces between each bit of vertex data.
     */
    addAttribute(data,size=3,{name="",datatype=FLOAT,normalized=false,stride=0,offset=0}={}) {

        let gl = this.gl;
        let buffer = createVBO(gl);
        let buffer2 = createVBO(gl);
        buffer.fill(data);
        buffer2.fill(data);

        this.attributes.push({
            vbos: [buffer,buffer2],
            index: this.attributes.length,
            size: size,
            type: datatype,
            normalized: normalized,
            stride: stride,
            offset: offset,
            name: name
        });

        // bind data onto vao
        this._initialize();
    }

    /**
     * Initialize data onto vaos
     */
    _initialize(){
        let gl = this.gl;
        let len = this.attributes.length;
        let vaos = this.vaos;

        for(var i = 0; i < 2; ++i){

            vaos[i].bind();

            for(var i = 0; i < len; ++i){
                let attrib = this.attributes[i];

                attrib.vbos[i].bind();
                gl.vertexAttribPointer(i,attrib.size,attrib.type,attrib.normalized,attrib.stride,attrib.offset);
                gl.enableVertexAttribArray(i)
                attrib.vbos[i].unbind();
            }

        }

        // if it's in the for loop, vaos array becomes undefined for some reason.
        vaos[0].unbind()
        vaos[1].unbind()
    }


    setNumItems(num){
        this.numItems = num;
    }

    update(time=0.0,origin){

        let gl = this.gl;
        let src = this.flag;
        let dst = (this.flag + 1) % 2;

        // bind shader
        this.shader.bind();
        this.shader.uniform('uTime',time);

        this.vaos[src].bind();

        // bind attributes
        this._setupvertexAttribs();

        //gl.enableVertexAttribArray( 1 );
        //gl.bindBuffer(gl.ARRAY_BUFFER, origin.raw());
        //gl.vertexAttribPointer( 1, 4, gl.FLOAT, false, 16, 0 );
        //gl.bindBuffer(gl.ARRAY_BUFFER,null);
        //


        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf);

        // bind all the buffers to read data from transform feedback process
        this._bindBufferBase(dst);

        // discard fragment stage
        gl.enable(gl.RASTERIZER_DISCARD);


        // start transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.numItems);
        gl.endTransformFeedback();


        // unbind everything.
        this._unbindBufferBase();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        gl.disable(gl.RASTERIZER_DISCARD);
        this.vaos[src].unbind();
        this.flag =  (this.flag + 1) % 2;
    }

    /**
     * Sets the shader for the Transform Feedback process.
     * @param vertex {String} the source for the vertex shader
     * @param fragment {String} the source for the fragment shader
     * @param varyings {String or Array} optional - any varyings to add to the step
     * @returns {boolean}
     */
    setShader(vertex=null,varyings=null,uniforms=[]){
        if(vertex === null && fragment === null){
            console.warn("Transform Feedback buffer does not have shaders");
            return false;
        }

        let dUniforms = [
            'uTime'
        ];

        dUniforms = [...dUniforms,...uniforms];


        if(varyings !== null){
            this.addVarying(varyings);
        }

        let vertexShader = "";

        /**
         * If shader source is passed in as an array,
         * join the strings.
         */
        if(vertex instanceof Array){
            vertexShader = [...vertex].join("");
        }else{
            vertexShader = vertex;
        }

        // Note that transform feedback doesn't utilize a fragment shader so we have a passthru essentially
        // instead.
        this.shader = createShader(this.gl,{
            vertex:[
                "#version 300 es\n",
                vertexShader],
            fragment:[
                '#version 300 es\n',
                'precision highp float;',
                'out vec4 glFragColor;',
                'void main(){',
                'glFragColor = vec4(1.);',
                '}'
            ].join(""),
            uniforms:dUniforms
        },{
            varyings:this.varyings,
            mode:this.mode
        });

    }


    /**
     * Adds a varying to the varying stack.
     * @param varyings can be a string or an array of strings
     */
    addVarying(varyings){
        if(varyings instanceof Array){
            this.varyings = [...this.varyings,...varyings];
        }else{
            this.varyings.push(varyings);
        }
    }

    _setupvertexAttribs(){
        let gl = this.gl;
        let len = this.attributes.length;
        this.vaos[this.flag].bind();

        for(var i = 0; i < len; ++i){
            let attrib = this.attributes[i];
            let buffer = this.attributes[i].vbos[this.flag];

            buffer.bind();
            gl.vertexAttribPointer(i,attrib.size,attrib.type,attrib.normalized,attrib.stride,attrib.offset);
            gl.enableVertexAttribArray(i)
            buffer.unbind();
        }
    }
    _bindBufferBase(flag){
        let gl = this.gl;
        let len = this.attributes.length;
        for(var i = 0; i < len; ++i){
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i,this.attributes[i].vbos[flag].raw());
        }
    }

    _unbindBufferBase(){
        let gl = this.gl;
        let len = this.attributes.length;
        for(var i = 0; i < len; ++i){
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i,null);
        }
    }

}

export default TFBuffer;