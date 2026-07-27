export interface Couple {
  name1: string;
  name2: string;
}

export interface Hero {
  subtitle: string;
  date: string;
  location: string;
  image: string;
}

export interface SaveTheDate {
  heading: string;
  quote: string;
}

export interface Countdown {
  targetDate: string;
  heading: string;
}

export interface Story {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
}

export interface CeremonyEvent {
  time: string;
  venue: string;
  location: string;
}

export interface Events {
  ceremony: CeremonyEvent;
  reception: CeremonyEvent;
  mapLocation: {
    address: string;
    city: string;
    region: string;
  };
}

export interface Gallery {
  enabled: boolean;
  images: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export interface Rsvp {
  heading: string;
  deadline: string;
  whatsapp: string;
}

export interface Footer {
  date: string;
  tagline: string;
}

export interface InvitationCard {
  image: string;
}

export interface SectionSettings {
  [key: string]: boolean;
}

export interface WebsiteContent {
  couple: Couple;
  hero: Hero;
  saveTheDate: SaveTheDate;
  countdown: Countdown;
  story: Story;
  events: Events;
  gallery: Gallery;
  quote: Quote;
  rsvp: Rsvp;
  footer: Footer;
  invitationCard: InvitationCard;
  sections: SectionSettings;
}

export type PartialWebsiteContent = Partial<WebsiteContent>;
