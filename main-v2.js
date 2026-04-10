/**
 * Enso 8 - Cinematic Video Experience (Pure Static)
 */

const videoEl = document.getElementById('bg-video');
let state = 'scatter'; // scatter | intro | about | services | portfolios | etc
let isAnimating = false;

const trigger = document.getElementById('experience-trigger');
const stabilizedLogo = document.getElementById('stabilized-logo');

// --- CUSTOM CURSOR SETUP ---
const cursor = document.createElement('div');
cursor.id = 'custom-cursor';
document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;
let mouseX_raw = 0, mouseY_raw = 0;
let lastSparkleTime = 0;
const mouseGlow = document.getElementById('mouse-glow');

function createSparkle(x, y) {
    const now = Date.now();
    if (now - lastSparkleTime < 30) return; // Limit spawn rate (30ms)
    lastSparkleTime = now;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    document.body.appendChild(sparkle);

    const size = Math.random() * 4 + 2;
    const destX = x + (Math.random() - 0.5) * 60;
    const destY = y + (Math.random() - 0.5) * 60;

    gsap.set(sparkle, { 
        left: x, 
        top: y, 
        width: size, 
        height: size, 
        opacity: 1, 
        scale: 1,
        rotation: Math.random() * 360
    });

    gsap.to(sparkle, {
        left: destX,
        top: destY,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 180,
        duration: Math.random() * 0.8 + 0.4,
        ease: "power2.out",
        onComplete: () => sparkle.remove()
    });
}

window.addEventListener('mousemove', (e) => {
    mouseX_raw = e.clientX;
    mouseY_raw = e.clientY;
    
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    createSparkle(e.clientX, e.clientY);

    // Update mouse glows if exists
    if (mouseGlow) {
        gsap.to(mouseGlow, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.4,
            ease: "power2.out"
        });
    }

    // Parallax values for logo or other elements
    mouseX = (e.clientX - window.innerWidth / 2) / 200;
    mouseY = (e.clientY - window.innerHeight / 2) / 200;
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

/**
 * Pure Static Asset Pathing
 * Use relative paths starting with ./ so it works via file:// and local servers
 */
function getVideoSrc(pageId, isReverse = false) {
    const orientation = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
    
    if (pageId === 'intro') {
        return './videos/intro.mp4';
    }
    
    if (pageId === 'about') {
        const ext = (orientation === 'horizontal' && !isReverse) ? 'webm' : 'mp4';
        return `./videos/about ${orientation}${isReverse ? ' reverse' : ''}.${ext}`;
    }

    if (pageId === 'portfolios') {
        return './videos/horizontal utility.mp4';
    }

    if (pageId === 'services') {
        return './videos/services.mp4';
    }
    
    if (pageId === 'contact') {
        const ext = (orientation === 'horizontal') ? 'webm' : 'mp4';
        return `./videos/contact ${orientation}${isReverse ? ' reverse' : ''}.${ext}`;
    }
    
    return `./videos/${orientation} utility.mp4`;
}

function playVideo(src, onComplete, seamless = false, shouldLoop = false) {
    const startPlayback = () => {
        videoEl.src = src;
        videoEl.load();
        videoEl.loop = shouldLoop;
        
        let playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                if (!seamless) gsap.to(videoEl, { opacity: 1, duration: 0.2 });
            }).catch(error => {
                console.log("Auto-play was prevented", error);
            });
        }
        
        if (shouldLoop) {
            // If looping, we call onComplete immediately after it starts playing
            if (onComplete) onComplete();
        } else {
            videoEl.addEventListener('ended', () => {
                if (onComplete) onComplete();
            }, { once: true });
        }
    };

    if (seamless) {
        startPlayback();
    } else {
        gsap.to(videoEl, { opacity: 0, duration: 0.1, onComplete: startPlayback });
    }
}

function playIntro() {
    if(isAnimating) return;
    isAnimating = true;
    state = 'intro';

    // Scale up the intro logo sequence
    gsap.set(videoEl, { scale: 0.75 });

    // Play intro video
    playVideo(getVideoSrc('intro'), () => {
        state = 'stabilize';
        
        // Final UI reveal
        gsap.to('#center-nav', { 
            opacity: 1, 
            pointerEvents: 'auto',
            duration: 0.67, 
            ease: "power2.out"
        });
        
        gsap.to(document.getElementById('status-label'), { opacity: 1, duration: 0.67 });
        
        isAnimating = false;
    });
}

// Start sequence when browser is ready
window.addEventListener('load', () => {
    // Slight delay to ensure CDN scripts (GSAP) and layout are fully parsed
    setTimeout(playIntro, 500);
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
    
    // UI Out
    gsap.to("#hero-ui", { filter: "blur(12px)", opacity: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => {
        const heroUi = document.getElementById('hero-ui');
        if (heroUi) heroUi.style.display = "none";
    }});
    // We want to keep the navbar visible during transitions to internal pages
    // gsap.to("#center-nav", { opacity: 0, pointerEvents: 'none', duration: 0.4 });
    gsap.to(document.getElementById('status-label'), { opacity: 0, duration: 0.4 });
    
    // Video positioning
    const targetY = pageId === 'about' ? "-5vh" : "0vh";
    gsap.to(videoEl, { scale: 1, y: targetY, duration: 0.4, ease: "power2.inOut" });
    
    if (pageId === 'about') {
        document.body.classList.add('anti-gravity-active');
    }

    const shouldLoop = pageId === 'services';

    playVideo(getVideoSrc(pageId), () => {
        const section = document.getElementById(pageId + '-section');
        if(section) {
            section.classList.add('active');
            section.style.pointerEvents = 'auto'; 
            gsap.to(section, { opacity: 1, duration: 0.67, ease: "power2.out" });
            
            // Ensure navbar is visible on internal pages
            gsap.to("#center-nav", { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
            
            if (pageId === 'about') {
                gsap.to('.reveal-text', { opacity: 1, y: 0, stagger: 0.1, duration: 0.53 });
            }

            if (pageId === 'contact') {
                // Staggered text reveal with glide-up
                gsap.fromTo('.contact-reveal', 
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
                );
                
                // Explicitly stop/pause video at the end of the motion (matched to new 2s clip)
                setTimeout(() => {
                    if (videoEl) videoEl.pause();
                }, 2000); 


            }

            if (pageId === 'portfolios') {
                const portfolioSec = document.getElementById('portfolios-section');
                if (portfolioSec) portfolioSec.scrollTop = 0;
                
                // Animate portfolio items entry
                gsap.fromTo('.portfolio-showcase-item',
                    { opacity: 0, y: 60 },
                    { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", delay: 0.2 }
                );
            }
        }
    }, false, shouldLoop);
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
    const isFromTeam = teamSec && (teamSec.style.opacity === "1" || teamSec.classList.contains('active'));

    if (isFromTeam) {
        isAnimating = true;
        // Fade out team
        gsap.to(teamSec, { opacity: 0, duration: 0.27, onComplete: () => {
            teamSec.style.pointerEvents = 'none';
        }});
        
        // Show manifesto UI temporarily
        gsap.to('.about-content', { 
            opacity: 1, 
            scale: 1, 
            duration: 0.4, 
            pointerEvents: 'auto',
            onComplete: () => {
                setTimeout(() => {
                    isAnimating = false;
                    executeFinalReverse();
                }, 1200);
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
        gsap.to(activeSection, { opacity: 0, duration: 0.27, onComplete: () => {
            activeSection.classList.remove('active');
            activeSection.style.pointerEvents = 'none';
        }});
    }
    
    if (aboutContent) {
        gsap.to(aboutContent, { opacity: 0, duration: 0.27 });
    }

    // Play reverse video
    const reverseSrc = getVideoSrc('about', true); 
    playVideo(reverseSrc, () => {
        const heroUi = document.getElementById('hero-ui');
        if (heroUi) {
            heroUi.style.display = "flex";
            gsap.to(heroUi, { filter: "blur(0px)", opacity: 1, duration: 0.53, ease: "power2.out" });
        }
        
        gsap.to(videoEl, { scale: 0.75, y: "0vh", duration: 0.53, ease: "power2.inOut" });
        
        gsap.to('#center-nav', { opacity: 1, pointerEvents: 'auto', duration: 0.53, delay: 0.1 });
        gsap.to(document.getElementById('status-label'), { opacity: 1, duration: 0.53 });
        
        state = 'stabilize';
        isAnimating = false;
        document.body.classList.remove('anti-gravity-active');
    }, true); 
}

// Global Brand Trigger
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('brand-home-trigger')) {
        e.preventDefault();
        backToHome();
    }
});

// Meet The Team Functionality
const meetTeamBtn = document.getElementById('meet-team-btn');
if (meetTeamBtn) {
    meetTeamBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const checkHash = () => {
            const hash = window.location.hash;
            if (hash === '#team') {
                const teamSec = document.getElementById('team-section');
                if (teamSec) {
                    gsap.set('.about-content', { opacity: 0, pointerEvents: 'none' });
                    gsap.set('#hero-ui', { display: 'none', opacity: 0 });
                    gsap.set('#center-nav', { opacity: 0, pointerEvents: 'none' });
                    
                    teamSec.style.pointerEvents = 'auto';
                    gsap.to(teamSec, { opacity: 1, duration: 0.33 });
                    gsap.fromTo('.member', 
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, stagger: 0.02, duration: 0.4, ease: "back.out(1.7)", delay: 0.13 }
                    );
                }
            }
        };
        window.addEventListener('hashchange', checkHash);
        checkHash();

        gsap.to('.about-content', { opacity: 0, scale: 0.95, duration: 0.27, pointerEvents: 'none' });
        const teamSec = document.getElementById('team-section');
        teamSec.style.pointerEvents = 'auto';
        gsap.to(teamSec, { opacity: 1, duration: 0.53, ease: "power2.out" });
        
        gsap.fromTo('.member', 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.02, duration: 0.4, ease: "back.out(1.7)", delay: 0.13 }
        );
    });
}

// Team Member Interaction Logic
const teamData = {
    thaha: { name: "Muhammed Thaha Jasmine", role: "CEO | Video Editor & DIT", bio: "Muhammed Thaha Jasmine is the CEO of Enso 8 and a seasoned video editor with over a decade of experience in cinematic storytelling." },
    mr: { name: "M R", role: "Creative Director", bio: "Visionary creative lead focusing on the intersection of brand identity and cinematic storytelling." },
    bharath: { name: "Bharath R", role: "Managing Director", bio: "Leading the operational and strategic growth of Enso 8." },
    amal: { name: "Amal Krishna", role: "Head of 3D Animation", bio: "Master of three-dimensional spaces, converting concepts into visual realities." },
    nibu: { name: "Nibu Samuel", role: "3D Animator", bio: "Intricate details of motion graphics that bring static designs to life." },
    prince: { name: "Prince Dirron", role: "COO", bio: "Ensuring world-class content is delivered on sync and on time." },
    athul_s: { name: "Athul Sudhakaran", role: "Editor", bio: "Focusing on narrative pacing and cinematic storytelling." },
    nandagopan: { name: "Nandagopan P", role: "Sound Mixing Engineer", bio: "Sculpting immersive sonic landscapes." },
    gokul: { name: "Gokul R", role: "Sound Designer", bio: "Creative custom audio environments." },
    adith: { name: "Adith C", role: "3D Generalist", bio: "Covering the entire 3D pipeline from concept to render." },
    akhil: { name: "Akhil K", role: "Senior Cinematographer", bio: "Defining the unique visual aesthetic of Enso 8." },
    akshay: { name: "Akshay K", role: "Cinematographer", bio: "Bringing a fresh perspective to framing and light." }
};

const teamMembers = document.querySelectorAll('.member');
const detailOverlay = document.getElementById('team-detail-overlay');
const closeBtn = document.querySelector('.detail-close-btn');

teamMembers.forEach(member => {
    member.addEventListener('click', () => {
        const key = member.getAttribute('data-member');
        const data = teamData[key];
        if (!data) return;

        document.getElementById('detail-name').innerText = data.name;
        document.getElementById('detail-role').innerText = data.role;
        document.getElementById('detail-bio').innerText = data.bio;
        
        const avatar = member.querySelector('.avatar');
        const bgImg = window.getComputedStyle(avatar).backgroundImage;
        const url = bgImg.slice(4, -1).replace(/"/g, "");
        document.getElementById('detail-img').src = url;

        detailOverlay.classList.add('active');
        gsap.from('.detail-info > *', { opacity: 0, y: 20, stagger: 0.03, duration: 0.33, ease: "power2.out" });
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        detailOverlay.classList.remove('active');
    });
}
