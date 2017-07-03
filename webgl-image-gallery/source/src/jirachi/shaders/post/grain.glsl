uniform mat4 tDiffuse;
uniform float timem;
uniform float nIntensity;
uniform float sIntensity;
uniform float sCount;
uniform bool grayscale;
uniform sampler2D inputTexture;
uniform float time;
in vec2 vUv;
out vec4 glFragColor;

// adapted from Three.js shader
// https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FilmShader.js
void main(){
    vec4 cTextureScreen = texture( inputTexture, vUv );
	// make some noise
	float dx = rand( vUv + time );

	// add noise
	vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );

	// get us a sine and cosine
	vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );

	cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );
	cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );

	glFragColor = vec4(cResult,cTextureScreen.a);

}