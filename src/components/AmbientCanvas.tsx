import React, { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  intensity?: number;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ intensity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Floating glowing particles & stardust
    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3.5 + 1.2,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: -Math.random() * 0.9 - 0.3,
      alpha: Math.random() * 0.6 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.3,
      colorType: Math.random() > 0.6 ? 'amber' : Math.random() > 0.3 ? 'blue' : 'purple',
      pulseSpeed: Math.random() * 0.04 + 0.02,
      phase: Math.random() * Math.PI * 2,
    }));

    let tick = 0;

    const render = () => {
      // Fast, distinct living motion
      tick += 0.022;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Base Soft Light Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#f8fafd');
      baseGrad.addColorStop(0.5, '#f0f4f9');
      baseGrad.addColorStop(1, '#e8f0fe');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Visibly Moving Fluid Blob 1: Vibrant Azure Blue
      const blob1X = width * 0.65 + Math.sin(tick * 0.9) * 220 + (mouseX - width / 2) * 0.15;
      const blob1Y = height * 0.3 + Math.cos(tick * 0.75) * 160 + (mouseY - height / 2) * 0.15;
      const blob1Grad = ctx.createRadialGradient(
        blob1X,
        blob1Y,
        30,
        blob1X,
        blob1Y,
        Math.max(width, height) * 0.55
      );
      blob1Grad.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
      blob1Grad.addColorStop(0.4, 'rgba(96, 165, 250, 0.25)');
      blob1Grad.addColorStop(0.7, 'rgba(191, 219, 254, 0.12)');
      blob1Grad.addColorStop(1, 'rgba(240, 244, 249, 0)');
      ctx.fillStyle = blob1Grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Visibly Moving Fluid Blob 2: Vibrant Indigo-Violet Aurora
      const blob2X = width * 0.25 + Math.cos(tick * 0.85) * 200 - (mouseX - width / 2) * 0.12;
      const blob2Y = height * 0.65 + Math.sin(tick * 1.1) * 170 - (mouseY - height / 2) * 0.12;
      const blob2Grad = ctx.createRadialGradient(
        blob2X,
        blob2Y,
        40,
        blob2X,
        blob2Y,
        Math.max(width, height) * 0.5
      );
      blob2Grad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      blob2Grad.addColorStop(0.45, 'rgba(167, 139, 250, 0.2)');
      blob2Grad.addColorStop(0.8, 'rgba(238, 242, 255, 0.08)');
      blob2Grad.addColorStop(1, 'rgba(240, 244, 249, 0)');
      ctx.fillStyle = blob2Grad;
      ctx.fillRect(0, 0, width, height);

      // 3. Dynamic Cyan Ribbon Wave
      const blob3X = width * 0.5 + Math.sin(tick * 0.6) * 240;
      const blob3Y = height * 0.8 + Math.cos(tick * 0.7) * 140;
      const blob3Grad = ctx.createRadialGradient(
        blob3X,
        blob3Y,
        20,
        blob3X,
        blob3Y,
        Math.max(width, height) * 0.45
      );
      blob3Grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      blob3Grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
      blob3Grad.addColorStop(1, 'rgba(240, 244, 249, 0)');
      ctx.fillStyle = blob3Grad;
      ctx.fillRect(0, 0, width, height);

      // 4. Amber Champagne Glow
      const blob4X = width * 0.8 + Math.cos(tick * 0.65) * 180;
      const blob4Y = height * 0.2 + Math.sin(tick * 0.8) * 120;
      const blob4Grad = ctx.createRadialGradient(
        blob4X,
        blob4Y,
        20,
        blob4X,
        blob4Y,
        Math.max(width, height) * 0.38
      );
      blob4Grad.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
      blob4Grad.addColorStop(0.4, 'rgba(252, 211, 77, 0.12)');
      blob4Grad.addColorStop(1, 'rgba(240, 244, 249, 0)');
      ctx.fillStyle = blob4Grad;
      ctx.fillRect(0, 0, width, height);

      // 5. Undulating Animated Sine Waves / Currents across screen
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const yOffset = height * (0.35 + w * 0.22);
        const waveSpeed = tick * (0.8 + w * 0.3);
        const amplitude = 35 + w * 18;
        const frequency = 0.0035 + w * 0.001;

        ctx.moveTo(0, yOffset + Math.sin(waveSpeed) * amplitude);

        for (let x = 0; x <= width; x += 15) {
          const y = yOffset + Math.sin(x * frequency + waveSpeed) * amplitude + Math.cos(x * 0.002 + waveSpeed * 0.6) * 15;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, yOffset - 40, 0, height);
        if (w === 0) {
          waveGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
          waveGrad.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
        } else if (w === 1) {
          waveGrad.addColorStop(0, 'rgba(147, 51, 234, 0.06)');
          waveGrad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');
        } else {
          waveGrad.addColorStop(0, 'rgba(14, 165, 233, 0.07)');
          waveGrad.addColorStop(1, 'rgba(240, 244, 249, 0)');
        }
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Stroke line on the wave crest
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const y = yOffset + Math.sin(x * frequency + waveSpeed) * amplitude + Math.cos(x * 0.002 + waveSpeed * 0.6) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w === 0 ? 'rgba(59, 130, 246, 0.25)' : w === 1 ? 'rgba(147, 51, 234, 0.2)' : 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 6. Interactive Fluid Mouse Aura
      const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 10, mouseX, mouseY, 260);
      mouseGrad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
      mouseGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      mouseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // 7. Render Moving Floating Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.25;

        // Wrap around boundaries
        if (p.y < -20) p.y = height + 20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.colorType === 'amber') {
          ctx.fillStyle = `rgba(245, 158, 11, ${Math.max(0.15, p.alpha * intensity)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        } else if (p.colorType === 'purple') {
          ctx.fillStyle = `rgba(139, 92, 246, ${Math.max(0.18, p.alpha * intensity)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.2, p.alpha * intensity)})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
        }

        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 60fps Living Canvas */}
      <canvas
        id="fluentic-ambient-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* CSS Floating Luminous Aurora Elements for layered organic motion */}
      <div 
        className="absolute -top-20 -left-20 w-[30rem] h-[30rem] rounded-full bg-blue-400/25 blur-3xl animate-float-slow pointer-events-none"
      />
      <div 
        className="absolute top-1/4 -right-24 w-[34rem] h-[34rem] rounded-full bg-indigo-400/25 blur-3xl animate-float-reverse pointer-events-none"
      />
      <div 
        className="absolute -bottom-24 left-1/3 w-[36rem] h-[36rem] rounded-full bg-sky-300/30 blur-3xl animate-float-drift pointer-events-none"
      />
      <div 
        className="absolute top-2/3 -left-20 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl animate-float-slow pointer-events-none"
      />
    </div>
  );
};
