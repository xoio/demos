#version 300 es
/**
This is a generalized texture pass-thru vertex shader for the purposes
of using a texture.
*/

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;
in vec4 color;

out vec4 vColor;
out vec3 vPosition;
out vec2 vUv;

void main(){
    vUv = uv;
    vPosition = position;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}