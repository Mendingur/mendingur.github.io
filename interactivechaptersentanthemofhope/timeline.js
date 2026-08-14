/* ============================================================
   Mendingur — Interactive Chapters (Anthem of Hope) page script
   Timeline progress logic specific to this page. Loaded after
   site.js. Hooks into the shared language switcher via
   window.MENDINGUR_PAGE.onLanguageChange.
   ============================================================ */

(function () {
  var timelineActiveMonth = '2026-08';
  var timelineNotes = {
    vi: {
      '2026-08': "Đang ở đây — đặt những viên gạch nền móng.",
      '2026-11': "Đang ở đây — xây dựng cơ chế chơi.",
      '2027-01': "Đang ở đây — chỉnh sửa lần cuối trước khi mở cửa.",
      '2027-03': "Thế giới có lẽ đang mở — theo dõi X để nhận thông báo."
    },
    en: {
      '2026-08': "We're here — laying the foundations.",
      '2026-11': "We're here — building the mechanics.",
      '2027-01': "We're here — polishing before the doors open.",
      '2027-03': "The world should be opening now — watch X for the announcement."
    }
  };

  function renderTimelineNote(lang) {
    var note = document.getElementById('timelineNote');
    var set = timelineNotes[lang] || timelineNotes.vi;
    if (note && set[timelineActiveMonth]) note.textContent = set[timelineActiveMonth];
  }

  // merge into whatever config the page already declared, so we don't
  // clobber titleVi/titleEn/descVi/descEn set by the page's own inline script
  window.MENDINGUR_PAGE = window.MENDINGUR_PAGE || {};
  window.MENDINGUR_PAGE.onLanguageChange = function (lang) {
    renderTimelineNote(lang);
  };

  // Milestones, in chronological order. The active one is the last
  // milestone reached (its "key" is <= the current year-month), capped
  // at the launch milestone once it's passed.
  var milestoneOrder = ['2026-08', '2026-11', '2027-01', '2027-03'];

  (function () {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1; // 1-12
    var currentKey = y + '-' + (m < 10 ? '0' + m : m);

    timelineActiveMonth = milestoneOrder[0];
    for (var i = 0; i < milestoneOrder.length; i++) {
      if (milestoneOrder[i] <= currentKey) {
        timelineActiveMonth = milestoneOrder[i];
      }
    }

    var nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach(function (node) {
      if (node.getAttribute('data-month') === timelineActiveMonth) {
        node.classList.add('is-current');
      }
    });

    renderTimelineNote(document.documentElement.lang || 'vi');
  })();
})();
