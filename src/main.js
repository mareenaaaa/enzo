/**
 * Enso 8 - Cinematic Minimal Experience
 * Premium Particle System & GSAP Transitions
 */

// --- Constants & Config ---
const MAIN_PARTICLE_COUNT = 15000;
const AMBIENT_PARTICLE_COUNT = 4000;
const NEON_CYAN = 0x00f0ff;
const DEEP_BLUE = 0x0066ff;
const LOGO_RADIUS = 3.6;

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.id = 'canvas'; // Required for direct GSAP styling
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Particle Systems ---

// 1. Ambient Background Particles (Always floating)
const ambientGeometry = new THREE.BufferGeometry();
const ambientPositions = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
const ambientVelocities = new Float32Array(AMBIENT_PARTICLE_COUNT);

for(let i=0; i < AMBIENT_PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    ambientPositions[i3] = (Math.random() - 0.5) * 40;
    ambientPositions[i3+1] = (Math.random() - 0.5) * 40;
    ambientPositions[i3+2] = (Math.random() - 0.5) * 20;
    ambientVelocities[i] = 0.005 + Math.random() * 0.01;
}
ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
const ambientMaterial = new THREE.PointsMaterial({
    size: 0.012,
    color: DEEP_BLUE,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const ambientSystem = new THREE.Points(ambientGeometry, ambientMaterial);
scene.add(ambientSystem);

// 2. Core Logo Particles (The ones that morph)
const logoGeometry = new THREE.BufferGeometry();
const currentPositions = new Float32Array(MAIN_PARTICLE_COUNT * 3);
const scatteredPositions = new Float32Array(MAIN_PARTICLE_COUNT * 3);
const targetPositions = new Float32Array(MAIN_PARTICLE_COUNT * 3);

// Initialize with random floaters
for(let i=0; i < MAIN_PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const r = 5 + Math.random() * 15;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    
    scatteredPositions[i3] = r * Math.sin(theta) * Math.cos(phi);
    scatteredPositions[i3+1] = r * Math.sin(theta) * Math.sin(phi);
    scatteredPositions[i3+2] = r * Math.cos(theta);
    
    currentPositions[i3] = scatteredPositions[i3];
    currentPositions[i3+1] = scatteredPositions[i3+1];
    currentPositions[i3+2] = scatteredPositions[i3+2];
}

logoGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
const logoMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: NEON_CYAN,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});
const logoSystem = new THREE.Points(logoGeometry, logoMaterial);
scene.add(logoSystem);

// --- Shape Generation Logic ---
function generateLogo() {
    const ptsPerShape = Math.floor(MAIN_PARTICLE_COUNT / 3);
    
    // 1. Enso Ring - Thicker and more cinematic
    for(let i=0; i < ptsPerShape; i++) {
        const i3 = i * 3;
        const angle = (i / ptsPerShape) * Math.PI * 1.88 - (Math.PI * 0.95);
        const thickness = (Math.random() - 0.5) * 0.15; // Added visual weight
        targetPositions[i3] = Math.cos(angle) * (LOGO_RADIUS + thickness);
        targetPositions[i3+1] = Math.sin(angle) * (LOGO_RADIUS + thickness);
        targetPositions[i3+2] = (Math.random() - 0.5) * 0.1;
    }
    
    // 2. Diamond (Core top) - Perfectly proportioned
    for(let i=ptsPerShape; i < ptsPerShape * 2; i++) {
        const i3 = i * 3;
        const size = 0.72; // Larger to match reference
        const offsetX = 0;
        const offsetY = 0.8;
        
        const side = i % 4;
        const t = Math.random();
        const jitter = (Math.random() - 0.5) * 0.08;
        let x, y;
        if(side === 0) { x = t; y = 1-t; }
        else if(side === 1) { x = 1-t; y = -t; }
        else if(side === 2) { x = -t; y = -(1-t); }
        else { x = -(1-t); y = t; }

        targetPositions[i3] = (x * size + offsetX) + jitter;
        targetPositions[i3+1] = (y * size + offsetY) + jitter;
        targetPositions[i3+2] = (Math.random() - 0.5) * 0.08;
    }
    
    // 3. Inner Circle (Core bottom) - Solid and balanced
    for(let i=ptsPerShape * 2; i < MAIN_PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const r = 0.82 + (Math.random() - 0.5) * 0.12; // Slightly larger for better visual balance
        const offsetX = 0;
        const offsetY = -1.1; 
        targetPositions[i3] = Math.cos(angle) * r + offsetX;
        targetPositions[i3+1] = Math.sin(angle) * r + offsetY;
        targetPositions[i3+2] = (Math.random() - 0.5) * 0.1;
    }
}
generateLogo();

// --- Abstract Human Head Generation (About Us) ---
const headPositions = new Float32Array(MAIN_PARTICLE_COUNT * 3);
function generateHeadShape() {
    for (let i = 0; i < MAIN_PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let x, y, z;
        let valid = false;
        
        while (!valid) {
            x = (Math.random() - 0.5) * 4;
            y = (Math.random() - 0.5) * 4;
            z = (Math.random() - 0.5) * 0.8;
            
            const dx = x;
            const dy = y - 0.6;
            const cranium = (dx*dx*0.9 + dy*dy*1.1 + z*z < 1.0);
            
            let face = false;
            // Face pointing right (x > 0)
            if (x > 0 && x < 1.2 && y > -0.8 && y <= 0.6 && Math.abs(z) < 0.4) {
               if (x < 1.0 + y * 0.2) face = true;
            }
            
            let neck = false;
            if (x > -0.5 && x < 0.3 && y > -1.5 && y <= -0.5 && Math.abs(z) < 0.3) {
                neck = true;
            }
            
            if (cranium || face || neck) {
                valid = true;
                // Hollow out center roughly (star)
                const cx = 0.2, cy = 0.0;
                const distToC = Math.abs(x - cx) + Math.abs(y - cy);
                if (distToC < 0.35 && Math.abs(z) < 0.4) valid = false;
            }
        }
        headPositions[i3] = x * 2.5; 
        headPositions[i3+1] = y * 2.5;
        headPositions[i3+2] = z * 2.5;
    }
}
generateHeadShape();

camera.position.z = 8;

// --- Interaction Logic ---
let state = 'scatter'; // scatter | inhale | stabilize
let isAnimating = false;

const trigger = document.getElementById('experience-trigger');
const prompt = document.getElementById('interaction-prompt');
const nav = document.getElementById('navigation-menu');
const stabilizedLogo = document.getElementById('stabilized-logo');

function inhale() {
    if(isAnimating) return;
    isAnimating = true;
    state = 'inhale';
    prompt.style.opacity = '0';

    // 1. Morph to Logo
    const startPos = new Float32Array(currentPositions);
    const proxy = { t: 0 };
    
    gsap.to(proxy, {
        t: 1,
        duration: 3,
        ease: "power4.inOut",
        onUpdate: () => {
            for(let i=0; i<currentPositions.length; i++) {
                currentPositions[i] = startPos[i] + (targetPositions[i] - startPos[i]) * proxy.t;
            }
            logoGeometry.attributes.position.needsUpdate = true;
        }
    });

    // 2. Cinematic Blur & Staggered 'Drawing' Feel
    // Instead of one big blur, we sweep the circle drawing
    gsap.to(logoMaterial, { 
        size: 0.08, 
        opacity: 0.1, 
        duration: 1.2, 
        yoyo: true, 
        repeat: 1, 
        ease: "power2.inOut" 
    });

    // Outer Circle 'Drawing' Animation (progressive reveal)
    const ptsPerShape = Math.floor(MAIN_PARTICLE_COUNT / 3);
    // Actually, simple way is to stagger their final 'stabilize' size
    
    // 3. Stabilization Reveal
    gsap.delayedCall(2.0, () => {
        state = 'stabilize';
        
        // Fade out particles accurately
        gsap.to(logoMaterial, { opacity: 0, duration: 2, ease: "power2.inOut" });

        // Fade in solid logo.png - Full visibility
        gsap.to(stabilizedLogo, { 
            opacity: 1, 
            duration: 3, 
            ease: "power2.out",
            onStart: () => {
                stabilizedLogo.style.display = "block";
            }
        });
        
        // Final UI reveal
        gsap.to(nav, { 
            opacity: 1, 
            scale: 1, 
            duration: 3, 
            ease: "expo.out",
            onStart: () => {
                document.getElementById('status-label').style.opacity = '1';
            }
        });
        
        isAnimating = false;
        startBreathing();
    });
}

function startBreathing() {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Breathing cycle for both the system and the solid image
    tl.to([logoSystem.scale, stabilizedLogo], { 
        x: 1.05, y: 1.05, z: 1.05, scale: 1.05,
        duration: 5, ease: "sine.inOut" 
    });
    
    // Subtle float for systemic feel
    tl.to(logoSystem.position, { y: 0.1, duration: 5, ease: "sine.inOut" }, 0);
}

// Trigger inhale transition on scroll/wheel
window.addEventListener('wheel', (e) => {
    if(state === 'scatter' && e.deltaY > 0) {
        inhale();
    }
}, { passive: true });

// Touch support for mobile devices
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if(state === 'scatter' && touchStartY > e.touches[0].clientY + 30) {
        inhale();
    }
}, { passive: true });

// --- Optional: Parallax & Glow ---
let mouseX = 0, mouseY = 0;
const mouseGlow = document.getElementById('mouse-glow');

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 200;
    mouseY = (e.clientY - window.innerHeight / 2) / 200;
    
    gsap.to(mouseGlow, {
        left: e.clientX,
        top: e.clientY,
        duration: 1.2,
        ease: "power2.out"
    });
});

// --- Main Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    // Ambient Slow Drift
    const time = Date.now() * 0.0001;
    ambientSystem.rotation.x = time * 0.1;
    ambientSystem.rotation.y = time * 0.15;
    
    // Slow camera lag parallax
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Initial scatter rotation
    if(state === 'scatter') {
        logoSystem.rotation.y += 0.002;
    } else if (state === 'about') {
        // Subtle floating drift
        logoSystem.rotation.y += 0.001; 
        logoSystem.position.y += Math.sin(Date.now() * 0.001) * 0.001;
    } else {
        logoSystem.rotation.y *= 0.95; // Stop spinning slowly
    }

    renderer.render(scene, camera);
}
animate();

// Resize handle
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Combined Navigation System matching the new HTML structure
function initNavSystems() {
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const targetId = link.getAttribute('data-target');
            
            if (targetId === 'experience-trigger') {
                window.location.reload(); // Simple robust home reset
                return;
            }
            
            if (targetId === 'about-section') {
                startAboutTransition();
            } else {
                // Extract pageId (e.g. 'services' from 'services-section')
                const pageId = targetId.split('-')[0];
                startGenericTransition(pageId);
            }
        });
    });
}
initNavSystems();

// DEVELOPMENT SHORTCUT:
// If you want the page to skip the hero entirely and start directly on the About Us screen, 
// simply uncomment the line below:
// startAboutTransition();

function startGenericTransition(pageId) {
    if (state === pageId) return;
    state = pageId;
    
    // The Layout Shift
    gsap.to("#hero-ui", { filter: "blur(12px)", opacity: 0, duration: 2, ease: "power2.inOut", onComplete: () => {
        document.getElementById('hero-ui').style.display = "none";
    }});
    gsap.to(document.getElementById('status-label'), { opacity: 0, duration: 1 });
    
    const aboutBg = document.getElementById('about-bg');
    if(aboutBg) aboutBg.style.opacity = '1';
    
    // Slight shift and distinct color mapping for generic pages
    gsap.to(logoSystem.position, { x: 0, y: 0, z: -2, duration: 4, ease: "power2.inOut" });
    if(pageId === 'services') gsap.to(logoMaterial.color, { r: 1.0, g: 0.2, b: 0.5, duration: 3 }); 
    if(pageId === 'contact') gsap.to(logoMaterial.color, { r: 0.2, g: 1.0, b: 0.5, duration: 3 }); 
    
    // Generic Scatter Morph
    for(let i=0; i < MAIN_PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        scatteredPositions[i3] = (Math.random() - 0.5) * 12;
        scatteredPositions[i3+1] = (Math.random() - 0.5) * 12;
        scatteredPositions[i3+2] = (Math.random() - 0.5) * 12;
    }
    
    const startPos2 = new Float32Array(currentPositions);
    const proxy2 = { t: 0 };
    gsap.to(proxy2, {
        t: 1, 
        duration: 2.5,
        ease: "expo.inOut",
        onUpdate: () => {
            for(let i=0; i<currentPositions.length; i++) {
                currentPositions[i] = startPos2[i] + (scatteredPositions[i] - startPos2[i]) * proxy2.t;
            }
            logoGeometry.attributes.position.needsUpdate = true;
        }
    });
    
    const section = document.getElementById(pageId + '-section');
    if(section) {
        section.classList.add('active');
        section.style.pointerEvents = 'auto'; // ensure clickabilty
        gsap.to(section, { opacity: 1, duration: 2, ease: "power2.out", delay: 1 });
        
        // Reveal Global Header
        gsap.to('#global-header', { opacity: 1, pointerEvents: 'auto', duration: 1, delay: 0.5 });
    }
}

function startAboutTransition() {
    state = 'about';
    
    // The Layout Shift (Matching your provided pattern)
    gsap.to("#hero-ui", { filter: "blur(12px)", opacity: 0, duration: 2, ease: "power2.inOut", onComplete: () => {
        document.getElementById('hero-ui').style.display = "none";
    }});
    gsap.to(document.getElementById('status-label'), { opacity: 0, duration: 1 });
    
    // Smooth transition of background
    const aboutBg = document.getElementById('about-bg');
    if(aboutBg) aboutBg.style.opacity = '1';
    
    console.log("Shatter sequence initiated...");
    
    // 4. Background Shift & CSS State (Deep Gradient + Blur)
    document.body.style.background = "radial-gradient(circle, #1a0b2e 0%, #000000 100%)";
    document.body.classList.add('anti-gravity-active');

    // 2. Disassemble the Logo into Fragments (GSAP)
    // We animate the position of every particle to a random 'drift' coordinate
    const scatterTarget = new Float32Array(MAIN_PARTICLE_COUNT * 3);
    for(let i=0; i<scatterTarget.length; i++) {
        scatterTarget[i] = currentPositions[i] + (Math.random() - 0.5) * 20; // Expanded to 20
    }
    const shatterStart = new Float32Array(currentPositions);
    const proxyShatter = { t: 0 };
    gsap.to(proxyShatter, {
        t: 1, duration: 3, ease: "expo.out",
        onUpdate: () => {
            for(let i=0; i<currentPositions.length; i++) {
                currentPositions[i] = shatterStart[i] + (scatterTarget[i] - shatterStart[i]) * proxyShatter.t;
            }
            logoGeometry.attributes.position.needsUpdate = true;
        }
    });

    // 2.5 Add the Anti-Gravity Blur & Bloom
    gsap.to("#canvas", { filter: "blur(10px) brightness(1.2)", duration: 2 });

    const aboutSection = document.getElementById('about-section');
    if(aboutSection) {
        aboutSection.classList.add('active');
        
        // Initial reveal of the section container
        gsap.to(aboutSection, { opacity: 1, duration: 2, ease: "power2.out" });

        // Reveal Global Header
        gsap.to('#global-header', { opacity: 1, pointerEvents: 'auto', duration: 1, delay: 0.5 });
        
        // 3. Fade in the Manifesto text (The 'About Us' content)
        gsap.to(".manifesto-text", {
            opacity: 1, 
            visibility: "visible", 
            y: -20, 
            duration: 2, 
            delay: 1 
        });
        
        // Trigger reveal-text elements with stagger logic as requested
        gsap.to('.reveal-text', {
            opacity: 1,
            y: 0,
            stagger: 0.3,
            duration: 1.5,
            delay: 1.5
        });
    }
}

function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal-text');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
        root: document.getElementById('about-section')
    });

    reveals.forEach(el => observer.observe(el));
}
