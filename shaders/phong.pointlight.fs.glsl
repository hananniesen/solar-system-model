precision mediump float;
uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;
varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // Calculate light direction
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    
    // Diffuse
    vec3 normal = normalize(vWorldNormal);
    float lambertDot = max(dot(normal, lightDir), 0.0);
    vec3 texColor = texture2D(uTexture, vTexcoords).rgb;
    vec3 diffuse = texColor * lambertDot;

    // Attenuation
    float distance = length(uLightPosition - vWorldPosition);
    float kc = 1.0;
    float kl = 0.5;
    float kq = 0.05;
    float attenuation = 1.0;

    // Combine
    vec3 diffuseColor = vec3(1, 1, 1);
    vec3 finalColor = (diffuse * diffuseColor) * attenuation;
    
    gl_FragColor = vec4(finalColor, 1.0);
}