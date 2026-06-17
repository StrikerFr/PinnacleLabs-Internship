import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const earthVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFrag = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uSunDir;

  // hash + fbm
  float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){
    vec3 p=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(p+vec3(0,0,0)),hash(p+vec3(1,0,0)),f.x),
                   mix(hash(p+vec3(0,1,0)),hash(p+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(p+vec3(0,0,1)),hash(p+vec3(1,0,1)),f.x),
                   mix(hash(p+vec3(0,1,1)),hash(p+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.03; a*=0.5; }
    return v;
  }

  void main(){
    vec3 n = normalize(vNormal);
    vec3 sphereP = normalize(vPos);

    // Continents via fbm warped
    float continents = fbm(sphereP*1.8 + fbm(sphereP*3.0)*0.6);
    float landMask = smoothstep(0.52, 0.58, continents);

    // Ocean color (deep, desaturated)
    vec3 oceanDeep = vec3(0.012, 0.028, 0.055);
    vec3 oceanShallow = vec3(0.04, 0.09, 0.14);
    vec3 ocean = mix(oceanDeep, oceanShallow, smoothstep(0.45,0.55,continents));

    // Land colors — muted, NASA-like
    float detail = fbm(sphereP*8.0);
    vec3 landLow  = vec3(0.18, 0.16, 0.11);
    vec3 landMid  = vec3(0.10, 0.12, 0.07);
    vec3 landHigh = vec3(0.32, 0.28, 0.22);
    vec3 land = mix(landLow, landMid, smoothstep(0.3,0.7,detail));
    land = mix(land, landHigh, smoothstep(0.7,0.95,continents));

    // Ice caps near poles
    float lat = abs(sphereP.y);
    float ice = smoothstep(0.78, 0.92, lat);
    vec3 surface = mix(ocean, land, landMask);
    surface = mix(surface, vec3(0.85,0.88,0.92), ice * (0.5 + 0.5*landMask));

    // Day / night lighting
    float sunDot = dot(n, normalize(uSunDir));
    float day = smoothstep(-0.15, 0.35, sunDot);

    // Night side: city lights on land only (lower freq + softer threshold = less aliasing on zoom)
    float cityNoise = fbm(sphereP*22.0);
    float cities = smoothstep(0.58, 0.82, cityNoise) * landMask * (1.0 - day);
    vec3 cityGlow = vec3(1.0, 0.78, 0.42) * cities * 1.2;


    // Subtle terminator warmth
    float terminator = smoothstep(0.0, 0.25, sunDot) * (1.0 - smoothstep(0.25, 0.6, sunDot));
    vec3 warm = vec3(0.9, 0.45, 0.25) * terminator * 0.18;

    vec3 lit = surface * (0.04 + day * 1.05) + warm + cityGlow;

    // Rim / fresnel inner glow
    float fres = pow(1.0 - max(dot(n, vec3(0.0,0.0,1.0)), 0.0), 3.0);
    lit += vec3(0.25, 0.45, 0.85) * fres * 0.25 * day;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

export function Earth() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(1.0, 0.25, 0.4).normalize() },
    }),
    [],
  );

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const d = Math.min(dt, 0.05); // clamp big frame gaps (scroll jank)
    uniforms.uTime.value += d;
    mesh.current.rotation.y += d * 0.035;
  });


  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={earthVert}
        fragmentShader={earthFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const cloudFrag = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3 uSunDir;

  float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){
    vec3 p=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(p+vec3(0,0,0)),hash(p+vec3(1,0,0)),f.x),
                   mix(hash(p+vec3(0,1,0)),hash(p+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(p+vec3(0,0,1)),hash(p+vec3(1,0,1)),f.x),
                   mix(hash(p+vec3(0,1,1)),hash(p+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.07; a*=0.5; }
    return v;
  }

  void main(){
    vec3 sp = normalize(vPos);
    vec3 drift = vec3(uTime*0.015, uTime*0.004, -uTime*0.01);
    float c = fbm(sp*2.6 + drift + fbm(sp*5.0 + drift*1.5)*0.7);
    float cloud = smoothstep(0.52, 0.78, c);
    // storm cells: denser swirls
    float storm = smoothstep(0.78, 0.92, c);
    float sunDot = dot(normalize(vNormal), normalize(uSunDir));
    float day = smoothstep(-0.1, 0.4, sunDot);
    vec3 col = mix(vec3(0.85,0.88,0.95), vec3(1.0), storm);
    float alpha = cloud * (0.35 + 0.65*day);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function Clouds() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(1.0, 0.25, 0.4).normalize() },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!mesh.current) return;
    const d = Math.min(dt, 0.05);
    uniforms.uTime.value += d;
    mesh.current.rotation.y += d * 0.045;
  });

  return (
    <mesh ref={mesh} scale={1.022} renderOrder={2}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        vertexShader={earthVert}
        fragmentShader={cloudFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

const atmoVert = /* glsl */ `
  varying vec3 vNormal;
  void main(){
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmoFrag = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main(){
    float intensity = pow(max(0.0, 0.78 - abs(dot(vNormal, vec3(0,0,1.0)))), 2.4);
    gl_FragColor = vec4(uColor, 1.0) * intensity;
  }
`;

export function Atmosphere() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#6ea8ff") } }),
    [],
  );
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={atmoVert}
        fragmentShader={atmoFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}