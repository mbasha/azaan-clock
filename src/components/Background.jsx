// src/components/Background.jsx
import { useEffect, useRef } from 'react';

const STAR_COUNT = 160;

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      baseAlpha: Math.random() * 0.55 + 0.05,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
    }));

    let animId;
    let t = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial glow at top
      const grd = ctx.createRadialGradient(
        canvas.width * 0.5, 0, 0,
        canvas.width * 0.5, 0, canvas.height * 0.65
      );
      grd.addColorStop(0, 'rgba(50,80,65,0.18)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(star => {
        const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
        ctx.beginPath();
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,230,${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Canvas starfield */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          pointerEvents: 'none', display: 'block',
        }}
        aria-hidden="true"
      />

      {/* SVG Islamic geometric overlay */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none', opacity: 0.04,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="geo" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <polygon
              points="5,0.5 6.5,3.5 9.5,3.5 7,5.5 8,8.5 5,6.8 2,8.5 3,5.5 0.5,3.5 3.5,3.5"
              fill="none" stroke="#c8a45a" strokeWidth="0.08"
            />
            <rect x="3.8" y="3.8" width="2.4" height="2.4"
              transform="rotate(45,5,5)" fill="none" stroke="#c8a45a" strokeWidth="0.05"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#geo)" />
      </svg>

      {/* Corner ornaments */}
      {['tl','tr','bl','br'].map(pos => (
        <svg
          key={pos}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top:    pos.startsWith('t') ? 0 : 'auto',
            bottom: pos.startsWith('b') ? 0 : 'auto',
            left:   pos.endsWith('l')  ? 0 : 'auto',
            right:  pos.endsWith('r')  ? 0 : 'auto',
            transform: pos === 'tr' ? 'scaleX(-1)' : pos === 'bl' ? 'scaleY(-1)' : pos === 'br' ? 'scale(-1)' : 'none',
            zIndex: 1, pointerEvents: 'none', opacity: 0.45,
            width: 68, height: 68,
          }}
          viewBox="0 0 68 68" fill="none"
        >
          <path d="M0 0 L44 0 L44 3.2 L3.2 3.2 L3.2 44 L0 44Z" fill="#c8a45a" />
          <path d="M7 7 L30 7 L30 9.5 L9.5 9.5 L9.5 30 L7 30Z" fill="#c8a45a" opacity="0.5" />
          <circle cx="7" cy="7" r="2.4" fill="#c8a45a" />
        </svg>
      ))}
    </>
  );
}
