precision highp float;

#ifdef USE_TEXTURE
    uniform sampler2D debugTex;
#endif
varying vec2 uv;
void main(){
  #ifdef USE_TEXTURE
     vec4 dat = texture2D(debugTex,uv);
     gl_FragColor = dat;
  #else
     gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  #endif
}