#version 300 es
precision highp float;

// port of https://github.com/mattdesl/gl-vignette-background

uniform float aspect;
uniform vec2 scale;
uniform vec2 offset;
uniform bool coloredNoise;
uniform vec2 smoothing;
uniform float noiseAlpha;
uniform vec3 color1;
uniform vec3 color2;
uniform vec2 resolution;

out vec4 glFragColor;

highp float random(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
    // with conditionals, may be worth benchmarking
    // return vec3(
    //     base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
    //     base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
    //     base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
    // );
}

void main(){
    vec2 pos = gl_FragCoord.xy / resolution.xy;
    pos -= 0.5;

    pos.x *= aspect;
   	pos /= scale;
    pos -= offset;

   	float dist = length(pos);
   	dist = smoothstep(smoothing.x, smoothing.y, 1.-dist);

	vec4 color = vec4(1.0);
	color.rgb = mix(color2, color1, dist);

	if (noiseAlpha > 0.0) {
		vec3 noise = coloredNoise ? vec3(random(pos * 1.5), random(pos * 2.5), random(pos)) : vec3(random(pos));
		color.rgb = mix(color.rgb, blendOverlay(color.rgb, noise), noiseAlpha);
	}
    glFragColor = color;
}