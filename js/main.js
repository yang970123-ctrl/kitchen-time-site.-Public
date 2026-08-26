// 고기굽는시간.site — 공용 타이머 스크립트
(function () {
  function initTimer(root) {
    const display = root.querySelector('.display');
    const startBtn = root.querySelector('[data-action="start"]');
    const resetBtn = root.querySelector('[data-action="reset"]');
    const presetBtns = root.querySelectorAll('[data-preset]');

    let totalSeconds = parseInt(root.dataset.defaultSeconds || '180', 10);
    let remaining = totalSeconds;
    let timerId = null;
    let running = false;

    function render() {
      const m = Math.floor(remaining / 60).toString().padStart(2, '0');
      const s = (remaining % 60).toString().padStart(2, '0');
      display.textContent = `${m}:${s}`;
    }

    function beep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      } catch (e) { /* 오디오 미지원 브라우저 무시 */ }
    }

    function tick() {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 0;
        render();
        clearInterval(timerId);
        running = false;
        startBtn.textContent = '다시 굽기';
        beep();
        display.parentElement.classList.add('done');
        return;
      }
      render();
    }

    function start() {
      if (running) {
        clearInterval(timerId);
        running = false;
        startBtn.textContent = '이어서 굽기';
        return;
      }
      if (remaining <= 0) remaining = totalSeconds;
      running = true;
      startBtn.textContent = '일시정지';
      display.parentElement.classList.remove('done');
      timerId = setInterval(tick, 1000);
    }

    function reset() {
      clearInterval(timerId);
      running = false;
      remaining = totalSeconds;
      startBtn.textContent = '타이머 시작';
      display.parentElement.classList.remove('done');
      render();
    }

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        totalSeconds = parseInt(btn.dataset.preset, 10);
        reset();
        presetBtns.forEach((b) => b.classList.remove('btn-active'));
        btn.classList.add('btn-active');
      });
    });

    startBtn.addEventListener('click', start);
    resetBtn.addEventListener('click', reset);
    render();
  }

  document.querySelectorAll('.timer-box').forEach(initTimer);
})();
