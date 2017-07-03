
uniform sampler2D currentImage;
uniform sampler2D nextImage;
uniform sampler2D mixTexture;
uniform float threshold;
uniform float mixRatio;

uniform bool animateTransition;

in vec2 vUv;
out vec4 glFragColor;

void main(){

     // current texture to show
       vec4 currentTex = texture(currentImage,vUv);

       // next texture to show
       vec4 nextTex = texture(nextImage,vUv);


       // mixture texture.
       vec4 mixTex = texture(mixTexture,vUv);

       vec4 finalColor = vec4(0.);


        	float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
            float mixf=clamp((mixTex.r - r)*(1.0/threshold), 0.0, 1.0);
        if(animateTransition){
             finalColor = mix(currentTex,nextTex,mixf);
        }else{
            finalColor = currentTex;
        }


        glFragColor = finalColor;
}

/*

       if(animateTransition){
         	float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
         	float mixf=clamp((mixTex.r - r)*(1.0/threshold), 0.0, 1.0);
            if(animateDirection == 0.0){
                  finalColor = mix(currentTex,nextTex,mixf);
            }else{
                  finalColor = mix(currentTex,prevTex,mixf);
            }
       }else {
           finalColor = currentTex;
       }
       */