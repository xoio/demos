Post processing
====

These two files contain what could be a potential post-processing pipeline.
Includes a glitch and a bloom effect.

Usage
=====
```
var bloom = new BloomPass(gl);
var glitch = new GlitchPass(gl);
var composer = new Composer(gl,fbo.drawTexture,bloom,glitch);

// in loop 
    composer.run();
    composer.getOutput().bindTexture();
    drawQuad.draw()
    composer.getOutput().unbindTexture();
```