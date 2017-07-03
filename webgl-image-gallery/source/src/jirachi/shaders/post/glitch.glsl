precision highp float;

/**
    This is a direct port from Three.js / Felix Turner's port
*/

uniform sampler2D tex0;
uniform sampler2D tDisp; // displacement texture for squares
uniform float amount;
uniform float angle;
uniform float seed;
uniform float seed_x;
uniform float seed_y;
uniform float distortion_x;
uniform float distortion_y;
uniform float col_s;
uniform float byp;
varying vec2 uv;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
	if(byp < 1.0){
	vec2 p = uv;
    	float xs = floor(gl_FragCoord.x / 0.5);
    	float ys = floor(gl_FragCoord.y / 0.5);
    	//based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    	vec4 normal = texture2D (tDisp, p*seed*seed);
    	if(p.y < distortion_x + col_s && p.y > distortion_x - col_s * seed) {
    	    if(seed_x>0.){
    	    	p.y = 1. - (p.y + distortion_y);
    	    }
    	    else {
    	    	p.y = distortion_y;
    	    }
    	}
    	if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {
    		if(seed_y>0.){
    			p.x=distortion_x;
    		}
    		else {
    			p.x = 1. - (p.x + distortion_x);
    		}
    	}
    	p.x+=normal.x*seed_x*(seed/5.);
    	p.y+=normal.y*seed_y*(seed/5.);

    	//base from RGB shift shader
    	vec2 offset = amount * vec2( cos(angle), sin(angle));
    	vec4 cr = texture2D(tex0, p + offset);
    	vec4 cga = texture2D(tex0, p);
    	vec4 cb = texture2D(tex0, p - offset);
    	gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    	//add noise
    	vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);
    	gl_FragColor = gl_FragColor+ snow;
	}else{
	    gl_FragColor = texture2D(tex0, uv);
	}

}