'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BlackHole3DProps {
  width?: number;
  height?: number;
  className?: string;
}

interface Controls {
  rotationSpeed: number;
  diskBrightness: number;
  particleCount: number;
  gravityEffect: number;
}

const BlackHole3D: React.FC<BlackHole3DProps> = ({ 
  width, 
  height, 
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const blackHoleRef = useRef<THREE.Mesh | null>(null);
  const accretionDiskRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [controls, setControls] = useState<Controls>({
    rotationSpeed: 0.005,
    diskBrightness: 1.5,
    particleCount: 5000,
    gravityEffect: 1
  });
  
  const [fps, setFps] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Mouse and camera state
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const cameraDistanceRef = useRef(15);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const initScene = () => {
    if (!mountRef.current) return;

    const currentWidth = width || mountRef.current.clientWidth;
    const currentHeight = height || mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentWidth / currentHeight, 0.1, 1000);
    cameraRef.current = camera;
    
    // Position camera at optimal viewing angle, always looking at center
    camera.position.set(0, 8, cameraDistanceRef.current);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(currentWidth, currentHeight);
    renderer.setClearColor(0x000000);
    
    // Center the canvas
    renderer.domElement.style.display = 'block';
    mountRef.current.appendChild(renderer.domElement);

    // Create scene objects - all positioned at origin (0,0,0)
    createBlackHole(scene);
    createAccretionDisk(scene);
    createParticles(scene, controls.particleCount);
    createStars(scene);

    setIsLoaded(true);
  };

  const createBlackHole = (scene: THREE.Scene) => {
    // Main black hole sphere - positioned exactly at origin
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.95
    });
    const blackHole = new THREE.Mesh(geometry, material);
    blackHole.position.set(0, 0, 0); // Ensure it's exactly centered
    blackHoleRef.current = blackHole;
    scene.add(blackHole);

    // Event horizon glow - also centered
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a0e4e,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 0, 0); // Ensure glow is also centered
    scene.add(glow);
  };

  const createAccretionDisk = (scene: THREE.Scene) => {
    const diskGeometry = new THREE.RingGeometry(1.5, 8, 64, 8);
    
    const diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        brightness: { value: controls.diskBrightness }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDistance;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = length(position);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float brightness;
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
          float distance = length(vUv - 0.5) * 2.0;
          float innerRadius = 0.3;
          float outerRadius = 1.0;
          
          if (distance < innerRadius || distance > outerRadius) {
            discard;
          }
          
          float normalizedDistance = (distance - innerRadius) / (outerRadius - innerRadius);
          float intensity = 1.0 - normalizedDistance;
          
          vec3 innerColor = vec3(1.0, 0.8, 0.4);
          vec3 middleColor = vec3(1.0, 0.4, 0.2);
          vec3 outerColor = vec3(0.8, 0.2, 0.6);
          
          vec3 color;
          if (normalizedDistance < 0.5) {
            color = mix(innerColor, middleColor, normalizedDistance * 2.0);
          } else {
            color = mix(middleColor, outerColor, (normalizedDistance - 0.5) * 2.0);
          }
          
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float turbulence = sin(angle * 8.0 + time * 2.0) * 0.1 + 0.9;
          intensity *= turbulence;
          
          gl_FragColor = vec4(color * intensity * brightness, intensity * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDiskRef.current = accretionDisk;
    
    // Position disk exactly at origin and rotate to horizontal
    accretionDisk.position.set(0, 0, 0);
    accretionDisk.rotation.x = -Math.PI / 2;
    
    scene.add(accretionDisk);
  };

  const createParticles = (scene: THREE.Scene, count: number) => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 12 + 2;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.5;

      positions.push(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius
      );

      const normalizedRadius = radius / 14;
      const r = 1.0 - normalizedRadius * 0.3;
      const g = 0.8 - normalizedRadius * 0.4;
      const b = 0.4 + normalizedRadius * 0.4;

      colors.push(r, g, b);

      const speed = Math.sqrt(1 / radius) * 0.5;
      velocities.push(-Math.sin(theta) * speed, 0, Math.cos(theta) * speed);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);
  };

  const createStars = (scene: THREE.Scene) => {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];

    for (let i = 0; i < 2000; i++) {
      const radius = Math.random() * 200 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      starPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      const brightness = Math.random() * 0.8 + 0.2;
      starColors.push(brightness, brightness, brightness);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    scene.add(stars);
  };

  const updateParticles = () => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const distance = Math.sqrt(x * x + y * y + z * z);

      const force = controls.gravityEffect / (distance * distance + 0.1);
      const ax = -x * force;
      const ay = -y * force * 0.1;
      const az = -z * force;

      velocities[i] += ax * 0.01;
      velocities[i + 1] += ay * 0.01;
      velocities[i + 2] += az * 0.01;

      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      if (distance < 1.2) {
        const newRadius = Math.random() * 8 + 6;
        const newTheta = Math.random() * Math.PI * 2;
        positions[i] = Math.cos(newTheta) * newRadius;
        positions[i + 1] = (Math.random() - 0.5) * 0.3;
        positions[i + 2] = Math.sin(newTheta) * newRadius;
        
        const speed = Math.sqrt(1 / newRadius) * 0.5;
        velocities[i] = -Math.sin(newTheta) * speed;
        velocities[i + 1] = 0;
        velocities[i + 2] = Math.cos(newTheta) * speed;
      } else if (distance > 15) {
        const newRadius = Math.random() * 3 + 8;
        const newTheta = Math.random() * Math.PI * 2;
        positions[i] = Math.cos(newTheta) * newRadius;
        positions[i + 1] = (Math.random() - 0.5) * 0.3;
        positions[i + 2] = Math.sin(newTheta) * newRadius;
        
        const speed = Math.sqrt(1 / newRadius) * 0.5;
        velocities[i] = -Math.sin(newTheta) * speed;
        velocities[i + 1] = 0;
        velocities[i + 2] = Math.cos(newTheta) * speed;
      }

      const normalizedDistance = Math.min(distance / 10, 1);
      colors[i] = 1.0 - normalizedDistance * 0.3;
      colors[i + 1] = 0.8 - normalizedDistance * 0.4;
      colors[i + 2] = 0.4 + normalizedDistance * 0.4;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
  };

  const animate = () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    animationIdRef.current = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;
    
    // Update accretion disk animation - rotate around center
    if (accretionDiskRef.current) {
      (accretionDiskRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
      accretionDiskRef.current.rotation.z += controls.rotationSpeed;
    }

    // Update particles with gravitational simulation
    updateParticles();

    // Ensure camera always looks at center
    cameraRef.current.lookAt(0, 0, 0);

    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // Update FPS counter
    frameCountRef.current++;
    const currentTime = performance.now();
    if (currentTime - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMouseDownRef.current || !cameraRef.current) return;

    const deltaX = event.clientX - mouseRef.current.x;
    const deltaY = event.clientY - mouseRef.current.y;
    
    const phi = Math.atan2(cameraRef.current.position.z, cameraRef.current.position.x) - deltaX * 0.01;
    const theta = Math.acos(cameraRef.current.position.y / cameraDistanceRef.current) + deltaY * 0.01;
    
    // Clamp theta to prevent camera flipping
    const clampedTheta = Math.max(0.1, Math.min(Math.PI - 0.1, theta));
    
    cameraRef.current.position.x = cameraDistanceRef.current * Math.sin(clampedTheta) * Math.cos(phi);
    cameraRef.current.position.y = cameraDistanceRef.current * Math.cos(clampedTheta);
    cameraRef.current.position.z = cameraDistanceRef.current * Math.sin(clampedTheta) * Math.sin(phi);
    
    // Always look at the center (0, 0, 0) to keep black hole centered
    cameraRef.current.lookAt(0, 0, 0);
    
    mouseRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!cameraRef.current) return;

    event.preventDefault();
    
    cameraDistanceRef.current += event.deltaY * 0.01;
    cameraDistanceRef.current = Math.max(3, Math.min(50, cameraDistanceRef.current));
    
    // Get current spherical coordinates
    const currentDistance = Math.sqrt(
      cameraRef.current.position.x * cameraRef.current.position.x + 
      cameraRef.current.position.y * cameraRef.current.position.y + 
      cameraRef.current.position.z * cameraRef.current.position.z
    );
    
    const phi = Math.atan2(cameraRef.current.position.z, cameraRef.current.position.x);
    const theta = Math.acos(cameraRef.current.position.y / currentDistance);
    
    // Update position maintaining same angle but new distance
    cameraRef.current.position.x = cameraDistanceRef.current * Math.sin(theta) * Math.cos(phi);
    cameraRef.current.position.y = cameraDistanceRef.current * Math.cos(theta);
    cameraRef.current.position.z = cameraDistanceRef.current * Math.sin(theta) * Math.sin(phi);
    
    // Always keep black hole centered
    cameraRef.current.lookAt(0, 0, 0);
  };

  const updateControl = (key: keyof Controls, value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const handleParticleCountChange = (newCount: number) => {
    if (newCount !== controls.particleCount && sceneRef.current && particlesRef.current) {
      sceneRef.current.remove(particlesRef.current);
      createParticles(sceneRef.current, newCount);
      updateControl('particleCount', newCount);
    }
  };

  const handleResize = () => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

    const currentWidth = width || mountRef.current.clientWidth;
    const currentHeight = height || mountRef.current.clientHeight;

    cameraRef.current.aspect = currentWidth / currentHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(currentWidth, currentHeight);
  };

  useEffect(() => {
    initScene();
    animate();

    const handleWindowResize = () => handleResize();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (accretionDiskRef.current) {
      (accretionDiskRef.current.material as THREE.ShaderMaterial).uniforms.brightness.value = controls.diskBrightness;
    }
  }, [controls.diskBrightness]);

  return (
    <div className={`relative bg-black ${className}`} style={{ width: width || '100%', height: height || '100vh' }}>
      <div
        ref={mountRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ width: width || '100%', height: height || '100%' }}
      />
      
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white p-4 rounded-lg">
        <h3 className="text-orange-400 text-lg font-bold mb-3">Black Hole Controls</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1">Rotation Speed:</label>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={controls.rotationSpeed}
              onChange={(e) => updateControl('rotationSpeed', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-1">Disk Brightness:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={controls.diskBrightness}
              onChange={(e) => updateControl('diskBrightness', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-1">Particles Count:</label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={controls.particleCount}
              onChange={(e) => handleParticleCountChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-1">Gravitational Effect:</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={controls.gravityEffect}
              onChange={(e) => updateControl('gravityEffect', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white p-3 rounded-lg text-xs">
        <div>Use mouse to orbit around the black hole</div>
        <div>Scroll to zoom in/out</div>
        <div>FPS: {fps}</div>
        <div>Status: {isLoaded ? 'Loaded' : 'Loading...'}</div>
      </div>
    </div>
  );
};

export default BlackHole3D;