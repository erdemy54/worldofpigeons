/* ============================================================
   js/render/pigeon-sprite.js — Procedural Pigeon Sprites
   Draw pigeons on canvas using vector shapes (no images needed)
   ============================================================ */
window.PigeonSprite = (function () {
    'use strict';

    // Color palette for pigeon feathers
    const COLORS = {
        white:  { body: '#e8e0d0', wing: '#d4cfc0', head: '#f0ead8' },
        black:  { body: '#2a2a2a', wing: '#1a1a1a', head: '#333333' },
        blue:   { body: '#607d8b', wing: '#546e7a', head: '#78909c' },
        red:    { body: '#8b4513', wing: '#6d3410', head: '#a0522d' },
        yellow: { body: '#d4a853', wing: '#b8892a', head: '#e0be6e' },
        pied:   { body: '#e8e0d0', wing: '#607d8b', head: '#e8e0d0' },
        gray:   { body: '#9e9e9e', wing: '#757575', head: '#bdbdbd' }
    };

    function draw(ctx, x, y, options = {}) {
        const {
            color = 'blue',
            scale = 1,
            angle = 0,         // body tilt in radians
            wingPhase = 0,     // 0-1 wing flap cycle
            isFlying = true,
            direction = 1,     // 1 = right, -1 = left
            featheredFeet = false,
            crest = false
        } = options;

        const palette = COLORS[color] || COLORS.blue;
        const s = scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(direction, 1);
        ctx.rotate(angle);

        // Wing flap angle
        const wingAngle = isFlying ? Math.sin(wingPhase * Math.PI * 2) * 0.6 : -0.1;

        // === BODY (ellipse) ===
        ctx.fillStyle = palette.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 * s, 10 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.ellipse(2 * s, -3 * s, 12 * s, 5 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // === TAIL ===
        ctx.fillStyle = palette.wing;
        ctx.beginPath();
        ctx.moveTo(-18 * s, 0);
        ctx.lineTo(-28 * s, -4 * s);
        ctx.lineTo(-30 * s, 0);
        ctx.lineTo(-28 * s, 4 * s);
        ctx.closePath();
        ctx.fill();

        // === WINGS ===
        ctx.save();
        ctx.translate(0, -5 * s);
        ctx.rotate(wingAngle);

        // Upper wing
        ctx.fillStyle = palette.wing;
        ctx.beginPath();
        ctx.moveTo(-5 * s, 0);
        ctx.quadraticCurveTo(0, -22 * s, 15 * s, -18 * s);
        ctx.quadraticCurveTo(8 * s, -8 * s, 10 * s, 0);
        ctx.closePath();
        ctx.fill();

        // Wing feather details
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5 * s;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo((-2 + i * 4) * s, 0);
            ctx.quadraticCurveTo((i * 3) * s, -15 * s, (12 + i * 2) * s, (-16 + i * 2) * s);
            ctx.stroke();
        }

        ctx.restore();

        // Lower wing (mirrored, less angle)
        ctx.save();
        ctx.translate(0, 5 * s);
        ctx.rotate(-wingAngle * 0.6);

        ctx.fillStyle = palette.wing;
        ctx.beginPath();
        ctx.moveTo(-5 * s, 0);
        ctx.quadraticCurveTo(0, 18 * s, 12 * s, 14 * s);
        ctx.quadraticCurveTo(6 * s, 6 * s, 8 * s, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // === HEAD ===
        ctx.fillStyle = palette.head;
        ctx.beginPath();
        ctx.arc(18 * s, -2 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();

        // Crest
        if (crest) {
            ctx.fillStyle = palette.head;
            ctx.beginPath();
            ctx.moveTo(16 * s, -9 * s);
            ctx.lineTo(18 * s, -15 * s);
            ctx.lineTo(21 * s, -9 * s);
            ctx.closePath();
            ctx.fill();
        }

        // Eye
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(21 * s, -3 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(21.5 * s, -3.5 * s, 0.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#d4a853';
        ctx.beginPath();
        ctx.moveTo(24 * s, -2 * s);
        ctx.lineTo(29 * s, -1 * s);
        ctx.lineTo(24 * s, 1 * s);
        ctx.closePath();
        ctx.fill();

        // === FEET (visible when landing or perching) ===
        if (!isFlying) {
            ctx.strokeStyle = '#cc6600';
            ctx.lineWidth = 1.5 * s;
            ctx.lineCap = 'round';

            // Left foot
            ctx.beginPath();
            ctx.moveTo(-4 * s, 10 * s);
            ctx.lineTo(-4 * s, 16 * s);
            ctx.lineTo(-7 * s, 18 * s);
            ctx.moveTo(-4 * s, 16 * s);
            ctx.lineTo(-1 * s, 18 * s);
            ctx.stroke();

            // Right foot
            ctx.beginPath();
            ctx.moveTo(6 * s, 10 * s);
            ctx.lineTo(6 * s, 16 * s);
            ctx.lineTo(3 * s, 18 * s);
            ctx.moveTo(6 * s, 16 * s);
            ctx.lineTo(9 * s, 18 * s);
            ctx.stroke();

            if (featheredFeet) {
                ctx.fillStyle = palette.body;
                ctx.beginPath();
                ctx.ellipse(-4 * s, 14 * s, 3 * s, 4 * s, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(6 * s, 14 * s, 3 * s, 4 * s, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // Draw a flock of pigeons with formation
    function drawFlock(ctx, pigeons, centerX, centerY, time) {
        pigeons.forEach((p, i) => {
            const offsetX = (i % 4 - 1.5) * 50 + Math.sin(time * 2 + i) * 8;
            const offsetY = Math.floor(i / 4) * 35 + Math.cos(time * 1.5 + i * 0.7) * 6;
            const wingPhase = (time * 3 + i * 0.3) % 1;

            const breed = window.BreedsDB ? window.BreedsDB.getBreed(p.breedId) : null;
            const pigeonColor = p.genetics?.color?.phenotype || (breed ? breed.colors[0] : 'blue');
            const hasCrest = p.genetics?.crest?.phenotype === 'crest' || (breed && breed.physical.crest);
            const hasFeet = p.genetics?.featheredFeet?.phenotype === 'feathered' || (breed && breed.physical.featheredFeet);

            draw(ctx, centerX + offsetX, centerY + offsetY, {
                color: pigeonColor,
                scale: 0.8,
                wingPhase: wingPhase,
                isFlying: true,
                direction: Math.random() > 0.3 ? 1 : -1,
                crest: hasCrest,
                featheredFeet: hasFeet
            });
        });
    }

    return { draw, drawFlock, COLORS };
})();
