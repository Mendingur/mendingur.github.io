// Reading progress bar + font-size control, shared by every chapter page.
(function () {
  var fill = document.querySelector('.progress-fill');
  var article = document.querySelector('article.prose');

  function updateProgress() {
    if (!fill) return;
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  var buttons = document.querySelectorAll('.font-toggle button');
  var STORAGE_KEY = 'khuc-ca-hy-vong-font-size';

  function applySize(size) {
    if (!article) return;
    article.setAttribute('data-size', size);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-size') === size ? 'true' : 'false');
    });
    try { localStorage.setItem(STORAGE_KEY, size); } catch (e) {}
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      applySize(b.getAttribute('data-size'));
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved) applySize(saved);

  // ===== THEME SWITCHER (light / dark) =====
  (function () {
    var switcher = document.getElementById('themeSwitcher');
    if (!switcher) return;
    var themeButtons = switcher.querySelectorAll('.theme-btn');

    function setTheme(theme, save) {
      document.documentElement.setAttribute('data-theme', theme);

      themeButtons.forEach(function (button) {
        var active = button.getAttribute('data-theme-choice') === theme;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      switcher.classList.toggle('dark', theme === 'dark');

      if (save) {
        try { localStorage.setItem('mendingur-theme', theme); } catch (e) {}
      }
    }

    themeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var theme = button.getAttribute('data-theme-choice');
        if (document.documentElement.getAttribute('data-theme') !== theme) {
          setTheme(theme, true);
        }
      });
    });

    var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme, false);
  })();

  // ===== SETTINGS MENU (hamburger → popover) =====
  (function () {
    var menu = document.getElementById('settingsMenu');
    var toggle = document.getElementById('settingsMenuToggle');
    if (!menu || !toggle) return;

    function closeMenu() {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  })();
})();
