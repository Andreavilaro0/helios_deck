// Day/night Earth surface — Blinn-Phong specular on oceans
export const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv          = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos    = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const EARTH_FRAG = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform vec3 sunDir;
  uniform vec3 camPos;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(sunDir);
    vec3 V = normalize(camPos - vWorldPos);
    vec3 H = normalize(L + V);

    float NdotL = dot(N, L);

    // Smooth terminator transition
    float dayMix   = smoothstep(-0.08, 0.22, NdotL);
    float nightMix = 1.0 - smoothstep(-0.15, 0.05, NdotL);

    // Day: Lambert diffuse + tiny fill light
    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 dayLit   = dayColor * (max(NdotL, 0.0) * 0.88 + 0.06) * dayMix;

    // Ocean specular highlight (Blinn-Phong)
    float specMask = texture2D(specMap, vUv).r;
    float specVal  = pow(max(dot(N, H), 0.0), 48.0) * specMask * 0.55;
    vec3  specGlow = vec3(1.0, 0.97, 0.88) * specVal * dayMix;

    // Night city lights — emissive in shadow
    vec3 nightColor = texture2D(nightMap, vUv).rgb;
    vec3 nightGlow  = nightColor * nightMix * 1.7;

    gl_FragColor = vec4(dayLit + specGlow + nightGlow, 1.0);
  }
`;

// Outer atmospheric halo — rendered BackSide
export const ATMOS_VERT = /* glsl */ `
  varying vec3 vViewNormal;

  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ATMOS_FRAG = /* glsl */ `
  varying vec3 vViewNormal;

  void main() {
    float rim  = 1.0 - max(dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim        = pow(rim, 3.8);
    vec3 color = mix(vec3(0.07, 0.38, 1.00), vec3(0.00, 0.62, 0.88), rim * 0.45);
    gl_FragColor = vec4(color, rim * 0.78);
  }
`;
