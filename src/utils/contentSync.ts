import type { WebsiteContent, SectionSettings } from '../types';

export function syncContentToDOM(content: WebsiteContent, sections: SectionSettings) {
  const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;
  const set = (sel: string, value: string) => {
    const el = q(sel);
    if (el) {
      const changed = el.textContent !== value;
      el.textContent = value;
      if (changed) console.log('[sync] text', sel, '=>', value);
    }
  };
  const setHtml = (sel: string, value: string) => {
    const el = q(sel);
    if (el) {
      el.innerHTML = value;
      console.log('[sync] html', sel, '=>', value.slice(0, 80));
    }
  };
  const setSrc = (sel: string, value: string) => {
    const el = q(sel) as HTMLImageElement | null;
    if (!el) return;
    const trimmed = (value || '').trim();
    if (!trimmed || trimmed.startsWith('/uploads/')) {
      console.warn('[sync] skip broken/local image src', sel, trimmed);
      return;
    }

    const cacheBusted = trimmed.includes('?') ? `${trimmed}&_=${Date.now()}` : `${trimmed}?_=${Date.now()}`;
    const changed = el.getAttribute('data-src') !== cacheBusted;
    if (changed) {
      el.setAttribute('data-src', cacheBusted);
      console.log('[sync] src', sel, '=>', cacheBusted);
      el.onerror = () => console.error('[sync] image failed to load', sel, cacheBusted);
      el.onload = () => console.log('[sync] image loaded', sel, cacheBusted);
      el.src = cacheBusted;
    }
  };

  set('[data-bind="name1"]', content.couple.name1);
  set('[data-bind="name2"]', content.couple.name2);
  set('[data-bind="hero-subtitle"]', content.hero.subtitle);
  set('[data-bind="hero-date-loc"]', content.hero.date + ' \u00A0·\u00A0 ' + content.hero.location);
  setSrc('[data-bind="hero-img"]', content.hero.image);

  set('[data-bind="std-heading"]', content.saveTheDate.heading);
  set('[data-bind="std-quote"]', content.saveTheDate.quote);

  setSrc('[data-bind="inv-img"]', content.invitationCard.image);

  set('[data-bind="cd-heading"]', content.countdown.heading);

  set('[data-bind="story-heading"]', content.story.heading);
  set('[data-bind="story-p1"]', content.story.paragraph1);
  set('[data-bind="story-p2"]', content.story.paragraph2);
  setSrc('[data-bind="story-img"]', content.story.image);

  setHtml('[data-bind="ev-cer"]',
    content.events.ceremony.time + '<br/>' + content.events.ceremony.venue + '<br/>' + content.events.ceremony.location);
  setHtml('[data-bind="ev-rec"]',
    content.events.reception.time + '<br/>' + content.events.reception.venue + '<br/>' + content.events.reception.location);
  setHtml('[data-bind="ev-loc"]',
    content.events.mapLocation.address + '<br/>' + content.events.mapLocation.city + '<br/>' + content.events.mapLocation.region);

  const galleryContainer = q('[data-bind="gallery-grid"]');
  if (galleryContainer) {
    galleryContainer.innerHTML = content.gallery.images.map((url: string, i: number) =>
      `<img class="reveal w-full h-64 md:h-80 object-cover${i === 1 ? ' md:row-span-2 md:h-full' : ''}" src="${url}" alt="Gallery photo ${i + 1}">`
    ).join('');
    console.log('[sync] gallery images set:', content.gallery.images.length);
  }

  set('[data-bind="quote-text"]', content.quote.text);
  set('[data-bind="quote-author"]', content.quote.author);

  set('[data-bind="rsvp-heading"]', content.rsvp.heading);
  set('[data-bind="rsvp-deadline"]', content.rsvp.deadline);

  setHtml('[data-bind="footer-names"]', content.couple.name1 + ' &amp; ' + content.couple.name2);
  set('[data-bind="footer-date"]', content.footer.date);
  set('[data-bind="footer-tagline"]', content.footer.tagline);

  if (content.footer.socials) {
    const instagram = document.querySelector('[data-bind="footer-instagram"]') as HTMLAnchorElement | null;
    const x = document.querySelector('[data-bind="footer-x"]') as HTMLAnchorElement | null;
    const facebook = document.querySelector('[data-bind="footer-facebook"]') as HTMLAnchorElement | null;

    if (instagram) {
      instagram.href = content.footer.socials.instagram || '#';
      instagram.style.display = content.footer.socials.instagram ? '' : 'none';
    }
    if (x) {
      x.href = content.footer.socials.x || '#';
      x.style.display = content.footer.socials.x ? '' : 'none';
    }
    if (facebook) {
      facebook.href = content.footer.socials.facebook || '#';
      facebook.style.display = content.footer.socials.facebook ? '' : 'none';
    }
  }

  const viewLocationBtn = document.querySelector('[data-bind="view-location"]') as HTMLAnchorElement | null;
  if (viewLocationBtn && content.events.mapLocation.mapUrl) {
    viewLocationBtn.href = content.events.mapLocation.mapUrl;
    viewLocationBtn.target = '_blank';
    viewLocationBtn.rel = 'noopener noreferrer';
  }

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
