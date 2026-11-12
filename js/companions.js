// Cute Companions, Canvas Floating Particles, and Interactive Reactions

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initPetInteractions();
  initHeartBurst();
});

/* =========================================
   CANVAS BACKGROUND PARTICLES (Hearts, Stars, Bubbles)
========================================= */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(24, Math.floor(width / 50));
  const colors = ['#ffd1dc', '#ffe3e8', '#fff3cd', '#ede9fe', '#dcfce7', '#ffe2d4'];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 80;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.25;
      this.type = Math.random() > 0.5 ? 'heart' : 'circle';
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;

      if (this.type === 'heart') {
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.2, 0, s);
        ctx.bezierCurveTo(s, s * 0.2, s * 0.5, -s * 0.3, 0, s * 0.3);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * height; // initial spread
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* =========================================
   INTERACTIVE PET COMPANIONS
========================================= */
function initPetInteractions() {
  const puppy = document.querySelector('.puppy-companion');
  const puppyBubble = document.getElementById('puppyBubble');

  const kitten = document.querySelector('.kitten-companion');
  const kittenBubble = document.getElementById('kittenBubble');

  const puppyQuotes = [
    "Woof! 🐾",
    "You're doing great! 💖",
    "Hehe, pat pat! 🐶",
    "Wagging my tail for you! ✨",
    "Keep smiling! 🌸"
  ];

  const kittenQuotes = [
    "Purrr~ 💖",
    "So cozy... 💤",
    "Sending soft headbutts! 🐱",
    "Mew! ✨",
    "You are so loved! 🌸"
  ];

  function showBubble(bubble, quotes, soundFn) {
    if (!bubble) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    bubble.textContent = randomQuote;
    bubble.classList.add('active');

    if (soundFn && window.soundCtrl) {
      soundFn();
    }

    clearTimeout(bubble._timer);
    bubble._timer = setTimeout(() => {
      bubble.classList.remove('active');
    }, 2400);
  }

  if (puppy) {
    puppy.addEventListener('click', () => {
      showBubble(puppyBubble, puppyQuotes, () => window.soundCtrl.playPop());
      puppy.style.transform = 'translateY(-22px) scale(1.15) rotate(-4deg)';
      setTimeout(() => {
        puppy.style.transform = '';
      }, 400);
    });
  }

  if (kitten) {
    kitten.addEventListener('click', () => {
      showBubble(kittenBubble, kittenQuotes, () => window.soundCtrl.playHappyPurr());
      kitten.style.transform = 'translateY(-12px) scale(1.15) rotate(4deg)';
      setTimeout(() => {
        kitten.style.transform = '';
      }, 400);
    });
  }

  // Page 6 Polaroid Memory Photo Reaction
  const polaroid = document.getElementById('polaroidMemory');
  if (polaroid) {
    polaroid.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.soundCtrl) {
        window.soundCtrl.playPop();
      }
      polaroid.style.transform = 'rotate(2.5deg) scale(1.08)';
      setTimeout(() => {
        polaroid.style.transform = '';
      }, 350);

      const rect = polaroid.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const polaroidSparkles = ['💖', '✨', '🌸', '🐾', '⭐', '🦷'];
      for (let i = 0; i < 14; i++) {
        createBurstParticle(originX, originY, polaroidSparkles[i % polaroidSparkles.length], 100, 40);
      }
    });
  }
}

/* =========================================
   HEART BURST FOR "SEND LOVE" BUTTON
========================================= */
function initHeartBurst() {
  const btn = document.getElementById('btnSendLove');
  if (!btn) return;

  const heartIcons = ['💖', '💕', '✨', '🐾', '🌸', '🧸', '💌', '⭐'];

  btn.addEventListener('click', (e) => {
    if (window.soundCtrl) {
      window.soundCtrl.playHappyPurr();
    }

    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 28; i++) {
      createBurstParticle(originX, originY, heartIcons[i % heartIcons.length], 180, 80);
    }

    // Button sweet bounce
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 250);
  });
}

function createBurstParticle(x, y, char, maxDist = 180, minDist = 80) {
  const el = document.createElement('div');
  el.className = 'floating-particle';
  el.textContent = char;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${Math.random() * 16 + 18}px`;

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * maxDist + minDist;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance - 80;
  const tr = (Math.random() - 0.5) * 80;

  el.style.setProperty('--tx', `${tx}px`);
  el.style.setProperty('--ty', `${ty}px`);
  el.style.setProperty('--tr', `${tr}deg`);

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1600);
}
