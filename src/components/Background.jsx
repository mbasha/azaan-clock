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

    // ── STARS: three layers for depth
    const makeStar = (minR, maxR, minA, maxA) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * (maxR - minR) + minR,
      baseAlpha: Math.random() * (maxA - minA) + minA,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.3 + 0.08,
      warm: Math.random() > 0.6, // warm gold-tinted vs cool white
    });

    const starsBack  = Array.from({ length: 180 }, () => makeStar(0.2, 0.7,  0.04, 0.3));
    const starsMid   = Array.from({ length: 80  }, () => makeStar(0.6, 1.3,  0.15, 0.6));
    const starsFront = Array.from({ length: 25  }, () => makeStar(1.2, 2.2,  0.35, 0.85));

    // ── SHOOTING STARS
    let shooters = [];
    function spawnShooter() {
      if (shooters.length >= 2) return;
      shooters.push({
        x: Math.random() * 0.7 + 0.05,
        y: Math.random() * 0.4,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 4 + 3,
        alpha: 0,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        angle: Math.PI / 5 + (Math.random() - 0.5) * 0.3,
      });
    }

    // ── CRESCENT MOON (fixed, top-right area)
    const moon = {
      cx: 0.82, cy: 0.12, r: 28,
      glowR: 90,
    };

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawStarLayer(stars, glowScale) {
      stars.forEach(star => {
        const alpha = star.baseAlpha * (0.55 + 0.45 * Math.sin(t * star.speed + star.phase));
        const x = star.x * canvas.width;
        const y = star.y * canvas.height;
        const r = star.r;

        if (glowScale > 0) {
          // Soft glow halo
          const grd = ctx.createRadialGradient(x, y, 0, x, y, r * glowScale);
          const color = star.warm ? `255,220,150` : `220,235,255`;
          grd.addColorStop(0, `rgba(${color},${alpha * 0.6})`);
          grd.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, r * glowScale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core
        const color = star.warm ? `255,230,160` : `230,240,255`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      });
    }

    function drawShooters() {
      shooters = shooters.filter(s => s.life < s.maxLife);
      shooters.forEach(s => {
        s.life++;
        // fade in then out
        if (s.life < 10) s.alpha = s.life / 10;
        else if (s.life > s.maxLife - 15) s.alpha = (s.maxLife - s.life) / 15;

        const dx = Math.cos(s.angle) * s.speed;
        const dy = Math.sin(s.angle) * s.speed;
        s.x += dx / canvas.width;
        s.y += dy / canvas.height;

        const x1 = s.x * canvas.width;
        const y1 = s.y * canvas.height;
        const x0 = x1 - Math.cos(s.angle) * s.len;
        const y0 = y1 - Math.sin(s.angle) * s.len;

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `rgba(255,240,200,0)`);
        grad.addColorStop(0.7, `rgba(255,240,200,${s.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    function drawMoon() {
      const x = moon.cx * canvas.width;
      const y = moon.cy * canvas.height;
      const r = moon.r;

      // Outer atmospheric glow
      const atm = ctx.createRadialGradient(x, y, r * 0.5, x, y, moon.glowR);
      atm.addColorStop(0, 'rgba(200,170,80,0.18)');
      atm.addColorStop(0.4, 'rgba(180,150,60,0.07)');
      atm.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(x, y, moon.glowR, 0, Math.PI * 2);
      ctx.fill();

      // Moon disc — draw as clipping crescent
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      // Full moon face
      const moonGrd = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
      moonGrd.addColorStop(0, 'rgba(255,248,210,0.95)');
      moonGrd.addColorStop(0.6, 'rgba(220,195,130,0.9)');
      moonGrd.addColorStop(1, 'rgba(160,130,70,0.85)');
      ctx.fillStyle = moonGrd;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Shadow disc to make crescent — offset to the left
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + r * 0.48, y - r * 0.05, r * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // Rim glow on crescent edge
      const rim = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.05);
      rim.addColorStop(0, 'rgba(255,240,160,0)');
      rim.addColorStop(1, 'rgba(255,230,120,0.12)');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawNebula() {
      // Deep green-teal nebula cloud — top center, like the dome of a mosque at night
      const x = canvas.width * 0.5;
      const y = canvas.height * 0.0;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, canvas.height * 0.55);
      grd.addColorStop(0,   'rgba(30,70,55,0.28)');
      grd.addColorStop(0.3, 'rgba(20,50,45,0.14)');
      grd.addColorStop(0.7, 'rgba(10,30,30,0.06)');
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle warm gold horizon blush at the very bottom
      const horizon = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
      horizon.addColorStop(0, 'rgba(0,0,0,0)');
      horizon.addColorStop(1, 'rgba(60,40,10,0.18)');
      ctx.fillStyle = horizon;
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
    }

    let shooterTimer = 0;

    function draw() {
      t += 0.006;
      shooterTimer++;
      // Spawn a shooting star roughly every 5 seconds
      if (shooterTimer > 300 + Math.random() * 200) {
        spawnShooter();
        shooterTimer = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Nebula / deep space atmosphere
      drawNebula();

      // 2. Back star layer (tiny, no glow)
      drawStarLayer(starsBack, 0);

      // 3. Mid layer (small glow)
      drawStarLayer(starsMid, 4);

      // 4. Front layer (bright, larger glow)
      drawStarLayer(starsFront, 7);

      // 5. Shooting stars
      drawShooters();

      // 6. Crescent moon
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

      {/* Islamic geometric tile overlay — increased opacity slightly */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none', opacity: 0.055,
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
