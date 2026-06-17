import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Crazy black animated background:
 * - Pure black base
 * - Distorted shader blob (noise-warped sphere) pulsing in the middle
 * - Swirling white/violet particle vortex
 * - Faint scanning grid plane
 * - Cursor parallax
 */
export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (typeof window === "undefined") return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    /* ---------- swirling particle vortex ---------- */
    const PARTICLES = 2500;
    const positions = new Float32Array(PARTICLES * 3);
    const seeds = new Float32Array(PARTICLES);
    const colors = new Float32Array(PARTICLES * 3);
    const cA = new THREE.Color("#ffffff");
    const cB = new THREE.Color("#a78bfa");
    for (let i = 0; i < PARTICLES; i++) {
      const r = 2 + Math.random() * 8;
      const t = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(t) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = Math.sin(t) * r;
      seeds[i] = Math.random();
      const m = cA.clone().lerp(cB, Math.random());
      colors[i * 3] = m.r;
      colors[i * 3 + 1] = m.g;
      colors[i * 3 + 2] = m.b;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeom, pMat);
    scene.add(points);

    /* ---------- distorted shader blob ---------- */
    const blobUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const blobMat = new THREE.ShaderMaterial({
      uniforms: blobUniforms,
      transparent: true,
      wireframe: true,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vDist;

        // simplex-ish hash noise
        vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
        vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0*floor(p*ns.z*ns.z);
          vec4 x_ = floor(j*ns.z);
          vec4 y_ = floor(j - 7.0*x_);
          vec4 x = x_*ns.x + ns.yyyy;
          vec4 y = y_*ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m*m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          float n = snoise(normal * 1.2 + uTime * 0.25);
          float n2 = snoise(normal * 2.5 - uTime * 0.4);
          float disp = n * 0.55 + n2 * 0.25;
          vDist = disp;
          vec3 newPos = position + normal * disp;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vDist;
        void main() {
          vec3 colA = vec3(0.65, 0.55, 1.0);   // violet
          vec3 colB = vec3(0.45, 0.85, 1.0);   // cyan
          vec3 col = mix(colA, colB, smoothstep(-0.4, 0.6, vDist));
          float a = 0.55 + vDist * 0.4;
          gl_FragColor = vec4(col, clamp(a, 0.15, 0.9));
        }
      `,
    });
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 32), blobMat);
    scene.add(blob);

    /* ---------- faint scan grid plane ---------- */
    const grid = new THREE.GridHelper(60, 60, 0x222233, 0x111122);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.18;
    grid.position.y = -4.5;
    grid.rotation.x = 0;
    scene.add(grid);

    /* ---------- interaction ---------- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ---------- animate ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // swirl particles
      const pos = pGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLES; i++) {
        const ix = i * 3;
        const x = pos[ix];
        const z = pos[ix + 2];
        const angle = 0.0025 + seeds[i] * 0.004;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        pos[ix] = x * cosA - z * sinA;
        pos[ix + 2] = x * sinA + z * cosA;
        pos[ix + 1] += Math.sin(t * 0.6 + seeds[i] * 10) * 0.004;
      }
      pGeom.attributes.position.needsUpdate = true;

      blobUniforms.uTime.value = t;
      blob.rotation.y = t * 0.15;
      blob.rotation.x = t * 0.1;

      grid.rotation.z = t * 0.05;

      camera.position.x = mouse.x * 0.8;
      camera.position.y = -mouse.y * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      pGeom.dispose();
      pMat.dispose();
      blob.geometry.dispose();
      blobMat.dispose();
      (grid.material as THREE.Material).dispose();
      grid.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      style={{ background: "#000000" }}
    />
  );
}
