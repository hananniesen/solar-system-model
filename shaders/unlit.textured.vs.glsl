precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTexcoords;
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vTexcoords; // Declare varying for interpolation

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vTexcoords = aTexcoords; // Pass texture coordinates to fragment shader
}