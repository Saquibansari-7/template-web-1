// Shared wedding data store — used by index.html and admin.html
const DEFAULT_DATA = {
  couple: { name1: "Olivia", name2: "Ben" },
  hero: {
    subtitle: "The Wedding of",
    date: "September 14, 2025",
    location: "Tuscany, Italy",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=2000&q=80"
  },
  saveTheDate: {
    heading: "We're getting married",
    quote: '"Two souls with but a single thought, two hearts that beat as one." We can\'t wait to celebrate our love with the people who mean the most to us.'
  },
  countdown: {
    targetDate: "2025-09-14T16:00:00",
    heading: 'Until we say "I do"'
  },
  story: {
    heading: "How we met",
    paragraph1: "It all began on a warm summer evening in a small café in Florence. A spilled coffee, a shared laugh, and an unexpected conversation that lasted until the stars came out.",
    paragraph2: "Seven years, countless adventures, and one unforgettable proposal later, we're ready to begin the next chapter — surrounded by the love of our family and friends.",
    image: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200&q=80"
  },
  events: {
    ceremony: { time: "4:00 PM", venue: "Villa San Crispolto", location: "Tuscany, Italy" },
    reception: { time: "6:30 PM", venue: "The Garden Terrace", location: "Villa San Crispolto" },
    mapLocation: { address: "Via del Colle 12", city: "Chianti, 53017", region: "Tuscany, Italy" }
  },
  gallery: {
    enabled: true,
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80"
    ]
  },
  quote: {
    text: '"To love and be loved is to feel the sun from both sides."',
    author: "— David Viscott"
  },
  rsvp: {
    heading: "Kindly RSVP",
    deadline: "Please reply by August 1st, 2025",
    whatsapp: "910000000000"
  },
  footer: {
    date: "14 . 09 . 2025",
    tagline: "With love, forever & always"
  },
  invitationCard: {
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1000&q=80"
  },
  sections: {
    hero: true,
    saveTheDate: true,
    countdown: true,
    story: true,
    events: true,
    gallery: true,
    quote: true,
    rsvp: true,
    invitationCard: true
  }
};

function loadWeddingData() {
  const saved = localStorage.getItem('weddingData');
  let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      // Simple merge for top-level objects
      for (let key in parsed) {
        if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
          data[key] = { ...data[key], ...parsed[key] };
        } else {
          data[key] = parsed[key];
        }
      }
    } catch(e) { console.error("Error parsing saved data", e); }
  }
  return data;
}

function saveWeddingData(data) {
  localStorage.setItem('weddingData', JSON.stringify(data));
}

// Export for Node.js backend (single source of truth for defaults)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_DATA, loadWeddingData, saveWeddingData };
}
