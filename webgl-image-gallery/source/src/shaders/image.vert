uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position;
in vec3 ppos;
in vec2 uv;
out vec2 vUv;
void main(){
    vec3 pos = position + ppos;

    vUv = uv;

    gl_Position = projectionMatrix * viewMatrix * vec4(pos,1.);
}
