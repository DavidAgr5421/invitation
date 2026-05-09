document.addEventListener('DOMContentLoaded', () => {

  // --- Music Player ---
  const audio = document.getElementById('audio');
  const playIcon = document.getElementById('play-icon');
  const fill = document.getElementById('fill');
  const thumb = document.getElementById('thumb');
  const seek = document.getElementById('seek');
  let playing = false;

  function togglePlay() {
    playing ? audio.pause() : audio.play();
    playing = !playing;
    playIcon.innerHTML = playing
      ? `<line x1="9" y1="7" x2="9" y2="17" stroke-width="2.5"/><line x1="15" y1="7" x2="15" y2="17" stroke-width="2.5"/>`
      : `<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>`;
  }

  function updateBar() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width = pct + '%';
    thumb.style.left = pct + '%';
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

  // Expose ALL functions/variables used in inline onclick= to window
  window.togglePlay = togglePlay;
  window.updateBar = updateBar;
  window.audio = audio;

  // --- Countdown ---
  const target = new Date('2026-08-01T00:00:00');

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) return;
    document.getElementById('days').textContent  = Math.floor(diff / 86400000);
    document.getElementById('hours').textContent = Math.floor((diff % 86400000) / 3600000);
    document.getElementById('mins').textContent  = Math.floor((diff % 3600000) / 60000);
    document.getElementById('secs').textContent  = Math.floor((diff % 60000) / 1000);
  }

  tick();
  setInterval(tick, 1000);

  let selectedOption = null;

    window.selectOption = function(val) {
        selectedOption = val;
        document.getElementById('btn-si').classList.toggle('selected', val === 'si');
        document.getElementById('btn-no').classList.toggle('selected', val === 'no');
    };

    window.guardarRespuesta = function() {
        const nombre = document.getElementById('guestName').value.trim();
        if (!nombre) { alert('Por favor escribe tu nombre.'); return; }
        if (!selectedOption) { alert('Por favor selecciona una opción.'); return; }
        alert('¡Gracias, ' + nombre + '! Tu respuesta ha sido guardada 🎉');
    };

});