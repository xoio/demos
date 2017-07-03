vec3 rotateX(vec3 p, float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x, p.y * c - p.z * s, p.z * c + p.y * s);
}

vec3 rotateY(vec3 p, float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x * c + p.z * s, p.y, p.z * c - p.x * s);
}

vec3 rotateZ(vec3 p, float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x * c - p.y * s, p.y * c + p.x * s, p.z);
}

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}