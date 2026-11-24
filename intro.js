(() => {
    'use strict';

    const root = document.documentElement;
    if (!root.classList.contains('intro-pending')) return;

    const overlay = document.querySelector('.intro');
    const svg = overlay.querySelector('svg');
    const ink = document.getElementById('ink-shape');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const duration = 1250;
    const fallDuration = 400;
    const tau = Math.PI * 2;
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const mix = (a, b, t) => a + (b - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);
    let frame;
    let started;
    let finished = false;
    let width = 0;
    let height = 0;

    function measure() {
        const bounds = overlay.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // Smooth closed cubic curve through an asymmetric, low-frequency outline.
    // No filter, raster assets, secondary droplets or simulated splashes.
    function contour(cx, cy, radius, progress, stretch) {
        const points = [];
        const count = 20;
        const organic = smooth(clamp(progress * 2.2));
        for (let i = 0; i < count; i++) {
            const a = i * tau / count;
            const variation =
                0.062 * Math.sin(3 * a + 0.6 + progress * 0.8) +
                0.034 * Math.cos(5 * a - 0.8 - progress * 0.7) +
                0.025 * Math.sin(2 * a - 1.1);
            const r = radius * (1 + organic * variation);
            points.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * stretch]);
        }
        const fmt = (x) => x.toFixed(2);
        let d = `M${fmt(points[0][0])},${fmt(points[0][1])}`;
        for (let i = 0; i < count; i++) {
            const p0 = points[(i + count - 1) % count];
            const p1 = points[i];
            const p2 = points[(i + 1) % count];
            const p3 = points[(i + 2) % count];
            const c1 = p1.map((v, k) => v + (p2[k] - p0[k]) / 6);
            const c2 = p2.map((v, k) => v - (p3[k] - p1[k]) / 6);
            d += `C${fmt(c1[0])},${fmt(c1[1])} ${fmt(c2[0])},${fmt(c2[1])} ${fmt(p2[0])},${fmt(p2[1])}`;
        }
        return d + 'Z';
    }

    function draw(elapsed) {
        const cx = width / 2;
        const cy = height / 2;
        const drop = Math.max(4, Math.min(7, width * 0.008));
        if (elapsed < fallDuration) {
            const t = clamp(elapsed / fallDuration);
            const y = mix(height * 0.18, cy, t * t);
            const r = drop * mix(0.55, 1, smooth(clamp(t * 4)));
            ink.setAttribute('d', contour(cx, y, r, 0, mix(1.35, 1, t)));
            return;
        }
        const t = clamp((elapsed - fallDuration) / (duration - fallDuration));
        // Accelerate gently so the corners disappear near the end of the beat.
        const eased = t * t * (2 - t);
        const coverage = Math.hypot(cx, cy) * 1.25 + 8;
        const r = mix(drop, coverage, eased);
        ink.setAttribute('d', contour(cx, cy, r, t, 1));
    }

    function finish(reveal) {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', measure);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('focusin', onFocus);
        motion.removeEventListener('change', onMotion);
        if (reveal && root.classList.contains('intro-pending')) {
            // Commit the fully covered frame before starting text transitions.
            draw(duration);
            root.classList.add('intro-reveal');
            void root.offsetWidth;
            root.classList.remove('intro-pending');
            window.setTimeout(() => root.classList.remove('intro-reveal'), 570);
        } else {
            root.classList.remove('intro-pending', 'intro-reveal');
        }
    }

    function onKey(event) { if (event.key === 'Tab' || event.key === 'Escape') finish(false); }
    function onFocus() { finish(false); }
    function onMotion(event) { if (event.matches) finish(false); }

    function tick(now) {
        if (!root.classList.contains('intro-pending')) { finish(false); return; }
        if (started === undefined) started = now;
        const elapsed = now - started;
        if (elapsed >= duration) { finish(true); return; }
        draw(elapsed);
        frame = requestAnimationFrame(tick);
    }

    if (motion.matches) { finish(false); return; }
    measure();
    draw(0);
    window.addEventListener('resize', measure);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocus);
    motion.addEventListener('change', onMotion);
    frame = requestAnimationFrame(tick);
})();
