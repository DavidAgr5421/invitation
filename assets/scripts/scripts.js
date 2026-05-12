document.addEventListener('DOMContentLoaded', () => {

  // ── Music Player ─────────────────────────────────────────────────
  const audio    = document.getElementById('audio');
  const playIcon = document.getElementById('play-icon');
  const fill     = document.getElementById('fill');
  const thumb    = document.getElementById('thumb');
  const seek     = document.getElementById('seek');
  let playing = false;

  function togglePlay() {
    playing ? audio.pause() : audio.play();
    playing = !playing;
    playIcon.innerHTML = playing
      ? `<line x1="9" y1="7" x2="9" y2="17" stroke-width="2.5"/>
         <line x1="15" y1="7" x2="15" y2="17" stroke-width="2.5"/>`
      : `<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>`;
  }

  function updateBar() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width  = pct + '%';
    thumb.style.left  = pct + '%';
    seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
  }

  audio.addEventListener('timeupdate', updateBar);
  audio.addEventListener('ended', () => {
    playing = false;
    playIcon.innerHTML = `<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>`;
  });
  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  });

  window.togglePlay = togglePlay;
  window.updateBar  = updateBar;
  window.audio      = audio;

  // ── Countdown ────────────────────────────────────────────────────
  const target = new Date('2026-08-01T00:00:00');
  const prevVals = { days: null, hours: null, mins: null, secs: null };

  function popDigit(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 300);
  }

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) return;
    const vals = {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000)  / 60000),
      secs:  Math.floor((diff % 60000)    / 1000),
    };
    for (const [key, val] of Object.entries(vals)) {
      const el = document.getElementById(key);
      if (el) {
        el.textContent = val;
        if (prevVals[key] !== null && prevVals[key] !== val) popDigit(key);
        prevVals[key] = val;
      }
    }
  }

  tick();
  setInterval(tick, 1000);

  // ── RSVP form ────────────────────────────────────────────────────
  const STORAGE_KEY = 'rsvp_responses';
  let selectedOption = null;

  window.selectOption = function(val) {
    selectedOption = val;
    document.getElementById('btn-si').classList.toggle('selected', val === 'si');
    document.getElementById('btn-no').classList.toggle('selected', val === 'no');
  };

  window.guardarRespuesta = function() {
    const nombre = document.getElementById('guestName').value.trim();
    if (!nombre) {
      shakeInput('guestName');
      return;
    }
    if (!selectedOption) {
      shakeInput('btn-si');
      return;
    }

    // ── Save to localStorage ──────────────────────────────────────
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push({
      id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name:      nombre,
      option:    selectedOption,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    // ─────────────────────────────────────────────────────────────

    openModal(nombre, selectedOption);
  };

  function shakeInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }`;
  document.head.appendChild(shakeStyle);

  // ── Modal ────────────────────────────────────────────────────────
  function openModal(nombre, option) {
    const backdrop = document.getElementById('confirmModal');
    const msgEl    = document.getElementById('modal-message');
    const emojiEl  = document.getElementById('modal-emoji');

    if (option === 'si') {
      emojiEl.textContent = '🌸';
      msgEl.innerHTML =
        `<strong>${nombre}</strong>, ¡qué alegría que puedas acompañarme!<br>
         <span style="font-size:14px;opacity:0.8;">Te espero con el corazón lleno de ilusión en mi gran día.</span>`;
    } else {
      emojiEl.textContent = '🤍';
      msgEl.innerHTML =
        `<strong>${nombre}</strong>, te extrañaré mucho ese día.<br>
         <span style="font-size:14px;opacity:0.8;">Gracias por hacerme saber. ¡Te quiero mucho!</span>`;
    }

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    launchConfetti();
  }

  window.closeModal = function() {
    const backdrop = document.getElementById('confirmModal');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('confirmModal').addEventListener('click', function(e) {
    if (e.target === this) window.closeModal();
  });

  // ── Mini confetti burst ──────────────────────────────────────────
  function launchConfetti() {
    const colors = ['#c9a84c','#e8d9b0','#b8922a','#f5edda','#7a5a1e'];
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 7 + 4;
      dot.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:${Math.random()*100}%;
        top:${Math.random()*60}%;
        opacity:0;
        animation: confettiFall ${0.8 + Math.random()*0.8}s ease forwards;
        animation-delay:${Math.random()*0.3}s;
      `;
      container.appendChild(dot);
    }

    if (!document.getElementById('confetti-style')) {
      const s = document.createElement('style');
      s.id = 'confetti-style';
      s.textContent = `
        @keyframes confettiFall {
          0%   { opacity:0; transform: translateY(-30px) rotate(0deg) scale(0); }
          30%  { opacity:1; transform: translateY(10px) rotate(180deg) scale(1); }
          100% { opacity:0; transform: translateY(80px) rotate(360deg) scale(0.5); }
        }`;
      document.head.appendChild(s);
    }
  }

  // ── Scroll-reveal ─────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // ── Floating petals ───────────────────────────────────────────────
  function spawnPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = Math.random() * 8 + 5;
    petal.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -${size * 2}px;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 3}s;
      opacity: ${0.15 + Math.random() * 0.2};
    `;
    document.body.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove());
  }

  setInterval(spawnPetal, 2200);
  for (let i = 0; i < 5; i++) setTimeout(spawnPetal, i * 400);

});