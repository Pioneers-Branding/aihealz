'use client';

import { useEffect, useRef } from 'react';

/**
 * Neural Network Background Animation
 *
 * Subtle, responsive to mouse movement.
 * Uses Canvas2D for performance (no Three.js dependency).
 * Particles connect with glowing lines when close.
 */

interface Props {
    className?: string;
    particleCount?: number;
    color?: string;
}

export default function NeuralBackground({
    className = '',
    particleCount = 80,
    color = '#3b82f6',
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: Array<{
            x: number; y: number;
            vx: number; vy: number;
            size: number; opacity: number;
        }> = [];

        function resize() {
            if (!canvas) return;
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        function initParticles() {
            if (!canvas) return;
            particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            }));
        }

        function animate() {
            if (!canvas || !ctx) return;
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            // Update + draw particles
            for (const p of particles) {
                // Mouse attraction (subtle)
                const dx = mx - p.x;
                const dy = my - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    p.vx += dx / dist * 0.01;
                    p.vy += dy / dist * 0.01;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Dampen
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Wrap
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${color}${Math.round(p.opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        }

        function handleMouseMove(e: MouseEvent) {
            const rect = canvas!.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        resize();
        initParticles();
        animate();

        window.addEventListener('resize', () => { resize(); initParticles(); });
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [particleCount, color]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
            style={{ zIndex: 0 }}
        />
    );
}
