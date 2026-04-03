/**
 * Single source of outbound URLs and mailto builders for CTAs.
 * Partytown is only for third-party analytics/tags — never Alpine or site UI.
 */

export const SITE = {
  name: 'Artify Ocala',
  tagline: 'Enhancing Everyday Experiences Through Art & Exploration',
  email: 'info@artifyocala.org',
} as const;

export const LINKS = {
  instagram: 'https://www.instagram.com/artifyocala',
  facebook: 'https://www.facebook.com/artifyocala',
  facebookMeetupGroup: 'https://www.facebook.com/share/g/1BQuehj359/',
  zeffyStorytellingSignup:
    'https://www.zeffy.com/ticketing/30685666-0bc4-4a2b-8d0f-85f994415c67',
  zeffyGetInvolved: 'https://www.zeffy.com/ticketing/a97a54c8-3f9c-414e-89c9-08ccd79e57d8',
  zeffyVolunteerEn: 'https://www.zeffy.com/en-US/ticketing/a97a54c8-3f9c-414e-89c9-08ccd79e57d8',
  zeffyMakerspaceDonation:
    'https://www.zeffy.com/en-US/donation-form/help-build-the-marion-county-maker-space',
  jotformCasting: 'https://form.jotform.com/222587113491052',
  boloMembershipApply:
    'https://fill.boloforms.com/signature/4a7f6985-f626-41ba-8ab2-50b7f6a4ed5c?p=view',
  mcaGalleryTours: 'https://mcaocala.org/ocala-gallery-tours/',
  ocalametroArtsCalendar: 'https://www.ocalametroartscene.com/',
  mcaApplaudTheArts: 'https://mcaocala.org/applaud-the-arts-2/',
} as const;

export type OutboundLinkKey = keyof typeof LINKS;

const URL_KEYS: OutboundLinkKey[] = [
  'instagram',
  'facebook',
  'facebookMeetupGroup',
  'zeffyStorytellingSignup',
  'zeffyGetInvolved',
  'zeffyVolunteerEn',
  'zeffyMakerspaceDonation',
  'jotformCasting',
  'boloMembershipApply',
  'mcaGalleryTours',
  'ocalametroArtsCalendar',
  'mcaApplaudTheArts',
];

export function mailtoTourMakerCollective(): string {
  const subject = encodeURIComponent("I'd Like to Tour the Maker Collective");
  return `mailto:${SITE.email}?subject=${subject}`;
}

export function mailtoVolunteerBrickCityGlam(): string {
  const subject = encodeURIComponent('I want to volunteer for Brick City Glam!');
  return `mailto:${SITE.email}?subject=${subject}`;
}

export function mailtoVolunteerStorytellingKnights(): string {
  const subject = encodeURIComponent('I want to volunteer for Storytelling Knight!');
  return `mailto:${SITE.email}?subject=${subject}`;
}

export function mailtoVolunteerMakerCollective(): string {
  const subject = encodeURIComponent('I want to volunteer for Marion County Makers!');
  return `mailto:${SITE.email}?subject=${subject}`;
}

/** Returns keys of invalid URLs (empty string or failed URL parse / wrong protocol). */
export function validateOutboundLinks(): OutboundLinkKey[] {
  const bad: OutboundLinkKey[] = [];
  for (const key of URL_KEYS) {
    const value = LINKS[key];
    if (!value) {
      bad.push(key);
      continue;
    }
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') bad.push(key);
    } catch {
      bad.push(key);
    }
  }
  return bad;
}
