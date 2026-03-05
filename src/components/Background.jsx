// src/components/Background.jsx
import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawStar12(cx, cy, R, alpha, rotation = 0) {
      const points = 12;
      const inner  = R * 0.42;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI / points) * i + rotation;
        const r     = i % 2 === 0 ? R : inner;
        const x     = cx + Math.cos(angle) * r;
        const y     = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(200,164,90,${alpha})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    function drawStar8(cx, cy, R, alpha, rotation = 0) {
      const points = 8;
      const inner  = R * 0.38;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI / points) * i + rotation;
        const r     = i % 2 === 0 ? R : inner;
        const x     = cx + Math.cos(angle) * r;
        const y     = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(200,164,90,${alpha})`;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
    }

    function drawPolygon(cx, cy, R, sides, alpha, rotation = 0) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i + rotation;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(200,164,90,${alpha})`;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }

    function drawGirihRosette(cx, cy, R, alpha) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 / n) * i;
        const x = cx + Math.cos(angle) * R * 0.6;
        const y = cy + Math.sin(angle) * R * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, R * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,164,90,${alpha * 0.5})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,164,90,${alpha * 0.35})`;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }

    function draw() {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#060c14');
      bg.addColorStop(0.5, '#07100f');
      bg.addColorStop(1,   '#050a0d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.75);
      vig.addColorStop(0,   'rgba(15,30,25,0.0)');
      vig.addColorStop(0.6, 'rgba(5,10,10,0.3)');
      vig.addColorStop(1,   'rgba(0,0,0,0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      const gridSize = Math.min(W, H) * 0.22;
      const cols = Math.ceil(W / gridSize) + 2;
      const rows = Math.ceil(H / gridSize) + 2;
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.7);

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * gridSize + (row % 2 === 0 ? 0 : gridSize * 0.5);
          const cy = row * gridSize * 0.866;
          const dx = (cx - W/2) / (W/2);
          const dy = (cy - H/2) / (H/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const distFade = Math.max(0, 1 - dist * 0.65);
          const cellPhase = (col * 0.31 + row * 0.47);
          const shimmer = 0.7 + 0.3 * Math.sin(t * 1.2 + cellPhase);
          const baseAlpha = distFade * shimmer * 0.55;
          if (baseAlpha < 0.01) continue;
          const rot = Math.PI / 12;
          drawStar12(cx, cy, gridSize * 0.46, baseAlpha * 0.9, rot + t * 0.008);
          drawPolygon(cx, cy, gridSize * 0.46, 12, baseAlpha * 0.3, rot + t * 0.008);
          drawStar8(cx, cy, gridSize * 0.22, baseAlpha * 0.7, Math.PI / 8 - t * 0.006);
          drawGirihRosette(cx, cy, gridSize * 0.1, baseAlpha * 0.5);
        }
      }

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * gridSize + gridSize * 0.5 + (row % 2 === 0 ? 0 : gridSize * 0.5);
          const cy = row * gridSize * 0.866 + gridSize * 0.433;
          const dx = (cx - W/2) / (W/2);
          const dy = (cy - H/2) / (H/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const distFade = Math.max(0, 1 - dist * 0.7);
          const cellPhase = (col * 0.53 + row * 0.29);
          const shimmer   = 0.6 + 0.4 * Math.sin(t * 0.9 + cellPhase + 1.4);
          const baseAlpha = distFade * shimmer * 0.35;
          if (baseAlpha < 0.01) continue;
          drawStar8(cx, cy, gridSize * 0.2, baseAlpha, Math.PI / 8 + t * 0.01);
          drawPolygon(cx, cy, gridSize * 0.2, 8, baseAlpha * 0.4, Math.PI / 8 + t * 0.01);
        }
      }

      const mx = W * 0.5;
      const my = H * 0.5;
      const mR = Math.min(W, H) * 0.34;
      const mAlpha = 0.08 + 0.04 * breathe;

      for (let ring = 5; ring >= 1; ring--) {
        drawStar12(mx, my, mR * (ring / 5), mAlpha * (1.4 - ring * 0.15), t * 0.005 * (ring % 2 === 0 ? 1 : -1));
        drawPolygon(mx, my, mR * (ring / 5) * 0.88, 12, mAlpha * 0.4, t * 0.005 * (ring % 2 === 0 ? 1 : -1));
      }

      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i + t * 0.012;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(angle) * mR * 0.08, my + Math.sin(angle) * mR * 0.08);
        ctx.strokeStyle = `rgba(200,164,90,${mAlpha * 2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

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
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          pointerEvents: 'none', display: 'block',
        }}
        aria-hidden="true"
      />
      {['tl','tr','bl','br'].map(pos => (
        <svg
          key={pos}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top:    pos.startsWith('t') ? 0 : 'auto',
            bottom: pos.startsWith('b') ? 0 : 'auto',
            left:   pos.endsWith('l')   ? 0 : 'auto',
            right:  pos.endsWith('r')   ? 0 : 'auto',
            transform: pos === 'tr' ? 'scaleX(-1)' : pos === 'bl' ? 'scaleY(-1)' : pos === 'br' ? 'scale(-1)' : 'none',
            zIndex: 1, pointerEvents: 'none', opacity: 0.5,
            width: 80, height: 80,
          }}
          viewBox="0 0 80 80" fill="none"
        >
          <path d="M0 0 L52 0 L52 3.5 L3.5 3.5 L3.5 52 L0 52Z" fill="#c8a45a"/>
          <path d="M8 8 L34 8 L34 11 L11 11 L11 34 L8 34Z" fill="#c8a45a" opacity="0.45"/>
          <polygon points="8,2 9.2,5.6 13,5.6 10,7.8 11.2,11.4 8,9.2 4.8,11.4 6,7.8 3,5.6 6.8,5.6" fill="#c8a45a" opacity="0.7"/>
        </svg>
      ))}
    </>
  );
}
