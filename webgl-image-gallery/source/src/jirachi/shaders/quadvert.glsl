
attribute vec3 position;
varying vec2 uv;
const vec2 scale = vec2(0.5,0.5);
void main(){
    uv = position.xy;

    //uv = position.xy * scale + scale;
    gl_Position = vec4(position,1.0);
}