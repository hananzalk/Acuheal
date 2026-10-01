// Acuheal — interactions: language toggle, sticky header, mobile menu,
// scroll reveals, active nav highlighting, accessible tabs.
(() => {
  const html = document.documentElement;
  const body = document.body;

  /* ---------- Language ---------- */
  const TITLES = {
    he: 'Acuheal · שונטל זלקינדר — אקופנקטורה ורפואה סינית קלאסית',
    en: 'Acuheal · Chantal Zalkinder — Classical Acupuncture & Chinese Medicine',
  };
  const setLang = (lang) => {
    html.lang = lang;
    html.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.title = TITLES[lang];
    document.querySelectorAll('.lang-toggle button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('acuheal-lang', lang); } catch (_) {}
  };
  const urlLang = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('acuheal-lang'); } catch (_) {}
  setLang(urlLang === 'en' || urlLang === 'he' ? urlLang : saved || 'he');
  document.querySelectorAll('.lang-toggle button').forEach((b) =>
    b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- Header + mobile call bar on scroll ---------- */
  const header = document.querySelector('.site-header');
  const callBar = document.getElementById('call-bar');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    callBar.classList.toggle('show', y > window.innerHeight * 0.7);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const toggleMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => toggleMenu(!body.classList.contains('menu-open')));
  document.querySelectorAll('#nav-links a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('#nav-links a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- Tabs (WAI-ARIA pattern) ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const activate = (tab, focus) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.classList.toggle('show', selected);
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', (e) => {
      const rtl = html.dir === 'rtl';
      const next = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      activate(tabs[(i + next + tabs.length) % tabs.length], true);
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
