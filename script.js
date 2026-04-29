(function () {
  'use strict';

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('venu_theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'light' ? 'dark' : 'light';
      if (next === 'dark') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('venu_theme', next);
      // re-render charts on theme change
      setTimeout(renderCharts, 50);
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.topbar__nav');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('is-open'));
    navMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navMenu.classList.remove('is-open'))
    );
  }

  /* ---------- Hover spotlight on cells ---------- */
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('mousemove', (e) => {
      const rect = cell.getBoundingClientRect();
      cell.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      cell.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          co.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Charts ---------- */
  const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

  const palette = () => ({
    text: isLight() ? '#0a0e1a' : '#e6e9f2',
    mute: isLight() ? '#5a6478' : '#7a8499',
    grid: isLight() ? 'rgba(10,14,26,0.06)' : 'rgba(255,255,255,0.05)',
    accent: isLight() ? '#0084ff' : '#00e5ff',
    accent2: isLight() ? '#6d28d9' : '#7c5cff',
    accent3: isLight() ? '#059669' : '#00ffa3',
    accent4: isLight() ? '#d97706' : '#ffb547',
  });

  let chartInstances = [];
  function renderCharts () {
    if (!window.Chart) return;
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];

    const p = palette();

    Chart.defaults.font.family = "'Space Grotesk', sans-serif";
    Chart.defaults.color = p.mute;

    // Skill distribution donut
    const skills = document.getElementById('chartSkills');
    if (skills) {
      chartInstances.push(new Chart(skills, {
        type: 'doughnut',
        data: {
          labels: ['Power BI', 'Azure & Fabric', 'Excel / VBA', 'SQL / DB'],
          datasets: [{
            data: [42, 25, 20, 13],
            backgroundColor: [p.accent, p.accent2, p.accent4, p.accent3],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14, font: { size: 12 } }
            },
            tooltip: { backgroundColor: '#11172a', titleColor: '#fff', borderColor: p.accent, borderWidth: 1, padding: 10 }
          }
        }
      }));
    }

  }

  // Render after a small delay so layout has settled
  if (window.Chart) renderCharts();
  else window.addEventListener('load', renderCharts);
})();
