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

    // Three depth layers of stars
    const makeStar = (minR, maxR, minA, maxA) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * (maxR - minR) + minR,
      baseAlpha: Math.random() * (maxA - minA) + minA,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
      warm: Math.random() > 0.6,
    });

    const starsBack  = Array.from({ length: 180 }, () => makeStar(0.2, 0.7,  0.04, 0.28));
    const starsMid   = Array.from({ length: 70  }, () => makeStar(0.6, 1.2,  0.12, 0.55));
    const starsFront = Array.from({ length: 20  }, () => makeStar(1.1, 2.0,  0.3,  0.8 ));

    // Shooting stars
    let shooters = [];
    let shooterTimer = 0;

    function spawnShooter() {
      if (shooters.length >= 2) return;
      shooters.push({
        x: Math.random() * 0.65 + 0.05,
        y: Math.random() * 0.35,
        len: Math.random() * 110 + 60,
        speed: Math.random() * 3.5 + 3,
        alpha: 0,
        life: 0,
        maxLife: Math.random() * 55 + 40,
        angle: Math.PI / 5 + (Math.random() - 0.5) * 0.3,
      });
    }

    // Crescent moon — top right
    const moon = { cx: 0.82, cy: 0.11, r: 26, glowR: 85 };

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawBackground() {
      // Deep night sky gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0,   '#060a10');
      bg.addColorStop(0.6, '#070d0c');
      bg.addColorStop(1,   '#050809');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle green-teal glow at top center
      const glow = ctx.createRadialGradient(
        canvas.width * 0.5, 0, 0,
        canvas.width * 0.5, 0, canvas.height * 0.6
      );
      glow.addColorStop(0, 'rgba(40,70,55,0.2)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Warm gold horizon blush at bottom
      const horizon = ctx.createLinearGradient(0, canvas.height * 0.78, 0, canvas.height);
      horizon.addColorStop(0, 'rgba(0,0,0,0)');
      horizon.addColorStop(1, 'rgba(50,32,8,0.15)');
      ctx.fillStyle = horizon;
      ctx.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height * 0.22);
    }

    function drawStarLayer(stars, glowScale) {
      stars.forEach(star => {
        const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
        const x = star.x * canvas.width;
        const y = star.y * canvas.height;

        if (glowScale > 0) {
          const color = star.warm ? '255,220,150' : '210,228,255';
          const grd = ctx.createRadialGradient(x, y, 0, x, y, star.r * glowScale);
          grd.addColorStop(0, `rgba(${color},${alpha * 0.55})`);
          grd.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, star.r * glowScale, 0, Math.PI * 2);
          ctx.fill();
        }

        const color = star.warm ? '255,232,165' : '225,238,255';
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      });
    }

    function drawShooters() {
      shooters = shooters.filter(s => s.life < s.maxLife);
      shooters.forEach(s => {
        s.life++;
        if (s.life < 10) s.alpha = s.life / 10;
        else if (s.life > s.maxLife - 15) s.alpha = (s.maxLife - s.life) / 15;

        s.x += Math.cos(s.angle) * s.speed / canvas.width;
        s.y += Math.sin(s.angle) * s.speed / canvas.height;

        const x1 = s.x * canvas.width;
        const y1 = s.y * canvas.height;
        const x0 = x1 - Math.cos(s.angle) * s.len;
        const y0 = y1 - Math.sin(s.angle) * s.len;

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0,   `rgba(255,240,200,0)`);
        grad.addColorStop(0.6, `rgba(255,240,200,${s.alpha * 0.35})`);
        grad.addColorStop(1,   `rgba(255,255,255,${s.alpha})`);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
    }

    function drawMoon() {
      const x = moon.cx * canvas.width;
      const y = moon.cy * canvas.height;
      const r = moon.r;

      // Atmospheric glow
      const atm = ctx.createRadialGradient(x, y, r * 0.5, x, y, moon.glowR);
      atm.addColorStop(0,   'rgba(200,170,80,0.16)');
      atm.addColorStop(0.4, 'rgba(180,150,60,0.06)');
      atm.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(x, y, moon.glowR, 0, Math.PI * 2);
      ctx.fill();

      // Crescent via clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      // Moon face
      const face = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
      face.addColorStop(0,   'rgba(255,248,210,0.95)');
      face.addColorStop(0.6, 'rgba(220,195,130,0.9)');
      face.addColorStop(1,   'rgba(160,130,70,0.85)');
      ctx.fillStyle = face;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Shadow disc to carve out crescent
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + r * 0.48, y - r * 0.05, r * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // Soft rim glow
      const rim = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.08);
      rim.addColorStop(0, 'rgba(255,240,160,0)');
      rim.addColorStop(1, 'rgba(255,230,120,0.1)');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.08, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      t += 0.007;
      shooterTimer++;
      if (shooterTimer > 320 + Math.random() * 180) {
        spawnShooter();
        shooterTimer = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawStarLayer(starsBack,  0);
      drawStarLayer(starsMid,   4);
      drawStarLayer(starsFront, 7);
      drawShooters();
      drawMoon();

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
            zIndex: 1, pointerEvents: 'none', opacity: 0.45,
            width: 68, height: 68,
          }}
          viewBox="0 0 68 68" fill="none"
        >
          <path d="M0 0 L44 0 L44 3.2 L3.2 3.2 L3.2 44 L0 44Z" fill="#c8a45a"/>
          <path d="M7 7 L30 7 L30 9.5 L9.5 9.5 L9.5 30 L7 30Z" fill="#c8a45a" opacity="0.5"/>
          <circle cx="7" cy="7" r="2.4" fill="#c8a45a"/>
        </svg>
      ))}
    </>
  );
}
