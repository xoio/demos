precision highp float;

uniform sampler2D inputTexture;
varying vec2 vUv;

void main(){
    vec4 tex = texture2D(inputTexture,vUv);
    //glfragColor = vec4(1.0,0.0,0.0,1.0);
    gl_FragColor = vec4(tex.xyz,1.0);
}