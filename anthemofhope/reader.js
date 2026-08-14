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
})();
