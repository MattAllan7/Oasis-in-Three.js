// grass.frag

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D noiseTexture;
uniform vec3 directionalDirection;
uniform vec3 directionalColor;
uniform float directionalIntensity;
uniform vec3 ambientColor;
uniform float ambientIntensity;

varying vec2 vWorldXZ;
varying vec3 vNormal;

void main() {
  float noiseScale = 0.01; // zoom out. 
  vec2 noiseUV = vWorldXZ * noiseScale;

  // Sample the value of the noise texture
  float noiseValue = texture2D(noiseTexture, noiseUV).r;

  // Mix between two greens based on the noise value
  vec3 darkGreen   = vec3(0.2706, 0.4549, 0.2706);
  vec3 brightGreen = vec3(0.4471, 0.4784, 0.2745);
  vec3 color = mix(darkGreen, brightGreen, noiseValue);


  // Get lighting changes
  float diff = abs(dot(vNormal, normalize(directionalDirection)));
  vec3 lighting = (ambientColor * ambientIntensity) + (directionalColor * directionalIntensity * diff);
  lighting = clamp(lighting, 0.0, 1.0);


  // Apply color
  gl_FragColor = vec4(color * lighting, 1.0);
}