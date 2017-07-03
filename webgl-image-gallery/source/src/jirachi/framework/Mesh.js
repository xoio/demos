import {createVBO} from '../core/vbo'
import {createVAO} from '../core/vao'
import mat4 from '../math/mat4'
import mat3 from '../math/mat3'
import vec3 from '../math/vec3'
import {toRadians} from '../math/core'
import {createShader} from '../core/shader'
import {defaultUniforms} from '../core/uniforms'
import {flattenArray} from '../math/core'
/**
 * A basic representation of an on screen object.
 * Provides abstracted methods of adding attributes and underlying data as well as
 * provides helper functions for matrix transformations of the model matrix.
 */
class Mesh {
    constructor(gl,{
        vertex="",
        fragment="",
        uniforms=[],
        mode=""
    }={}){

        // Vertex Attribute Object for storing mesh properties.
        this.vao = createVAO(gl);

        // store reference to gl context
        this.gl = gl;

        // model matrix for the mesh
        this.model = mat4.create();

        // model view matrix for the mesh
        this.modelView = mat4.create();

        // the current xyz rotation
        this.rotation = {
            x:0,
            y:0,
            z:0
        };

        // the currently stored attributes for the mesh
        this.attributes = {};

        // the number of vertices for the mesh.
        this.numVertices = 3;

        // mat4 for normal matrix
        this.normalMatrix = mat3.create();

        // set the mode for the mesh - by default it's triangles
        this.mode = mode !== "" ? mode : gl.TRIANGLES;

        // for instanced drawing make sure at least 1 instance is set.
        this.setNumInstances();

        // setup the rotation vector.
        this.rotateAxis = vec3.create();
        vec3.set(this.rotateAxis,this.rotation.x,this.rotation.y,this.rotation.z);

        // setup scale vector
        this.scaleSize = vec3.create();

        // setup position vector
        this.position = vec3.create();

        /**
         * If vertex and fragment attributes are set,  build the shader.
         */
        if(vertex !== "" && fragment !== ""){
            this.setShader({
                vertex:vertex,
                fragment:fragment,
                uniforms:uniforms
            });
        }
    }


    /**
     * Sets the shader for the mesh
     * @param vertex {String} the source for the vertex shader.
     * @param fragment {String} the source for the fragment shader.
     * @param uniforms {Array} array of uniform strings to store locations for.
     *
     * Note that vertex and fragment shader parameters can be an array, in which case, the source is joined together
     * in one complete string before building shader.
     */
    setShader({vertex="",fragment="",uniforms=[]}={}){
        let gl = this.gl;
;
        if(vertex !== "" && fragment !== ""){
            let defaults = defaultUniforms();

            let combinedUniforms = [
                ...defaults,
                ...uniforms
            ];

            this.shader = createShader(this.gl,{
                vertex:vertex,
                fragment:fragment,
                uniforms:combinedUniforms
            });

            this.shaderSet = true;
        }
    }

    /**
     * Adds an attribute to the mesh
     * @param name name of the attribute in the shader
     * @param data data of the attribute. Can be regular or TypedArray
     * @param dataSize the size of each component for the attribute. It's assumed that
     * each component falls in line with the normal xyz schema so it's set to 3.
     * @returns {Mesh}
     */
    addAttribute(name,data,size=3,dataOptions={}){
        if(this.shaderSet){

            let gl = this.gl;
            let buffer = createVBO(gl);

            // test to see if we need to unroll array
            if(data[0] instanceof Array){
                data = flattenArray(data,size);
            }

            this.vao.bind();
            buffer.bind();

            buffer.bufferData(data);
            this.vao.addAttribute(this.shader,name,{
                size:size,
                dataOptions:dataOptions
            });
            buffer.unbind();
            this.vao.unbind();

            this.attributes[name] = buffer;

            return this;
        }

    }

    /**
     * Adds an attribute in the form of a pre-built VBO
     * @param name the name of the attribute on the shader
     * @param buffer {Object} a VBO object created using createVBO
     * @returns {Mesh}
     */
    addAttributeBuffer(name,buffer){
        if(this.shaderSet){

            let gl = this.gl;
            this.vao.bind();
            buffer.bind();
            this.vao.addAttribute(this.shader,name,{
                size:size,
                dataOptions:dataOptions
            });
            buffer.unbind();
            this.vao.unbind();

            this.attributes[name] = buffer;

            return this;
        }
    }

    updateRawBuffer(name,buffer,{size=3,dataOptions}={}){
        let gl = this.gl;
        this.vao.bind();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        this.vao.addAttribute(this.shader,name,{
            size:size,
            dataOptions:dataOptions
        });
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        this.vao.unbind();
    }

    addInstancedAttributeBuffer(name,buffer,{size=3,dataOptions}={}){
        if(this.shaderSet){
            let gl = this.gl;
            if(buffer instanceof WebGLBuffer){

                this.vao.bind();
                gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
                this.vao.addAttribute(this.shader,name,{
                    size:size,
                    dataOptions:dataOptions
                });
                this.vao.makeInstancedAttribute(name);
                gl.bindBuffer(gl.ARRAY_BUFFER,null);
                this.vao.unbind();

                this.attributes[name] = buffer;

            }else{
                this.vao.bind();
                buffer.bind();
                this.vao.addAttribute(this.shader,name,{
                    size:size,
                    dataOptions:dataOptions
                });
                this.vao.makeInstancedAttribute(name);
                buffer.unbind();
                this.vao.unbind();

                this.attributes[name] = buffer;

            }


            return this;
        }
    }

    /**
     * Adds an attribute but also makes it instanced
     * @param name the name of the attribute
     * @param data data for the attribute
     * @returns {Mesh}
     */
    addInstancedAttribute(name,data,size=3,dataOptions={}){
        if(this.shaderSet){

            let gl = this.gl;
            let buffer = createVBO(gl);

            // ensure data is unrolled.
            if(data[0] instanceof Array){
                data = flattenArray(data,size);
            }

            this.vao.bind();
            buffer.bind();

            buffer.bufferData(data);
            this.vao.addAttribute(this.shader,name,{
                size:size,
                dataOptions:dataOptions
            });
            this.vao.makeInstancedAttribute(name);
            buffer.unbind();
            this.vao.unbind();

            this.attributes[name] = buffer;

            this.instanced = true;
            return this;
        }
    }

    /**
     * Updates data for an attribute
     * @param name {String} the name of the attribute
     * @param data {Array} the new dataset to use.
     */
    updateAttribute(name,data){
        let buffer = this.attributes[name];
        this.vao.bind();
        buffer.bind();
        buffer.updateBuffer(data);
        buffer.unbind();
        this.vao.unbind();
    }

    /**
     * Sets the number of vertices to utilize while drawing.
     * This is only for things where you are using gl.drawArrays and may mess things up
     * if you call this on a mesh with indices. This function operates under the assumption that the
     * value you pass in is the total number of items in your position(s) array and not the actual number of vertices.
     * This function divides by a divisor to figure that out
     *
     * @param num the total number of vertices in your mesh. Will divide by 3 automatically
     * as long as the value you input is greater than 10.
     *
     * Sets the numVertices attribute of the mesh which can be used in gl.drawArrays
     * @param divisor {Number} the number used to figure out how many vertices are in a mesh.
     */
    setNumVertices(num,divisor=3){
        if(!this.indicesSet){

            //TODO it feels like there has to be a better way of doing this and ensuring that we need to divide
            if(num > 10){
                num = num / divisor;
            }
            this.numVertices = num;
        }


        return num;
    }

    /**
     * Adds an indices buffer to the mesh. The number of elements to use while drawing is
     * automatically inferred by the data length
     *
     * @param data Data for the indices. Can be a regular or Typed array.
     * @returns {Mesh}
     */
    addIndices(data){
        if(this.shaderSet){
            let gl = this.gl;
            let buffer = createVBO(gl,{
                indexed:true
            });

            if(data[0] instanceof Array){
                data = flattenArray(data);
            }

            this.vao.bind();
            buffer.bind();
            buffer.bufferData(data);

            this.vao.unbind();
            buffer.unbind();
            this.indicesSet = true;
            this.numVertices = data.length;

            return this;
        }
    }

    /**
     * Sets the number of instances when using instanced attributes
     * @param num
     */
    setNumInstances(num=1){
        if(this.instanced){
            this.numInstances = num;
        }
    }

    /**
     * Draws the mesh;
     */
    draw(camera,cb){
        if(this.shaderSet){
            this.shader.bind();

            // update normal matrix
            this.calculateNormalMatrix(camera.view);

            // bind default uniforms
            this.shader.set4x4Uniform('projectionMatrix',camera.projection);
            this.shader.set4x4Uniform('modelViewMatrix',camera.view);
            this.shader.set3x3Uniform('normalMatrix',this.normalMatrix);

            this.shader.uniform("viewMatrix",camera.view);
            this.shader.uniform("view",camera.view);
            this.shader.uniform("modelMatrix",this.model);
            this.shader.uniform("model",this.model);

            // run callback so user can add any additional uniform values
            if(cb !== undefined){
                cb(this.shader);
            }

            // bind vao
            this.vao.bind();

            // if we've set indices, we need to call a different draw function
            if(this.indicesSet && !this.instanced){
                this.gl.drawElements(this.mode,this.numVertices,UNSIGNED_SHORT,0);
            }else if(!this.instanced){

                this.gl.drawArrays(this.mode,0,this.numVertices);
            }

            // if we have instanced attributes
            if(this.indicesSet && this.instanced){
                this.gl.drawInstancedElements(this.mode,this.numVertices,this.numInstances);
            }else if(this.instanced){
                // TODO add instanced drawings for arrays
            }

            // unbind vao
            this.vao.unbind();
        }
    }


    drawOrtho(camera,cb){
        if(this.shaderSet){
            this.shader.bind();

            // run callback so user can add any additional uniform values
            if(cb !== undefined){
                cb(this.shader);
            }

            // bind vao
            this.vao.bind();

            // if we've set indices, we need to call a different draw function
            if(this.indicesSet && !this.instanced){
                this.gl.drawElements(this.mode,this.numVertices,UNSIGNED_SHORT,0);
            }else if(!this.instanced){
                this.gl.drawArrays(this.mode,0,this.numVertices);
            }

            // if we have instanced attributes
            if(this.indicesSet && this.instanced){
                this.gl.drawInstancedElements(this.mode,this.numVertices,this.numInstances);
            }else if(this.instanced){

            }

            // unbind vao
            this.vao.unbind();
        }
    }

    update(){

    }



    translate(x=1,y=1,z=0){
        vec3.set(this.position,x,y,z);
        mat4.translate(this.model,this.model,this.position);
    }

    translateX(x){
        vec3.set(this.position,x,this.position[1],this.position[2]);
        mat4.translate(this.model,this.model,this.position);
    }

    translateY(y){
        vec3.set(this.position,this.position[0],y,this.position[2]);
        mat4.translate(this.model,this.model,this.position);
    }

    translateZ(z){
        vec3.set(this.position,this.position[0],this.position[1],z);

        mat4.translate(this.model,this.model,this.position);
    }

    /**
     * Scales the model matrix
     * @param x {Number} the amount for scaling along the x axis.
     * @param y {Number} the amount for scaling along the y axis.
     * @param z {Number} the amount for scaling along the z axis.
     * @returns {Mesh}
     */
    scaleModel(x=1,y=1,z=1){
        vec3.set(this.scaleSize,x,y,z);
        mat4.scale(this.model,this.model,this.scaleSize);
        return this;
    }

    /**
     * Rotate mesh along X axis
     * @param angle {Number} the angle to rotate by in degrees.
     * @returns {Mesh}
     */
    rotateX(angle){
        angle = toRadians(angle);
        mat4.rotateX(this.model,this.model,angle);
        return this;
    }

    /**
     * Rotate mesh along Y axis
     * @param angle {Number} the angle to rotate by in degrees
     * @returns {Mesh}
     */
    rotateY(angle){
        angle = toRadians(angle);
        mat4.rotateY(this.model,this.model,angle);
        return this;
    }

    rotateZ(angle){
        angle = toRadians(angle);
        mat4.rotateZ(this.model,this.model,angle);
        return this;
    }

    /**
     * Works the same as scaleModel, but scales model matrix by a vector.
     * @param v {Array} accepts a Array of 3 components specifying xyz scaling
     */
    scale(v){
        if(v instanceof Array && v.length < 4){
            mat4.scale(this.model,this.model,v);
            this.scaleSize.x = v[0];
            this.scaleSize.y = v[1];
            this.scaleSize.x = v[2];

        }

        return this;
    }

    /**
     * Calculates the normal matrix
     * @param viewMatrix {Array} the view matrix to utilize. Looking for Arrays created with
     * mat4.create but should be able to take regular Arrays with 16 items.
     *
     * Note that any adjustments to the model-view matrix made in the shader won't
     * be taken into account.
     *
     * @returns {mat3|*} the normal matrix for the given values.
     */
    calculateNormalMatrix(viewMatrix){
        let model = this.model;
        let normalMatrix = this.normalMatrix;
        let modelView = this.modelView;

        // reset matrices
        mat4.identity(modelView);
        mat3.identity(normalMatrix);

        // calculate model view matrix
        mat4.multiply(modelView,model,viewMatrix);

        // convert model view into mat3
        mat3.fromMat4(normalMatrix,modelView);

        // invert
        mat3.invert(normalMatrix,normalMatrix);

        // transpose
        mat3.transpose(normalMatrix,normalMatrix);

        this.normalMatrix = normalMatrix;

        return normalMatrix;
    }
}

export default Mesh;
