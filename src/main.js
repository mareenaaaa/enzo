/**
 * Enso 8 - Cinematic Video Experience
 */

const videoEl = document.getElementById('bg-video');
let state = 'scatter'; // scatter | intro | about | services | portfolios | etc
let isAnimating = false;

const trigger = document.getElementById('experience-trigger');
const stabilizedLogo = document.getElementById('stabilized-logo');

// Custom Cursor Setup
const cursor = document.createElement('div');
cursor.id = 'custom-cursor';
document.body.appendChild(cursor);

window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Interactive hover effects for cursor
const hoverTargets = document.querySelectorAll('a, button, .hover-target');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});


function isVertical() {
    return window.innerHeight > window.innerWidth;
}

// Ensure paths work whether using Vite (npm run dev) or Live Server (Port 5500/5501)
const ROOT = (window.location.port === '5500' || window.location.port === '5501') ? './public' : '';

function getVideoSrc(pageId, isReverse = false) {
    const orientation = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
    
    if (pageId === 'intro') {
        return `${ROOT}/videos/intro.mp4`;
    }
    
    if (pageId === 'about') {
        const ext = (orientation === 'horizontal' && !isReverse) ? 'webm' : 'mp4';
        return `${ROOT}/videos/about ${orientation}${isReverse ? ' reverse' : ''}.${ext}`;
    }

    if (pageId === 'portfolios') {
        return `${ROOT}/videos/horizontal utility.mp4`;
    }
    
    if (pageId === 'contact') {
        return `${ROOT}/videos/contact ${orientation}${isReverse ? ' reverse' : ''}.mp4`;
    }
    
    return `${ROOT}/videos/${orientation} utility.mp4`;
}

function playVideo(src, onComplete, seamless = false) {
    const startPlayback = () => {
        videoEl.src = src;
        videoEl.load();
        videoEl.loop = false;
        
        let playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                if (!seamless) gsap.to(videoEl, { opacity: 1, duration: 0.5 });
            }).catch(error => {
                console.log("Auto-play was prevented", error);
            });
        }
        
        // Use an event listener for better reliability
        videoEl.addEventListener('ended', () => {
            if (onComplete) onComplete();
        }, { once: true });
        
        // Backup timeout in case ended doesn't fire precisely
        videoEl.addEventListener('timeupdate', () => {
             if(videoEl.duration > 0 && videoEl.currentTime >= videoEl.duration - 0.2) {
                 if (onComplete) {
                     onComplete();
                     onComplete = null; // prevent double firing
                 }
             }
        });
    };

    if (seamless) {
        startPlayback();
    } else {
        gsap.to(videoEl, { opacity: 0, duration: 0.3, onComplete: startPlayback });
    }
}

function playIntro() {
    if(isAnimating) return;
    isAnimating = true;
    state = 'intro';

    // Scale down the intro drastically so the massive native logo appears premium and minimal
    gsap.set(videoEl, { scale: 0.45 });

    // Play intro video as the opening website sequence
    playVideo(getVideoSrc('intro'), () => {
        state = 'stabilize';
        
        // Final UI reveal after intro completes
        gsap.to('#center-nav', { 
            opacity: 1, 
            pointerEvents: 'auto',
            duration: 2, 
            ease: "power2.out"
        });
        
        gsap.to(document.getElementById('status-label'), { opacity: 1, duration: 2 });
        
        isAnimating = false;
    });
}

// Auto-play the intro sequence immediately on load instead of waiting for scroll
window.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure everything is ready and avoid harsh loading blinks
    setTimeout(playIntro, 500);
});

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

function initNavSystems() {
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const targetId = link.getAttribute('data-target');
            
            if (targetId === 'experience-trigger') {
                window.location.reload(); 
                return;
            }
            
            const pageId = targetId.split('-')[0];
            startVideoTransition(pageId);
        });
    });
}
initNavSystems();

function startVideoTransition(pageId) {
    if (state === pageId) return;
    state = pageId;
    
    // UI Layout Shift
    gsap.to("#hero-ui", { filter: "blur(12px)", opacity: 0, duration: 1, ease: "power2.inOut", onComplete: () => {
        const heroUi = document.getElementById('hero-ui');
        if (heroUi) heroUi.style.display = "none";
    }});
    gsap.to("#center-nav", { opacity: 0, pointerEvents: 'none', duration: 1 });
    gsap.to(document.getElementById('status-label'), { opacity: 0, duration: 1 });
    
    // Shift video up specifically for 'about' page so symbol moves up, otherwise center
    const targetY = pageId === 'about' ? "-5vh" : "0vh";
    gsap.to(videoEl, { scale: 1, y: targetY, duration: 1, ease: "power2.inOut" });
    
    if (pageId === 'about') {
        document.body.classList.add('anti-gravity-active');
    }

    // Pass seamless = true to avoid fading through black, creating a perfect cut from the logo
    playVideo(getVideoSrc(pageId), () => {
        const section = document.getElementById(pageId + '-section');
        if(section) {
            section.classList.add('active');
            section.style.pointerEvents = 'auto'; 
            gsap.to(section, { opacity: 1, duration: 2, ease: "power2.out" });
            
            if (pageId === 'about') {
                gsap.to(".manifesto-text", { opacity: 1, visibility: "visible", y: -20, duration: 2 });
                gsap.to('.reveal-text', { opacity: 1, y: 0, stagger: 0.3, duration: 1.5 });
            }

            if (pageId === 'portfolios') {
                // Reset scroll position
                const portfolioSec = document.getElementById('portfolios-section');
                if (portfolioSec) portfolioSec.scrollTop = 0;
                
                // Content is now static per user request
            }
        }
    });
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
initScrollReveals();

function backToHome() {
    if (isAnimating) return;
    
    const teamSec = document.getElementById('team-section');
    const isFromTeam = teamSec && teamSec.style.opacity === "1" || teamSec.classList.contains('active');

    if (isFromTeam) {
        isAnimating = true;
        // Step 1: Reverse back to About manifesto UI
        gsap.to(teamSec, { opacity: 0, duration: 0.8, onComplete: () => {
            teamSec.style.pointerEvents = 'none';
        }});
        
        gsap.to('.about-content', { 
            opacity: 1, 
            scale: 1, 
            duration: 1, 
            pointerEvents: 'auto',
            onComplete: () => {
                // Step 2: Automatic delay before proceeding to Home
                setTimeout(() => {
                    isAnimating = false; // Allow the final stage
                    executeFinalReverse();
                }, 1200); // 1.2s "breathing space" on About Manifesto
            }
        });
    } else {
        executeFinalReverse();
    }
}

function executeFinalReverse() {
    if (isAnimating) return;
    isAnimating = true;

    // Fade out current sections
    const activeSection = document.querySelector('.scroll-section.active');
    const aboutContent = document.querySelector('.about-content');

    if (activeSection) {
        gsap.to(activeSection, { opacity: 0, duration: 0.8, onComplete: () => {
            activeSection.classList.remove('active');
            activeSection.style.pointerEvents = 'none';
        }});
    }
    
    // Ensure about content is also faded out
    if (aboutContent) {
        gsap.to(aboutContent, { opacity: 0, duration: 0.8 });
    }

    // Play reverse video
    const reverseSrc = getVideoSrc('about', true); 
    playVideo(reverseSrc, () => {
        // Restore landing UI
        const heroUi = document.getElementById('hero-ui');
        if (heroUi) {
            heroUi.style.display = "flex";
            gsap.to(heroUi, { filter: "blur(0px)", opacity: 1, duration: 1.5, ease: "power2.out" });
        }
        
        gsap.to(videoEl, { scale: 0.45, y: "0vh", duration: 1.5, ease: "power2.inOut" });
        
        gsap.to('#center-nav', { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.5 });
        gsap.to(document.getElementById('status-label'), { opacity: 1, duration: 1.5 });
        
        state = 'stabilize';
        isAnimating = false;
        document.body.classList.remove('anti-gravity-active');
    }, true); 
}

document.addEventListener('DOMContentLoaded', () => {
    // Brand Home Trigger Listener
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('brand-home-trigger')) {
            e.preventDefault();
            backToHome();
        }
    });

    // Handle Meet The Team Click
    const meetTeamBtn = document.getElementById('meet-team-btn');
    if (meetTeamBtn) {
        meetTeamBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // hide about content, show team section
            gsap.to('.about-content', { opacity: 0, scale: 0.95, duration: 0.8, pointerEvents: 'none' });
            const teamSec = document.getElementById('team-section');
            teamSec.style.pointerEvents = 'auto';
            gsap.to(teamSec, { opacity: 1, duration: 1.5, ease: "power2.out" });
            
            // Stagger animation for members
            gsap.fromTo('.team-col .member', 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "back.out(1.7)", delay: 0.5 }
            );
        });
    }
});
