precision highp float;
uniform float sample_offset;
uniform sampler2D tex0;
const float attenuation = 0.0323;
varying vec2 uv;
void main(){
     vec3 sum = vec3( 0.0, 0.0, 0.0 );
      vec4 texDat = texture2D( tex0, uv );

     sum += texture2D( tex0, uv + -10.0 * sample_offset ).rgb * 0.009167927656011385;
     sum += texture2D( tex0, uv +  -9.0 * sample_offset ).rgb * 0.014053461291849008;
     sum += texture2D( tex0, uv +  -8.0 * sample_offset ).rgb * 0.020595286319257878;
     sum += texture2D( tex0, uv +  -7.0 * sample_offset ).rgb * 0.028855245532226279;
     sum += texture2D( tex0, uv +  -6.0 * sample_offset ).rgb * 0.038650411513543079;
     sum += texture2D( tex0, uv +  -5.0 * sample_offset ).rgb * 0.049494378859311142;
     sum += texture2D( tex0, uv +  -4.0 * sample_offset ).rgb * 0.060594058578763078;
     sum += texture2D( tex0, uv +  -3.0 * sample_offset ).rgb * 0.070921288047096992;
     sum += texture2D( tex0, uv +  -2.0 * sample_offset ).rgb * 0.079358891804948081;
     sum += texture2D( tex0, uv +  -1.0 * sample_offset ).rgb * 0.084895951965930902;
     sum += texture2D( tex0, uv +   0.0 * sample_offset ).rgb * 0.086826196862124602;
     sum += texture2D( tex0, uv +  +1.0 * sample_offset ).rgb * 0.084895951965930902;
     sum += texture2D( tex0, uv +  +2.0 * sample_offset ).rgb * 0.079358891804948081;
     sum += texture2D( tex0, uv +  +3.0 * sample_offset ).rgb * 0.070921288047096992;
     sum += texture2D( tex0, uv +  +4.0 * sample_offset ).rgb * 0.060594058578763078;
     sum += texture2D( tex0, uv +  +5.0 * sample_offset ).rgb * 0.049494378859311142;
     sum += texture2D( tex0, uv +  +6.0 * sample_offset ).rgb * 0.038650411513543079;
     sum += texture2D( tex0, uv +  +7.0 * sample_offset ).rgb * 0.028855245532226279;
     sum += texture2D( tex0, uv +  +8.0 * sample_offset ).rgb * 0.020595286319257878;
     sum += texture2D( tex0, uv +  +9.0 * sample_offset ).rgb * 0.014053461291849008;
     sum += texture2D( tex0, uv + +10.0 * sample_offset ).rgb * 0.009167927656011385;

    // gl_FragColor = vec4(texDat.xyz,1.0);
     gl_FragColor = vec4(attenuation * sum * 100.0,1.0);
}