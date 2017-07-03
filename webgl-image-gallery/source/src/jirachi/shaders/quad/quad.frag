precision highp float;

uniform sampler2D inputTexture;
in vec2 vUv;
out vec4 glfragColor;


void main(){
    vec4 tex = texture(inputTexture,vUv);
    //glfragColor = vec4(1.0,0.0,0.0,1.0);
    //glfragColor = vec4(tex.xyz,1.);
    glfragColor = tex;
}