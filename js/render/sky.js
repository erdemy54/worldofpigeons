/* ============================================================
   js/render/sky.js — Sky Renderer
   Dynamic sky gradient with day/night cycle, clouds, stars
   ============================================================ */
window.SkyRenderer = (function () {
    'use strict';

    // Sky gradient presets for different times of day
    const SKY_GRADIENTS = {
        dawn:    [{ pos: 0, color: '#1a0a2e' }, { pos: 0.3, color: '#4a1942' }, { pos: 0.6, color: '#c84b31' }, { pos: 0.85, color: '#ffc996' }, { pos: 1, color: '#ffe5b4' }],
        morning: [{ pos: 0, color: '#0a1628' }, { pos: 0.4, color: '#1e3a5f' }, { pos: 0.7, color: '#4a90d9' }, { pos: 1, color: '#87ceeb' }],
        day:     [{ pos: 0, color: '#0d47a1' }, { pos: 0.3, color: '#1565c0' }, { pos: 0.6, color: '#42a5f5' }, { pos: 1, color: '#90caf9' }],
        afternoon: [{ pos: 0, color: '#0a1628' }, { pos: 0.4, color: '#1e3a5f' }, { pos: 0.7, color: '#5c9ce6' }, { pos: 1, color: '#a8d4f0' }],
        dusk:    [{ pos: 0, color: '#0a0a2e' }, { pos: 0.3, color: '#2e1065' }, { pos: 0.5, color: '#c62828' }, { pos: 0.75, color: '#ff8f00' }, { pos: 1, color: '#ffd54f' }],
        evening: [{ pos: 0, color: '#050510' }, { pos: 0.3, color: '#0a1628' }, { pos: 0.7, color: '#162a4a' }, { pos: 1, color: '#1a3a5c' }],
        night:   [{ pos: 0, color: '#000008' }, { pos: 0.3, color: '#050d1a' }, { pos: 0.7, color: '#0a1628' }, { pos: 1, color: '#0f1f38' }]
    };

    let clouds = [];
    let stars = [];
    let initialized = false;

    function init(canvas) {
        // Generate random clouds
        clouds = [];
        for (let i = 0; i < 8; i++) {
            clouds.push({
                x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
                y: Math.random() * canvas.height * 0.4 + canvas.height * 0.05,
                width: Math.random() * 150 + 80,
                height: Math.random() * 30 + 15,
                speed: Math.random() * 0.3 + 0.05,
                opacity: Math.random() * 0.3 + 0.1
            });
        }

        // Generate stars
        stars = [];
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }

        initialized = true;
    }

    function render(ctx, canvas, timeOfDay, deltaTime) {
        if (!initialized) init(canvas);

        const phase = timeOfDay || 'day';
        const gradient = SKY_GRADIENTS[phase] || SKY_GRADIENTS.day;

        // Draw sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.forEach(stop => skyGrad.addColorStop(stop.pos, stop.color));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars (visible during night/dusk/dawn)
        if (['night', 'evening', 'dusk', 'dawn'].includes(phase)) {
            const starAlpha = phase === 'night' ? 1 : phase === 'evening' ? 0.8 : 0.3;
            stars.forEach(star => {
                star.brightness += star.twinkleSpeed;
                const alpha = (Math.sin(star.brightness) * 0.5 + 0.5) * starAlpha;
                ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw sun/moon
        if (['morning', 'day', 'afternoon'].includes(phase)) {
            const sunX = canvas.width * 0.75;
            const sunY = canvas.height * 0.15;
            const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
            sunGrad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
            sunGrad.addColorStop(0.5, 'rgba(255, 220, 100, 0.4)');
            sunGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
            ctx.fillStyle = sunGrad;
            ctx.fillRect(sunX - 60, sunY - 60, 120, 120);
        } else if (phase === 'night') {
            const moonX = canvas.width * 0.8;
            const moonY = canvas.height * 0.12;
            ctx.fillStyle = 'rgba(220, 220, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
            ctx.fill();
            // Moon crescent
            ctx.fillStyle = SKY_GRADIENTS.night[0].color;
            ctx.beginPath();
            ctx.arc(moonX + 5, moonY - 2, 13, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw and update clouds
        clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > canvas.width + cloud.width) cloud.x = -cloud.width;

            const cloudColor = ['night', 'evening'].includes(phase) ? `rgba(30, 40, 60, ${cloud.opacity})` : `rgba(255, 255, 255, ${cloud.opacity})`;
            ctx.fillStyle = cloudColor;
            // Simple ellipse cloud shape
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cloud.x - cloud.width * 0.25, cloud.y + 5, cloud.width * 0.3, cloud.height * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.2, cloud.y + 3, cloud.width * 0.35, cloud.height * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ground/horizon line
        const groundY = canvas.height * 0.85;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
        if (['night', 'evening'].includes(phase)) {
            groundGrad.addColorStop(0, '#0a1a10');
            groundGrad.addColorStop(1, '#050d08');
        } else {
            groundGrad.addColorStop(0, '#2d5a27');
            groundGrad.addColorStop(1, '#1a3a15');
        }
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // City silhouette
        drawCitySilhouette(ctx, canvas, groundY, phase);
    }

    function drawCitySilhouette(ctx, canvas, groundY, phase) {
        const color = ['night', 'evening'].includes(phase) ? 'rgba(5, 10, 20, 0.8)' : 'rgba(20, 30, 50, 0.3)';
        ctx.fillStyle = color;

        // Simple building shapes
        const buildings = [
            { x: 0.05, w: 0.04, h: 0.08 },
            { x: 0.1, w: 0.03, h: 0.12 },
            { x: 0.15, w: 0.05, h: 0.06 },
            { x: 0.22, w: 0.02, h: 0.15 }, // minaret
            { x: 0.3, w: 0.06, h: 0.05 },
            { x: 0.38, w: 0.04, h: 0.09 },
            { x: 0.5, w: 0.08, h: 0.04 }, // dome
            { x: 0.6, w: 0.03, h: 0.11 },
            { x: 0.68, w: 0.05, h: 0.07 },
            { x: 0.75, w: 0.02, h: 0.14 }, // minaret
            { x: 0.82, w: 0.06, h: 0.06 },
            { x: 0.9, w: 0.04, h: 0.10 },
        ];

        buildings.forEach(b => {
            const bx = canvas.width * b.x;
            const bw = canvas.width * b.w;
            const bh = canvas.height * b.h;
            ctx.fillRect(bx, groundY - bh, bw, bh);
        });

        // Mosque dome
        ctx.beginPath();
        ctx.arc(canvas.width * 0.54, groundY - canvas.height * 0.04, canvas.width * 0.04, Math.PI, 0);
        ctx.fill();
    }

    return { init, render };
})();
