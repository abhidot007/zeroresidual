import { useEffect, useRef } from "react";
import * as THREE from "three";

// Generate gyroid TPMS surface procedurally
// Gyroid implicit: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = t
// We render it as a point cloud with spatially varying density (anisotropic grading)
function generateGyroidPoints(resolution = 40) {
  const points = [];
  const colors = [];
  const step = (2 * Math.PI * 2) / resolution;

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      for (let k = 0; k < resolution; k++) {
        const x = -Math.PI * 2 + i * step;
        const y = -Math.PI * 2 + j * step;
        const z = -Math.PI * 2 + k * step;

        // Gyroid field value
        const val = Math.sin(x) * Math.cos(y) +
                    Math.sin(y) * Math.cos(z) +
                    Math.sin(z) * Math.cos(x);

        // Functionally graded threshold — denser near x=0 (simulating flow inlet)
        const xNorm = (i / resolution);
        const threshold = 0.05 + xNorm * 0.3; // anisotropic grading

        if (Math.abs(val) < threshold) {
          points.push(x * 0.3, y * 0.3, z * 0.3);

          // Color: inlet (amber) → outlet (teal) based on x position
          const t = xNorm;
          const r = (1 - t) * 200 + t * 30;
          const g = (1 - t) * 169 + t * 150;
          const b = (1 - t) * 110 + t * 180;
          colors.push(r / 255, g / 255, b / 255);
        }
      }
    }
  }
  return { points: new Float32Array(points), colors: new Float32Array(colors) };
}

export default function GyroidViewer() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Generate gyroid
    const { points, colors } = generateGyroidPoints(38);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    // Bounding box wireframe
    const boxGeo = new THREE.BoxGeometry(3.8, 3.8, 3.8);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      wireframe: true,
    });
    scene.add(new THREE.Mesh(boxGeo, boxMat));

    // Mouse interaction
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let rotX = 0.3, rotY = 0.3;
    let autoRotate = true;

    const onDown = (e) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX || e.touches?.[0]?.clientX;
      prevY = e.clientY || e.touches?.[0]?.clientY;
    };
    const onUp = () => { isDragging = false; };
    const onMove = (e) => {
      if (!isDragging) return;
      const cx = e.clientX || e.touches?.[0]?.clientX;
      const cy = e.clientY || e.touches?.[0]?.clientY;
      rotY += (cx - prevX) * 0.008;
      rotX += (cy - prevY) * 0.008;
      prevX = cx; prevY = cy;
    };

    renderer.domElement.addEventListener("mousedown", onDown);
    renderer.domElement.addEventListener("touchstart", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);

    // Animation
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (autoRotate) rotY += 0.003;
      mesh.rotation.x = rotX;
      mesh.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("mousedown", onDown);
      renderer.domElement.removeEventListener("touchstart", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", border: "1px solid #1a1a1a" }}>
      <div ref={mountRef} style={{ width: "100%", height: "320px", cursor: "grab" }} />
      <div
        className="mono text-xs absolute bottom-3 right-3"
        style={{ color: "#2a2a2a" }}
      >
        drag to rotate
      </div>
    </div>
  );
}
