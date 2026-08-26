/* ============================================================
   Vệt sáng mờ đi theo con trỏ chuột — dùng cho trang mục lục và
   toàn bộ trang chương/xen kẽ.

   Các trang ở thư mục này không nạp script/site.js (chúng có bộ
   chuyển ngôn ngữ riêng, nạp site.js vào sẽ gắn trùng sự kiện),
   nên phần hiệu ứng này được tách riêng ra đây.
   ============================================================ */

(function () {
  var glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // Thiết bị cảm ứng không có con trỏ — bỏ qua cho nhẹ.
  if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var shown = false;

  document.addEventListener('mousemove', function (e) {
    glow.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    if (!shown) {
      glow.style.opacity = '1';
      shown = true;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    glow.style.opacity = '0';
    shown = false;
  });
})();
