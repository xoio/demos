uniform vec2 resolution;
uniform sampler2D inputTexture;
out vec4 glFragColor;
void main(){
    vec3 refractiveIndex = vec3(1.0, 1.015, 1.03);
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 normalizedTexCoord = vec2(2.0, 2.0) * uv - vec2(1.0, 1.0);    // [0, 1] -> [-1, 1]
    vec3 texVec = vec3(normalizedTexCoord, 1.0);
    vec3 normalVec = vec3(0.0, 0.0, -1.0);
    vec3 redRefractionVec = refract(texVec, normalVec, refractiveIndex.r);
    vec3 greenRefractionVec = refract(texVec, normalVec, refractiveIndex.g);
    vec3 blueRefractionVec = refract(texVec, normalVec, refractiveIndex.b);
    vec2 redTexCoord = ((redRefractionVec / redRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
    vec2 greenTexCoord = ((greenRefractionVec / greenRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
    vec2 blueTexCoord = ((blueRefractionVec / blueRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);

    glFragColor = vec4
    (
        texture(inputTexture, redTexCoord).r,
        texture(inputTexture, greenTexCoord).g,
        texture(inputTexture, blueTexCoord).b,
        1.0
    );
}