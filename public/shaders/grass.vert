// grass.vert

uniform float time; // For sway

varying vec2 vWorldXZ; // For fragment
varying vec3 vNormal;

void main() {	
  // Sway
  vec3 pos = position;

  // sin and time for back-and-forth sway. 
  // instanceMatrix[3] stores the instance's world position, so adding it offsets each blade of grass' sway.  
  // 0.3 is the amount or strength of the sway. 
  float swayAmount = pos.y * sin(time + instanceMatrix[3].x) * 0.2;
  pos.x += swayAmount;


  // For fragment shader to determine color. 
  vWorldXZ = vec2(instanceMatrix[3].x, instanceMatrix[3].z);


  mat3 instanceRot = mat3(instanceMatrix);
  vNormal = normalize(instanceRot * vec3(0.0, 0.0, 1.0));


  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
}
