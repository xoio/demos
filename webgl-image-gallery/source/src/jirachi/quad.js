import quadvert from './shaders/quad/quadvert.glsl'
import quadfrag from './shaders/debug/quadfrag.glsl'
import {createShader} from './core/shader'
import {createVAO} from './core/vao'
import {createVBO} from './core/vbo'

// default quad shaders for drawing vignette background
import qvert from './shaders/quad/bgvert.glsl'
import qfrag from './shaders/quad/bgfrag.glsl'

export function createDrawQuad(gl,{
    vertex=null,
    fragment=null,
    uniforms=[]
}={}){
    const vao = createVAO(gl);
    const vbo = createVBO(gl);

    let vertices = [
        -1, -1, -1, 4, 4, -1
    ];

    if(vertex === null && fragment === null){
        vertex = qvert;
        fragment = qfrag;
    }

    // default uniforms
    let defaults = [
        'projectionMatrix',
        'viewMatrix',
        'modelViewMatrix',
        'resolution'
    ];

    let shader = createShader(gl,{
        vertex:vertex,
        fragment:fragment,
        uniforms:[
            ...defaults,
            ...uniforms
        ]
    });

    // bind attributes

    vao.bind();
    vbo.bind();


    vbo.bufferData(vertices);
    vao.addAttribute(shader,'position',{
        size:2
    });
    vbo.unbind()
    vao.unbind();

    return {
        draw(cb=null){
            shader.bind();
            vao.bind();

            if(cb !== null){
                cb(shader);
            }

            gl.drawArrays(gl.TRIANGLES,0,3);
            vao.unbind();
        }
    }
}


/**
 * Function used to build a multi-purpose full screen quad.
 * @deprecated
 * @param gl {WebGLRenderingContext}
 * @param withTexture {boolean} a boolean value indicating whether or not you're trying to create a rendering quad. If you are, pass in true and instead of a color
 * things will get set up to draw a texture instead.
 * @param fragmentShader {String} optional fragment shader, primarily used for ping-ponging data between textures.
 * @returns {{vao: ({gl, vao, ext, attributes, setAttributeLocation, enableAttributes, addAttribute, getAttribute, enableAttribute, disableAttribute, setData, point, bind, unbind}|*), shader: ({gl, program, uniforms, attributes, bind, setMatrixUniform, setTextureUniform, uniform}|*), buffer: *, hasTexture: boolean, gl: *, draw: draw}}
 */
export function createQuad(gl,{withTexture = false, fragmentShader=false,uniforms=[],vertexShader=false}={}){
    let frag = quadfrag;
    let vertex = quadvert;
    let defaultUniforms = [
        'debugTex'
    ];
    let vertices = [
        1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];

    let vao = createVAO(gl);
    vao.bind();

    // if uniform map is not empty, merge with default map
    if(uniforms.length > 0){
        uniforms.forEach((obj)=>{
            defaultUniforms.push(obj);
        });
    }

    // if we don't have our own fragment shader, make sure to inject
    // the texture define statement if we need to support a texture.
    if(!fragmentShader){
        if(withTexture){
            frag = "#define USE_TEXTURE\n" + quadfrag
        }
    }else{
        frag = fragmentShader;
    }

    // if we aren't using the default vertex shader
    if(vertexShader){
        vertex = vertexShader;
    }

    let shader = createShader(gl,{
        vertex:vertex,
        fragment:frag,
        attributes:[
            ['position', 3]
        ],
        uniforms:uniforms
    });
    // buffer data onto the buffer
    let buffer = createVBO(gl);

    // enable attributes
    buffer.bind();
    buffer.bufferData(vertices)
    vao.addAttribute(shader,'position')
    vao.setData('position');
    buffer.unbind();
    vao.unbind();


    return {
        vao:vao,
        shader:shader,
        buffer:buffer,
        type:"quad",
        hasTexture:withTexture,
        gl:gl,
        drawWithCallback(cb){
            this.vao.bind();
            this.shader.bind();

            this.vao.enableAttribute('position')
            cb(shader)

            this.gl.drawArrays(TRIANGLE_STRIP,0,4);
            this.vao.disableAttribute('position')
            this.vao.unbind();
        },
        draw(textureUnit=0){

            this.vao.bind();
            this.shader.bind();

            this.vao.enableAttribute('position')

            // if we need to supply a texture, set the uniform.
            // this assumes texture has already been bound.
            if(this.hasTexture){
                this.shader.setTextureUniform('debugTex',textureUnit);
            }

            this.gl.drawArrays(TRIANGLE_STRIP,0,4);
            this.vao.disableAttribute('position')
            this.vao.unbind();
        }
    }
}


/**
 * Takes a Quad object made with `createQuad` and draws it
 * @param quad
 */
export function drawQuad(quad,textureMap=[]){
    let vao = quad.vao;
    let gl = quad.gl;

    this.shader.bind();
    vao.bind();

    // if a texture map is specified(just a array of objects with the name
    // of the texture uniform and it's bound index), send those to the shader
    if(textureMap.length > 0){
        textureMap.map((mapItem) => {
            gl.uniform1i(mapItem.name,mapItem.value);
        });
    }

    // draw the quad
    gl.drawArrays(TRIANGLE_STRIP,0,4);
    vao.unbind();
}