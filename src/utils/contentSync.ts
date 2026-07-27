import type { WebsiteContent, SectionSettings } from '../types';

export function syncContentToDOM(content: WebsiteContent, sections: SectionSettings) {
  const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;
  const set = (sel: string, value: string) => {
    const el = q(sel);
    if (el) el.textContent = value;
  };
  const setHtml = (sel: string, value: string) => {
    const el = q(sel);
    if (el) el.innerHTML = value;
  };
  const setSrc = (sel: string, value: string) => {
    const el = q(sel) as HTMLImageElement | null;
    if (el) el.src = value;
  };

  // Couple names
  set('[data-bind="name1"]', content.couple.name1);
  set('[data-bind="name2"]', content.couple.name2);

  // Hero
  set('[data-bind="hero-subtitle"]', content.hero.subtitle);
  set('[data-bind="hero-date-loc"]', content.hero.date + ' \u00A0·\u00A0 ' + content.hero.location);
  setSrc('[data-bind="hero-img"]', content.hero.image);

  // Save the date
  set('[data-bind="std-heading"]', content.saveTheDate.heading);
  set('[data-bind="std-quote"]', content.saveTheDate.quote);

  // Invitation Card
  setSrc('[data-bind="inv-img"]', content.invitationCard.image);

  // Countdown
  set('[data-bind="cd-heading"]', content.countdown.heading);

  // Story
  set('[data-bind="story-heading"]', content.story.heading);
  set('[data-bind="story-p1"]', content.story.paragraph1);
  set('[data-bind="story-p2"]', content.story.paragraph2);
  setSrc('[data-bind="story-img"]', content.story.image);

  // Events
  setHtml('[data-bind="ev-cer"]',
    content.events.ceremony.time + '<br/>' + content.events.ceremony.venue + '<br/>' + content.events.ceremony.location);
  setHtml('[data-bind="ev-rec"]',
    content.events.reception.time + '<br/>' + content.events.reception.venue + '<br/>' + content.events.reception.location);
  setHtml('[data-bind="ev-loc"]',
    content.events.mapLocation.address + '<br/>' + content.events.mapLocation.city + '<br/>' + content.events.mapLocation.region);

  // Gallery
  const galleryContainer = q('[data-bind="gallery-grid"]');
  if (galleryContainer) {
      galleryContainer.innerHTML = content.gallery.images.map((url: string, i: number) =>
        `<img class="reveal w-full h-64 md:h-80 object-cover${i === 1 ? ' md:row-span-2 md:h-full' : ''}" src="${url}" alt="Gallery photo ${i + 1}">`
      ).join('');
  }

  // Quote
  set('[data-bind="quote-text"]', content.quote.text);
  set('[data-bind="quote-author"]', content.quote.author);

  // RSVP
  set('[data-bind="rsvp-heading"]', content.rsvp.heading);
  set('[data-bind="rsvp-deadline"]', content.rsvp.deadline);

  // Footer
  setHtml('[data-bind="footer-names"]', content.couple.name1 + ' &amp; ' + content.couple.name2);
  set('[data-bind="footer-date"]', content.footer.date);
  set('[data-bind="footer-tagline"]', content.footer.tagline);

  // Section visibility
  const sectionMap: Record<string, string> = {
    hero: '#home',
    saveTheDate: '#save-the-date',
    countdown: '#countdown-section',
    story: '#story',
    events: '#details',
    gallery: '#gallery',
    quote: '#quote-section',
    rsvp: '#rsvp',
    invitationCard: '#invitation-card',
  };

  for (const [key, sel] of Object.entries(sectionMap)) {
    const el = q(sel);
    if (el) el.style.display = sections[key] ? '' : 'none';
  }
}

export function updateCountdown(targetDate: string) {
  const days = q('#cd-days') as HTMLElement | null;
  const hours = q('#cd-hours') as HTMLElement | null;
  const mins = q('#cd-mins') as HTMLElement | null;
  const secs = q('#cd-secs') as HTMLElement | null;

  function tick() {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    let d = target - now;
    if (d < 0) d = 0;
    if (days) days.textContent = String(Math.floor(d / 86400000)).padStart(2, '0');
    if (hours) hours.textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0');
    if (mins) mins.textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
    if (secs) secs.textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
  }

  tick();
  return setInterval(tick, 1000);
}

export function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function q(sel: string) {
  return document.querySelector(sel) as HTMLElement | null;
}
