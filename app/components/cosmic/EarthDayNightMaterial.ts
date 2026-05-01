import * as THREE from "three";

interface Params {
  dayTexture: THREE.Texture;
  nightTexture?: THREE.Texture;
  shininess?: number;
  terminatorWidth?: number;
}

/**
 * GLSL shader material that blends day/night Earth textures based on sun direction.
 * Adapted from Atlas26 (Abdul-Wasay-008/Atlas26) — MIT License.
 * uSunDirection must be updated each frame to match the sun position in world space.
 */
export function createEarthDayNightMaterial({
  dayTexture,
  nightTexture,
  shininess = 25,
  terminatorWidth = 0.04,
}: Params): THREE.ShaderMaterial {
  const nightTex = nightTexture ?? dayTexture;

  return new THREE.ShaderMaterial({
    uniforms: {
      uDayTexture: { value: dayTexture },
      uNightTexture: { value: nightTex },
      uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      uTerminatorWidth: { value: terminatorWidth },
      uShininess: { value: shininess },
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec2 vUv;

      void main() {
        vec3 n = normalize(normal);
        vUv = vec2(
          atan(n.z, n.x) / (2.0 * 3.14159265359) + 0.5,
          acos(n.y) / 3.14159265359
        );
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayTexture;
      uniform sampler2D uNightTexture;
      uniform vec3 uSunDirection;
      uniform float uTerminatorWidth;

      varying vec3 vNormalW;
      varying vec2 vUv;

      void main() {
        vec3 dayTex   = texture2D(uDayTexture,   vUv).rgb;
        vec3 nightTex = texture2D(uNightTexture, vUv).rgb;

        vec3  N    = normalize(vNormalW);
        vec3  L    = normalize(uSunDirection);
        float ndotl = dot(N, L);
        float lit   = clamp(ndotl, 0.0, 1.0);

        float dayMask   = smoothstep(0.0, uTerminatorWidth, lit);
        float nightMask = 1.0 - dayMask;

        vec3 litDay  = dayTex   * (0.12 + lit * 1.0) * dayMask;
        vec3 city    = nightTex * 1.4 * nightMask;

        gl_FragColor = vec4(litDay + city, 1.0);
      }
    `,
  });
}
