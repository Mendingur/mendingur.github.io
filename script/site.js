/* ============================================================
   Mendingur — shared site script
   Used by: index.html (Trang Chủ), tacgia/ (Trang Tác Giả),
   thesowerscycle/, interactivechapters/, donate/,
   interactivechaptersentanthemofhope/

   Each page sets window.MENDINGUR_PAGE = { titleVi, titleEn, descVi, descEn }
   in an inline <script> BEFORE loading this file, so the language
   switcher can update <title> / meta description correctly per page.

   Back-link / home-link (id="gateLink", kept for backward compatibility)
   logic below runs only if the corresponding element exists on the page
   (harmless no-op on the homepage, which has neither).
   ============================================================ */

(function () {
  var page = window.MENDINGUR_PAGE || {};

  // ===== LANGUAGE SWITCHER =====
  (function () {
    var switcher = document.getElementById('languageSwitcher');
    if (!switcher) return;
    var buttons = switcher.querySelectorAll('.lang-btn');
    var translatable = document.querySelectorAll('[data-i18n]');
    var ariaEls = document.querySelectorAll('[data-aria-vi]');

    window.setLanguage = function (lang, save) {
      document.documentElement.lang = lang;
      document.body.classList.add('language-changing');

      setTimeout(function () {
        translatable.forEach(function (el) {
          var value = el.getAttribute('data-' + lang);
          if (value !== null) el.innerHTML = value;
        });

        ariaEls.forEach(function (el) {
          var value = el.getAttribute('data-aria-' + lang);
          if (value !== null) el.setAttribute('aria-label', value);
        });

        buttons.forEach(function (button) {
          var active = button.getAttribute('data-lang') === lang;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        switcher.classList.toggle('en', lang === 'en');

        if (page.titleVi && page.titleEn) {
          document.title = lang === 'en' ? page.titleEn : page.titleVi;
        }

        var description = document.querySelector('meta[name="description"]');
        if (description && page.descVi && page.descEn) {
          description.setAttribute('content', lang === 'en' ? page.descEn : page.descVi);
        }

        document.body.classList.remove('language-changing');
        if (typeof page.onLanguageChange === 'function') {
          page.onLanguageChange(lang);
        }
        if (save) {
          try { localStorage.setItem('mendingur-language', lang); } catch (e) {}
        }
      }, 90);
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var lang = button.getAttribute('data-lang');
        if (document.documentElement.lang !== lang) window.setLanguage(lang, true);
      });
    });

    var saved = null;
    try { saved = localStorage.getItem('mendingur-language'); } catch (e) {}
    if (saved === 'en' || saved === 'vi') window.setLanguage(saved, false);
  })();

  // ===== THEME SWITCHER (light / dark) =====
  (function () {
    var switcher = document.getElementById('themeSwitcher');
    if (!switcher) return;
    var buttons = switcher.querySelectorAll('.theme-btn');

    window.setTheme = function (theme, save) {
      document.documentElement.setAttribute('data-theme', theme);

      buttons.forEach(function (button) {
        var active = button.getAttribute('data-theme-choice') === theme;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      switcher.classList.toggle('dark', theme === 'dark');

      if (save) {
        try { localStorage.setItem('mendingur-theme', theme); } catch (e) {}
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var theme = button.getAttribute('data-theme-choice');
        if (document.documentElement.getAttribute('data-theme') !== theme) {
          window.setTheme(theme, true);
        }
      });
    });

    // Sync the pill to whatever theme the early-init inline script already
    // applied (it runs before this file loads, to avoid a light-mode flash).
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    window.setTheme(current, false);
  })();

  // ===== SETTINGS MENU (hamburger → popover with language + theme) =====
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

// ===== "Quay lại" & "Trang Chủ" =====
(function () {
  var backLink = document.getElementById('backLink');
  var gateLink = document.getElementById('gateLink');

  // Ngăn xếp điều hướng tự quản lý (sessionStorage, theo từng tab) thay
  // vì dựa vào window.history.back() / document.referrer của trình
  // duyệt. Cả hai thứ đó không đáng tin khi lùi NHIỀU bước liên tiếp:
  // giá trị referrer bị làm mới/ghi đè ở mỗi lần điều hướng, còn
  // history.back() thực tế có thể bị GitHub Pages hoặc trình duyệt chen
  // thêm entry (canonical URL, bfcache miss...) khiến chuỗi lùi bị lặp
  // qua lại giữa 2 trang thay vì lùi tiếp về trang trước đó nữa. Ngăn
  // xếp này do chính mình ghi và đọc nên luôn đúng.
  var STACK_KEY = 'mendingur-nav-stack';
  var here = window.location.href;
  var stack = [];
  try { stack = JSON.parse(sessionStorage.getItem(STACK_KEY) || '[]'); } catch (e) { stack = []; }
  if (!stack.length || stack[stack.length - 1] !== here) {
    stack.push(here);
    try { sessionStorage.setItem(STACK_KEY, JSON.stringify(stack)); } catch (e) {}
  }

  var referrer = document.referrer || '';
  var isInternal = false;
  var ref = null;
  try {
    if (referrer) {
      ref = new URL(referrer);
      isInternal = ref.hostname === 'mendingur.github.io';
    }
  } catch (e) {}

  // Trang sẽ thật sự quay về nếu bấm "Quay lại" ngay bây giờ.
  var prevUrl = null;
  if (stack.length > 1) {
    prevUrl = stack[stack.length - 2];
  } else if (isInternal) {
    // Không có ngăn xếp của chính mình (tab/WebView hoàn toàn mới, ví dụ
    // in-app browser của FB/Zalo), nhưng referrer nội bộ vẫn cho biết
    // đúng trang đã dẫn tới đây.
    prevUrl = referrer || (backLink && backLink.getAttribute('data-fallback')) || null;
  }

  if (backLink) {
    if (prevUrl) {
      backLink.addEventListener('click', function (e) {
        e.preventDefault();
        stack.pop();
        if (stack.length) stack.pop();
        try { sessionStorage.setItem(STACK_KEY, JSON.stringify(stack)); } catch (err) {}
        window.location.href = prevUrl;
      });
    } else {
      backLink.style.display = 'none';
    }
  }

  if (gateLink) {
    var goingHome = false;
    if (prevUrl) {
      try {
        var prevPath = new URL(prevUrl, window.location.href).pathname;
        goingHome = prevPath === '/' || prevPath === '/index.html';
      } catch (e) {}
    }
    var backLinkHidden = backLink && backLink.style.display === 'none';
    if (goingHome && !backLinkHidden) {
      gateLink.style.display = 'none';
    }
  }
})();

  // ===== GAME LINK (present on the homepage; no-op elsewhere) =====
  (function () {
    var GAME_URL = 'https://mendingur.github.io/interactivechapters/';
    var gameFab = document.getElementById('gameFab');
    if (gameFab && GAME_URL.indexOf('YOUR-GAME-LINK-HERE') === -1) {
      gameFab.href = GAME_URL;
    }
  })();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.getElementById('stage');

  // gentle drifting sparks
  if (!reduceMotion && stage) {
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 9) + 's';
      s.style.animationDuration = (7 + Math.random() * 5) + 's';
      stage.appendChild(s);
    }
  }

  // soft brown glow that follows the cursor anywhere on the page.
  // Uses transform (GPU compositing) instead of left/top so it stays cheap
  // even at a high mousemove rate.
  if (!reduceMotion) {
    var glow = document.getElementById('cursorGlow');
    if (glow) {
      var glowShown = false;
      document.addEventListener('mousemove', function (e) {
        glow.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
        if (!glowShown) { glow.style.opacity = '1'; glowShown = true; }
      }, { passive: true });
      document.addEventListener('mouseleave', function () {
        glow.style.opacity = '0';
        glowShown = false;
      });
    }
  }

  // brown blur that follows the cursor inside each card, stronger than the
  // ambient page-wide glow above — this is the "climbs onto the card and
  // gets darker" effect. Matches both the homepage/author page's .card and the
  // volume/chapter pages' a.volume-card.
  var interactiveCards = document.querySelectorAll('.card, a.volume-card');

  interactiveCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });

  // gentle ripple on tap/click, with a short delay before navigating
  // so the ripple is visible even though the card is a real link
  interactiveCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      // let modified clicks (open in new tab, middle click, etc.) behave natively
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var href = card.getAttribute('href');
      if (!href) return;
      e.preventDefault();

      var rect = card.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var cx = (typeof e.clientX === 'number' && e.clientX !== 0) ? e.clientX : rect.left + rect.width / 2;
      var cy = (typeof e.clientY === 'number' && e.clientY !== 0) ? e.clientY : rect.top + rect.height / 2;

      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (cx - rect.left - size / 2) + 'px';
      ripple.style.top = (cy - rect.top - size / 2) + 'px';
      card.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });

      setTimeout(function () {
        window.location.href = href;
      }, 220);
    });
  });
})();
