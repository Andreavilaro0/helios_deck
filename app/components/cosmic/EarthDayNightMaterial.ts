import * as THREE from "three";

// Sun direction — left-side illumination, matches CenterStage directional light position [-4, 2.5, 4]
export const SUN_DIR = new THREE.Vector3(-4, 2.5, 4).normalize();

interface DayNightParams {
  dayTexture: THREE.Texture;
  nightTexture: THREE.Texture;
  terminatorWidth?: number;
}

export function createEarthDayNightMaterial({
  dayTexture,
  nightTexture,
  terminatorWidth = 0.06,
}: DayNightParams): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayTexture:      { value: dayTexture },
      uNightTexture:    { value: nightTexture },
      uSunDirection:    { value: SUN_DIR.clone() },
      uTerminatorWidth: { value: terminatorWidth },
      uKp:              { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec2 vUv;

      void main() {
        vec3 n = normalize(normal);
        vUv = vec2(
          atan(n.z, n.x) / (2.0 * 3.14159265359) + 0.5,
          acos(clamp(n.y, -1.0, 1.0)) / 3.14159265359
        );
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayTexture;
      uniform sampler2D uNightTexture;
      uniform vec3      uSunDirection;
      uniform float     uTerminatorWidth;
      uniform float     uKp;

      varying vec3 vNormalW;
      varying vec2 vUv;

      void main() {
        vec3 dayTex   = texture2D(uDayTexture,   vUv).rgb;
        vec3 nightTex = texture2D(uNightTexture, vUv).rgb;

        vec3  N     = normalize(vNormalW);
        vec3  L     = normalize(uSunDirection);
        float ndotl = dot(N, L);
        float lit   = clamp(ndotl, 0.0, 1.0);

        float dayMask   = smoothstep(-uTerminatorWidth, uTerminatorWidth, ndotl);
        float nightMask = 1.0 - dayMask;

        // Day: texture with richer sun lighting
        vec3 litDay = dayTex * (0.06 + lit * 1.12);

        // Night: warm city lights
        vec3 cityGlow = nightTex * 2.8;

        // Terminator scatter — richer orange-amber band
        float termEdge = exp(-(ndotl * ndotl) / 0.015);
        vec3  scatter  = vec3(0.90, 0.38, 0.06) * termEdge * 0.35;

        // Aurora: polar caps on night side, scales with Kp
        float latAbs   = abs(N.y);
        float aurZone  = smoothstep(0.70, 0.96, latAbs) * nightMask;
        float kpAurora = clamp((uKp - 1.0) / 8.0, 0.0, 1.0);
        vec3  aurora   = vec3(0.03, 0.65, 0.20) * aurZone * kpAurora * 0.90;

        // Kp storm tint on night side
        float kpNorm   = clamp(uKp / 9.0, 0.0, 1.0);
        vec3 stormTint = vec3(0.14, 0.02, 0.10) * kpNorm * kpNorm * nightMask;

        vec3 color = litDay * dayMask + cityGlow * nightMask + scatter + aurora + stormTint;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

// Fresnel atmospheric rim glow — thicker and more visible
export function createFresnelMaterial(rimColor: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      color1:        { value: rimColor },
      color2:        { value: new THREE.Color(0x000000) },
      fresnelBias:   { value: 0.08 },
      fresnelScale:  { value: 1.3 },
      fresnelPower:  { value: 3.5 },
    },
    vertexShader: `
      uniform float fresnelBias;
      uniform float fresnelScale;
      uniform float fresnelPower;
      varying float vReflectionFactor;
      void main() {
        vec4 mvPosition    = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec3 worldNormal   = normalize(mat3(
          modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz
        ) * normal);
        vec3 I = worldPosition.xyz - cameraPosition;
        vReflectionFactor = fresnelBias + fresnelScale *
          pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying float vReflectionFactor;
      void main() {
        float f = clamp(vReflectionFactor, 0.0, 1.0);
        gl_FragColor = vec4(mix(color2, color1, vec3(f)), f * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
}

export function fresnelRimColor(kp: number): THREE.Color {
  if (kp >= 5) return new THREE.Color(0xff3050);
  if (kp >= 4) return new THREE.Color(0xffa030);
  return new THREE.Color(0x1a9fff);
}
