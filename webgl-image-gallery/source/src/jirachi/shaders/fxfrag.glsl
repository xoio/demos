precision highp float;

uniform sampler2D simTex;
varying vec2 uv;

void main(){

    vec4 data = texture2D(simTex,uv);
    gl_FragColor = vec4(1.);
}