/* ============================================================
   js/render/particles.js — Feather & Effect Particles
   ============================================================ */
window.ParticleSystem = (function () {
    'use strict';

    let particles = [];

    function emit(x, y, type, count) {
        for (let i = 0; i < (count || 5); i++) {
            particles.push(createParticle(x, y, type));
        }
    }

    function createParticle(x, y, type) {
        const base = {
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 4 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1
        };

        switch (type) {
            case 'feather':
                base.color = `hsl(${Math.random() * 30 + 30}, 20%, ${Math.random() * 30 + 70}%)`;
                base.vy = Math.random() * 1 + 0.5; // float down
                base.vx = (Math.random() - 0.5) * 2;
                base.size = Math.random() * 6 + 3;
                base.decay = 0.005;
                base.type = 'feather';
                break;
            case 'sparkle':
                base.color = `rgba(212, 168, 83, ${Math.random() * 0.5 + 0.5})`;
                base.size = Math.random() * 3 + 1;
                base.decay = 0.03;
                base.type = 'sparkle';
                break;
            case 'dust':
                base.color = `rgba(180, 160, 130, ${Math.random() * 0.3 + 0.1})`;
                base.size = Math.random() * 8 + 4;
                base.vy = -Math.random() * 0.5;
                base.decay = 0.008;
                base.type = 'dust';
                break;
            case 'heart':
                base.color = '#ec407a';
                base.vy = -Math.random() * 2 - 1;
                base.size = Math.random() * 6 + 4;
                base.decay = 0.015;
                base.type = 'heart';
                break;
            default:
                base.color = '#ffffff';
                base.type = 'generic';
        }
        return base;
    }

    function update(deltaTime) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.rotation += p.rotSpeed;

            // Gravity for feathers
            if (p.type === 'feather') {
                p.vx += Math.sin(p.rotation) * 0.02; // slight sway
            }

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function render(ctx) {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.type === 'feather') {
                // Elongated feather shape
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 0.3, p.size, 0, 0, Math.PI * 2);
                ctx.fill();
                // Center line
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(0, p.size);
                ctx.stroke();
            } else if (p.type === 'heart') {
                ctx.fillStyle = p.color;
                ctx.font = `${p.size}px serif`;
                ctx.fillText('❤', -p.size / 2, p.size / 2);
            } else if (p.type === 'sparkle') {
                ctx.fillStyle = p.color;
                // 4-point star
                const s = p.size;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.3, -s * 0.3);
                ctx.lineTo(s, 0);
                ctx.lineTo(s * 0.3, s * 0.3);
                ctx.lineTo(0, s);
                ctx.lineTo(-s * 0.3, s * 0.3);
                ctx.lineTo(-s, 0);
                ctx.lineTo(-s * 0.3, -s * 0.3);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    function clear() { particles = []; }
    function getCount() { return particles.length; }

    return { emit, update, render, clear, getCount };
})();
