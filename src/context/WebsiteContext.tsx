import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { loadContent } from '../services/loadContent';
import { saveContent } from '../services/saveContent';
import { uploadImage } from '../services/uploadImage';
import { supabase } from '../lib/supabase';
import { WebsiteContent, PartialWebsiteContent, SectionSettings } from '../types';

export interface WebsiteContextType {
  content: WebsiteContent;
  sections: SectionSettings;
  updateContent: (section: keyof WebsiteContent, field: string, value: unknown) => void;
  updateNestedContent: (section: keyof WebsiteContent, path: string, value: unknown) => void;
  updateSection: (sectionName: string, visible: boolean) => void;
  saveContent: (siteId: string, content?: WebsiteContent, sections?: SectionSettings) => Promise<void>;
  uploadImage: (siteId: string, file: File) => Promise<string | null>;
}

const defaultContent: WebsiteContent = {
  couple: { name1: 'Olivia', name2: 'Ben' },
  hero: {
    subtitle: 'The Wedding of',
    date: 'September 14, 2026',
    location: 'Tuscany, Italy',
    image: '/uploads/1784113477606-dnuwel.png',
  },
  saveTheDate: {
    heading: "We're getting married",
    quote: '"Two souls with but a single thought, two hearts that beat as one." We can\'t wait to celebrate our love with the people who mean the most to us.',
  },
  countdown: {
    targetDate: '2026-09-14T16:00:00',
    heading: 'Until we say "I do"',
  },
  story: {
    heading: 'How we met',
    paragraph1: 'It all began on a warm summer evening in a small café in Florence. A spilled coffee, a shared laugh, and an unexpected conversation that lasted until the stars came out.',
    paragraph2: 'Seven years, countless adventures, and one unforgettable proposal later, we\'re ready to begin the next chapter — surrounded by the love of our family and friends.',
    image: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200&q=80',
  },
  events: {
    ceremony: { time: '4:00 PM', venue: 'Villa San Crispolto', location: 'Tuscany, Italy' },
    reception: { time: '6:30 PM', venue: 'The Garden Terrace', location: 'Villa San Crispolto' },
    mapLocation: { address: 'Via del Colle 12', city: 'Chianti, 53017', region: 'Tuscany, Italy', mapUrl: '' },
  },
  gallery: {
    enabled: true,
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
      'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    ],
  },
  quote: {
    text: '"To love and be loved is to feel the sun from both sides."',
    author: '— David Viscott',
  },
  rsvp: {
    heading: 'Kindly RSVP',
    deadline: 'Please reply by August 1st, 2026',
    whatsapp: '910000000000',
  },
  footer: {
    date: '14 . 09 . 2026',
    tagline: 'With love, forever & always',
    socials: {
      instagram: '',
      x: '',
      facebook: '',
    },
  },
  invitationCard: {
    image: '',
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
    invitationCard: true,
  },
};

const defaultSections: SectionSettings = {
  hero: true,
  saveTheDate: true,
  countdown: true,
  story: true,
  events: true,
  gallery: true,
  quote: true,
  rsvp: true,
  invitationCard: true,
};

const defaultSiteId = 'default';

const isSupabaseConfigured = () => {
  return !!supabase && typeof supabase.from === 'function';
};

const getStoredSiteId = (): string => {
  try {
    const stored = localStorage.getItem('sitesSiteId');
    return stored || defaultSiteId;
  } catch {
    return defaultSiteId;
  }
};

const storeSiteId = (id: string) => {
  try {
    localStorage.setItem('sitesSiteId', id);
  } catch {
    // localStorage not available
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

interface WebsiteProviderProps {
  children: ReactNode;
}

export function WebsiteProvider({ children }: WebsiteProviderProps) {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [sections, setSections] = useState<SectionSettings>(defaultSections);
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(false);

  useEffect(() => {
    const siteId = getStoredSiteId();

    if (isSupabaseConfigured()) {
      loadContent(siteId)
        .then((data) => {
          if (data) {
            const merged = data as PartialWebsiteContent;
            setContent((prev) => ({
              ...prev,
              ...merged,
              couple: merged.couple || prev.couple,
              hero: { ...prev.hero, ...(merged.hero || {}) },
              saveTheDate: { ...prev.saveTheDate, ...(merged.saveTheDate || {}) },
              countdown: { ...prev.countdown, ...(merged.countdown || {}) },
              story: { ...prev.story, ...(merged.story || {}) },
              events: {
                ...prev.events,
                ...(merged.events || {}),
                ceremony: { ...prev.events.ceremony, ...(merged.events?.ceremony || {}) },
                reception: { ...prev.events.reception, ...(merged.events?.reception || {}) },
                mapLocation: { ...prev.events.mapLocation, ...(merged.events?.mapLocation || {}) },
              },
              gallery: { ...prev.gallery, ...(merged.gallery || {}) },
              quote: { ...prev.quote, ...(merged.quote || {}) },
              rsvp: { ...prev.rsvp, ...(merged.rsvp || {}) },
              footer: { ...prev.footer, ...(merged.footer || {}) },
              invitationCard: { ...prev.invitationCard, ...(merged.invitationCard || {}) },
              sections: { ...prev.sections, ...(merged.sections || {}) },
            }));
            storeSiteId(siteId);
          }
        })
        .catch(() => {
          // Silently fail — defaults will be used
        });
    }
  }, []);

  const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((acc, key) => acc[key] as Record<string, unknown>, obj);
    (target as Record<string, unknown>)[lastKey] = value;
    return { ...obj };
  };

  const updateContent = (section: keyof WebsiteContent, field: string, value: unknown) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      } as WebsiteContent[typeof section],
    }));
  };

  const updateNestedContent = (section: keyof WebsiteContent, path: string, value: unknown) => {
    setContent((prev) => ({
      ...prev,
      [section]: setNestedValue({ ...prev[section] }, path, value) as WebsiteContent[typeof section],
    }));
  };

  const updateSection = (sectionName: string, visible: boolean) => {
    setSections((prev) => ({
      ...prev,
      [sectionName]: visible,
    }));
  };

  const saveToSupabase = async (siteId: string, overrideContent?: WebsiteContent, overrideSections?: SectionSettings) => {
    const result = await saveContent(siteId, overrideContent || content, overrideSections || sections);
    if ((result as { error?: unknown } | undefined)?.error) {
      const errorMessage = (result as { error: { message?: string } }).error?.message || 'Unknown error';
      throw new Error(`Save failed: ${errorMessage}`);
    }
  };

  return (
    <WebsiteContext.Provider
      value={{
        content,
        sections,
        updateContent,
        updateNestedContent,
        updateSection,
        saveContent: saveToSupabase,
        uploadImage: uploadImage as WebsiteContextType['uploadImage'],
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWebsiteContext() {
  const context = React.useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsiteContext must be used within WebsiteProvider');
  }
  return context;
}
