"use client";
import Navbar from "@/components/Navbar";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// This is the main component for the 3D Black Hole Animation
const BlackHoleAnimation = () => {
  // Refs for the meshes that will be animated
  const blackHoleRef = useRef<THREE.Mesh>(null);
  const accretionDiskRef = useRef<THREE.Mesh>(null);
  const lensingDiskRef = useRef<THREE.Mesh>(null); // Ref for the second disk to create the lensing effect
  const particleSystemRef = useRef<THREE.Points>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Define shaders as constants to avoid re-creation on each render
  const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

  const fragmentShader = `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;

        // Simplex noise function for creating organic patterns
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute( permute( permute(
                       i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float radius = length(vUv - 0.5);
            float noise = snoise(vec3(vUv * 8.0, time * 0.3));
            
            vec3 mixedColor1 = mix(color1, color2, (sin(angle * 6.0 + time * 0.5) + 1.0) / 2.0);
            vec3 mixedColor2 = mix(mixedColor1, color3, (cos(angle * 4.0 + time * 0.7) + 1.0) / 2.0);
            
            float intensity = 0.15 / (radius + 0.01) - 0.6 + noise * 0.3;
            intensity = smoothstep(0.0, 1.2, intensity);

            if (radius < 0.22 || radius > 0.48) {
                discard;
            }
            
            float edge = smoothstep(0.22, 0.24, radius) - smoothstep(0.46, 0.48, radius);

            gl_FragColor = vec4(mixedColor2 * intensity + edge * mixedColor2 * 3.0, edge * 2.0 + intensity);
        }
    `;

  // Memoize the uniforms object to prevent re-creation
  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
    color1: { value: new THREE.Color('#ff8800') },
    color2: { value: new THREE.Color('#6600ff') },
    color3: { value: new THREE.Color('#00aaff') },
  }), []);

  // Create a star texture using a 2D canvas
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null; // Add a guard clause in case context is not available

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(32, 5);
    ctx.lineTo(41, 25);
    ctx.lineTo(62, 25);
    ctx.lineTo(45, 40);
    ctx.lineTo(50, 60);
    ctx.lineTo(32, 48);
    ctx.lineTo(14, 60);
    ctx.lineTo(19, 40);
    ctx.lineTo(2, 25);
    ctx.lineTo(23, 25);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Particle system setup
  const particles = useMemo(() => {
    const particleCount = 10000; // Increased particle count for a fuller scene
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 20 + 5; // Increased radius to spread particles out
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  // Animation loop
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (accretionDiskRef.current) accretionDiskRef.current.rotation.z = elapsedTime * 0.2;
    if (lensingDiskRef.current) lensingDiskRef.current.rotation.z = elapsedTime * 0.2;
    if (shaderMaterialRef.current) shaderMaterialRef.current.uniforms.time.value = elapsedTime;
    if (blackHoleRef.current) blackHoleRef.current.rotation.y = elapsedTime * 0.1;
    if (particleSystemRef.current) particleSystemRef.current.rotation.y = elapsedTime * -0.02;
  });

  return (
    <>
      <mesh ref={blackHoleRef} scale={1.2}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="black" roughness={1} metalness={0.1} />
      </mesh>

      {/* Main Accretion Disk */}
      <mesh ref={accretionDiskRef} rotation={[Math.PI / 2, 0, 0]} scale={5}>
        <ringGeometry args={[0.2, 0.5, 128, 16]} />
        <shaderMaterial
          ref={shaderMaterialRef}
          attach="material"
          args={[{ uniforms, vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide }]}
        />
      </mesh>

      {/* Lensing Disk to fake gravitational lensing */}
      <mesh ref={lensingDiskRef} rotation={[0, Math.PI / 2.5, Math.PI / 10]} scale={5}>
        <ringGeometry args={[0.3, 0.4, 128, 16]} />
        <shaderMaterial
          attach="material"
          args={[{ uniforms, vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide }]}
        />
      </mesh>

      <points ref={particleSystemRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial
          map={starTexture}
          size={0.15}
          color="#ffffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* The <Stars> component is no longer needed as we have a custom star particle system */}
    </>
  );
};

// The main Home component for your page
export default function Home() {
  return (
    <div >
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={2.0} />
          <BlackHoleAnimation />
        </Canvas>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10">
            <img
              src="https://avatars.githubusercontent.com/u/1?v=4"
              alt="[Your Name] Avatar"
              className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-xl mb-6 object-cover mx-auto"
            />
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              Hi, I'm [Your Name]
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl font-light">
              Crafting immersive and performant digital experiences.
              <br />I design & build modern web applications with a focus on creativity and user engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transform transition-transform duration-300"
              >
                View My Work
              </a>
              <a
                href="/contact"
                className="px-8 py-3 rounded-xl border border-purple-500 text-purple-300 font-semibold hover:bg-purple-900/40 hover:text-white transition-colors duration-300"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </main>
        <footer className="text-center text-gray-500 py-4 text-xs opacity-70">
          &copy; {new Date().getFullYear()} [Your Name]. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
