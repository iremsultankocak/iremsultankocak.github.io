/* Progressive enhancement only: every page works without this file. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  /* Header border once the page scrolls */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* Gentle entrance animation */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Original screens: [data-open] buttons (wireframe/phone cards) and figures marked [data-zoom] */
  var zoomables = document.querySelectorAll('[data-zoom]');
  var openers = document.querySelectorAll('[data-open]');
  if ((!zoomables.length && !openers.length) || typeof HTMLDialogElement !== 'function') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox on-dark';
  dialog.setAttribute('aria-label', 'Original screen');
  dialog.innerHTML =
    '<div class="lightbox-bar"><span class="lightbox-title"></span>' +
    '<button type="button" class="lightbox-close">Close ✕</button></div>' +
    '<div class="lightbox-stage"><img alt=""></div>' +
    '<p class="lightbox-caption"></p>';
  document.body.appendChild(dialog);
  var dImg = dialog.querySelector('img');
  var dStage = dialog.querySelector('.lightbox-stage');
  var dCap = dialog.querySelector('.lightbox-caption');
  var dTitle = dialog.querySelector('.lightbox-title');
  var lastTrigger = null;

  dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog || e.target === dStage) dialog.close(); });
  dialog.addEventListener('close', function () {
    dImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  });

  function openShot(trigger, src, alt, caption, title, native) {
    lastTrigger = trigger;
    dImg.src = src;
    dImg.alt = alt || '';
    dCap.textContent = caption || '';
    dTitle.textContent = title || 'Original screen';
    dStage.classList.toggle('is-native', !!native);
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus();
  }

  openers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openShot(btn, btn.getAttribute('data-open'), btn.getAttribute('data-alt'), btn.getAttribute('data-cap'), btn.getAttribute('data-title'));
    });
  });

  zoomables.forEach(function (fig) {
    var img = fig.querySelector('img');
    var frame = fig.querySelector('.shot-frame') || fig;
    if (!img) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zoom-btn';
    btn.innerHTML = '<span aria-hidden="true">⤢</span> Enlarge';
    btn.setAttribute('aria-label', 'Enlarge: ' + (img.getAttribute('alt') || ''));
    frame.appendChild(btn);
    btn.addEventListener('click', function () {
      var cap = fig.querySelector('figcaption');
      var head = fig.querySelector('.shot-head span');
      openShot(btn, fig.getAttribute('data-zoom') || img.currentSrc || img.src, img.alt,
        cap ? cap.textContent.trim() : '', head ? head.textContent : 'Screenshot', fig.hasAttribute('data-zoom-native'));
    });
  });
})();
