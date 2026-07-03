/* ============================================================
   js/render/camera.js — Camera Controller
   Pan, zoom, follow for flight scene
   ============================================================ */
window.CameraController = (function () {
    'use strict';

    let camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
    let viewMode = 'far'; // far | close

    function init(canvasWidth, canvasHeight) {
        camera.x = canvasWidth / 2;
        camera.y = canvasHeight / 2;
        camera.targetX = camera.x;
        camera.targetY = camera.y;
        camera.zoom = 1;
        camera.targetZoom = 1;
    }

    function setViewMode(mode) {
        viewMode = mode;
        if (mode === 'close') {
            camera.targetZoom = 2.0;
        } else {
            camera.targetZoom = 1.0;
        }
    }

    function followTarget(x, y) {
        camera.targetX = x;
        camera.targetY = y;
    }

    function update(deltaTime) {
        const lerp = 0.05;
        camera.x += (camera.targetX - camera.x) * lerp;
        camera.y += (camera.targetY - camera.y) * lerp;
        camera.zoom += (camera.targetZoom - camera.zoom) * lerp;
    }

    function applyTransform(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);
    }

    function getCamera() { return { ...camera }; }
    function getViewMode() { return viewMode; }

    return { init, setViewMode, followTarget, update, applyTransform, getCamera, getViewMode };
})();
