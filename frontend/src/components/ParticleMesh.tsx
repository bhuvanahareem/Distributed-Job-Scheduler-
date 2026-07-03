import React, { useEffect, useRef } from 'react';

export const ParticleMesh: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let mouse = { x: -1000, y: -1000 };

    const initCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    };

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 1;
        this.color = 'rgba(255, 255, 255, 0.15)';
      }

      update() {
        this.baseX += this.vx;
        this.baseY += this.vy;

        if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
        if (this.baseY < 0 || this.baseY > height) this.vy *= -1;

        const dx = mouse.x - this.baseX;
        const dy = mouse.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 180;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          // Warp towards mouse slightly
          this.x = this.baseX + dx * force * 0.15;
          this.y = this.baseY + dy * force * 0.15;
          
          const blend = force;
          // #004fe2 is rgb(0, 79, 226)
          const r = Math.floor(255 - (255 - 0) * blend);
          const g = Math.floor(255 - (255 - 79) * blend);
          const b = Math.floor(255 - (255 - 226) * blend);
          const a = 0.15 + blend * 0.6;
          this.color = `rgba(${r}, ${g}, ${b}, ${a})`;
        } else {
          this.x += (this.baseX - this.x) * 0.05;
          this.y += (this.baseY - this.y) * 0.05;
          this.color = 'rgba(255, 255, 255, 0.15)';
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((width * height) / 8000); 
      for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push(new Particle(x, y));
      }
    };

    const drawLines = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            const mouseDistI = Math.sqrt((mouse.x - particles[i].x) ** 2 + (mouse.y - particles[i].y) ** 2);
            const mouseDistJ = Math.sqrt((mouse.x - particles[j].x) ** 2 + (mouse.y - particles[j].y) ** 2);
            
            const opacity = (1 - distance / 120) * 0.15;
            
            if (mouseDistI < 180 || mouseDistJ < 180) {
               ctx.strokeStyle = `rgba(0, 79, 226, ${opacity * 4})`;
            } else {
               ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            }
            
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      drawLines();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', initCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    initCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', initCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: 'auto' }}
    />
  );
};
