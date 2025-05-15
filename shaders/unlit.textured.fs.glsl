precision mediump float;
uniform sampler2D uTexture;
uniform float uAlpha;
varying vec2 vTexcoords;

void main(void) {
    vec4 color = texture2D(uTexture, vTexcoords);
    gl_FragColor = vec4(color.rgb, uAlpha); // Use uAlpha as per Todo #9
}