
attribute vec2 position;
varying vec2 vUv;
const vec2 scale = vec2(0.5,0.5);
void main(){
    //vUv = position.xy;
    vUv = position.xy * scale + scale;
    //vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position,0.0,1.0);
}