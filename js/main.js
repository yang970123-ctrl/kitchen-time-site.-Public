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

  // ---------- 사이트 전체 하단 고정 타이머 ----------
  function initStickyTimer() {
      // ---------- 햄버거 카테고리 메뉴 ----------
  function initCategoryMenu() {
    if (document.querySelector('.category-drawer')) return;

    const isSubPage = location.pathname.includes('/pages/');
    const homeHref = isSubPage ? '../index.html' : 'index.html';
    const prefix = isSubPage ? '' : 'pages/';

    const links = [
      { href: prefix + 'airfryer-general.html', label: '🍟 에어프라이어 조리시간' },
      { href: prefix + 'meat-cuts.html', label: '🥩 고기 부위별 굽는 시간' },
      { href: prefix + 'egg-boil.html', label: '🥚 계란 삶는 시간' },
      { href: prefix + 'storage-meat-seafood.html', label: '🧊 냉장·냉동 보관기간' },
      { href: prefix + 'microwave-time.html', label: '♨️ 전자레인지 데우는 시간' },
    ];

    // 기존 홈/카테고리 텍스트 링크 숨기기
    const oldNav = document.querySelector('.site-nav');
    if (oldNav) oldNav.style.display = 'none';

    // 햄버거 버튼 생성
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'category-menu-toggle';
    toggle.setAttribute('aria-label', '카테고리 메뉴 열기');
    toggle.textContent = '☰';
    const headerContainer = document.querySelector('.site-header .container');
    if (headerContainer) headerContainer.appendChild(toggle);

    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'category-overlay';
    document.body.appendChild(overlay);

    // 드로어(슬라이드 메뉴) 생성
    const drawer = document.createElement('nav');
    drawer.className = 'category-drawer';
    drawer.innerHTML = `
      <div class="category-drawer-title">카테고리</div>
      <ul>
        ${links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
      </ul>
    `;
    document.body.appendChild(drawer);

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
    }

    toggle.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeDrawer);
    });
  }

  initCategoryMenu();
    if (document.querySelector('.sticky-timer')) return;

    const bar = document.createElement('div');
    bar.className = 'sticky-timer';
    bar.innerHTML = `
      <button type="button" class="sticky-timer-toggle" aria-label="타이머 열기/닫기">⏱</button>
      <div class="sticky-timer-body">
        <input type="number" class="sticky-timer-input" min="0" max="180" placeholder="분" inputmode="numeric">
        <span class="sticky-timer-unit">분</span>
        <input type="number" class="sticky-timer-input sticky-timer-input-sec" min="0" max="59" placeholder="초" inputmode="numeric">
        <span class="sticky-timer-unit">초</span>
        <span class="sticky-timer-display">00:00</span>
        <button type="button" class="sticky-timer-btn" data-action="start">시작</button>
        <button type="button" class="sticky-timer-btn sticky-timer-btn-ghost" data-action="reset">초기화</button>
      </div>
    `;
    document.body.appendChild(bar);

    const toggle = bar.querySelector('.sticky-timer-toggle');
    const input = bar.querySelector('.sticky-timer-input');
    const secInput = bar.querySelector('.sticky-timer-input-sec');
    const display = bar.querySelector('.sticky-timer-display');
    const startBtn = bar.querySelector('[data-action="start"]');
    const resetBtn = bar.querySelector('[data-action="reset"]');

    let totalSeconds = 0;
    let remaining = 0;
    let timerId = null;
    let running = false;

    function render() {
      const m = Math.floor(remaining / 60).toString().padStart(2, '0');
      const s = (remaining % 60).toString().padStart(2, '0');
      display.textContent = `${m}:${s}`;
      if (remaining > 0 && remaining <= 60) {
        bar.classList.add('warn');
      } else {
        bar.classList.remove('warn');
      }
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
        startBtn.textContent = '시작';
        bar.classList.add('done');
        beep();
        return;
      }
      render();
    }

    function start() {
      if (running) {
        clearInterval(timerId);
        running = false;
        startBtn.textContent = '이어서';
        return;
      }
      if (remaining <= 0) {
        const mins = parseFloat(input.value) || 0;
        const secs = parseFloat(secInput.value) || 0;
        const sumSeconds = Math.round(mins * 60) + Math.round(secs);
        if (sumSeconds <= 0) {
          input.focus();
          return;
        }
        totalSeconds = sumSeconds;
        remaining = totalSeconds;
      }
      bar.classList.remove('done');
      running = true;
      startBtn.textContent = '일시정지';
      timerId = setInterval(tick, 1000);
    }

    function reset() {
      clearInterval(timerId);
      running = false;
      totalSeconds = 0;
      remaining = 0;
      startBtn.textContent = '시작';
      bar.classList.remove('done');
      render();
    }

    startBtn.addEventListener('click', start);
    resetBtn.addEventListener('click', reset);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') start();
    });
    secInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') start();
    });
    toggle.addEventListener('click', () => {
      bar.classList.toggle('collapsed');
    });

    render();
  }

  initStickyTimer();
})();