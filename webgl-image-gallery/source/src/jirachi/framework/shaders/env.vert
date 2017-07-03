
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
//uniform float waveFront;
//uniform float waveLength;
uniform float time;

attribute vec3 position;
attribute vec2 uvs;
attribute vec3 normals;
attribute vec3 centers;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vCenter;

const float PI = 3.141592657;
const vec3 startPosition = vec3(0.0,200.0,-1.0);
const float waveFront = 200.0 * 2.0 + 3.0;
const float waveLength = 1.0;

void main(){
  
    vec3 relativePos = position - centers;
    vec3 axis = cross(startPosition, normals);
    	float distToStartPoint = distance(centers, startPosition);
    	const float posOffset = 0.2;
    	float distNoise = snoise(position * posOffset + time);
    	distToStartPoint += distNoise * 0.5; 
    
    
    	float distToWaveFront = distance(distToStartPoint, waveFront);
    	float angle = 0.0;
    	if(distToWaveFront < waveLength) {
    		angle = (1.0 - exponentialOut(distToWaveFront/waveLength)) * PI;
    	}
    
    
    	relativePos = rotate(relativePos, axis, angle);
    
    	vec3 finalPosition = centers + relativePos;

    vNormal = normals;
    vCenter = centers;
    vUv = uvs;



    gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(finalPosition,1.);
}