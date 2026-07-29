import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Flake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
  twinklePhase: number;
}

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    const flakes: Flake[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initFlakes = () => {
      flakes.length = 0;
      const count = Math.min(120, Math.floor(window.innerWidth / 8));
      for (let i = 0; i < count; i += 1) {
        flakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.8 + 1,
          speed: Math.random() * 1.5 + 0.5,
          drift: Math.random() * 0.6 - 0.3,
          opacity: Math.random() * 0.5 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    let tick = 0;

    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach((flake) => {
        const twinkle = 0.75 + 0.25 * Math.sin(tick * 0.03 + flake.twinklePhase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * twinkle})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = flake.radius * 1.5;
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
        flake.y += flake.speed;
        flake.x += flake.drift;
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });
      animationId = requestAnimationFrame(draw);
    };

    resize();
    initFlakes();
    draw();
    window.addEventListener('resize', () => {
      resize();
      initFlakes();
    });

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return createPortal(
    <canvas ref={canvasRef} className="snowfall" aria-hidden="true" />,
    document.body,
  );
}
