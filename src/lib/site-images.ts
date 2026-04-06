/**
 * Self-hosted images under /public/images/.
 * Names describe role or alt/context (legacy Wix media IDs removed).
 */
const b = '/images';

export const img = {
  /** Open Graph / Twitter / iMessage-style link preview (2400×1260). */
  socialShareCard: `${b}/artify-ocala-social-share.png`,
  /** Wordmark for light backgrounds (outlined / hollow treatment). */
  logoOnLightHollow: `${b}/logo-on-light-hollow.png`,
  /** Full wordmark for dark backgrounds (filled). */
  logoOnDarkFull: `${b}/logo-on-dark-full.png`,
  logoMark: `${b}/artify-mark-logo-icon.png`,
  homeMakerCollage: `${b}/maker-collective-logo.png`,
  makersHiring: `${b}/maker-collective-hiring-poster.jpg`,
  communityFeatured: `${b}/community-members-artify-event.jpg`,
  programGlam: `${b}/program-brick-city-glam-performance.jpg`,
  programStory: `${b}/program-storytelling-knights-tabletop.jpg`,
  programStoryAlt: `${b}/program-storytelling-knights-volunteer-card.jpg`,
  programOutreach: `${b}/program-community-art-outreach.jpg`,
  meetupPhoto: `${b}/maker-meetup-collaboration.jpg`,
  meetupMonthlyGraphic: `${b}/maker-meetup-monthly-schedule.png`,
  createArtCommunity: `${b}/home-why-support-community-art.jpg`,
  galleryTours: `${b}/partner-first-saturday-gallery-tours.jpg`,
  metroArtsCalendar: `${b}/partner-ocala-metro-arts-calendar.jpg`,
  getCreative: `${b}/home-get-involved-creative-expression.jpg`,
  aboutGraphic: `${b}/about-mission-illustration.png`,
  makerspaceBanner: `${b}/maker-collective-space-hero-banner.png`,
  makerspaceA: `${b}/maker-collective-makerspace-interior-01.jpg`,
  makerspaceB: `${b}/maker-collective-makerspace-interior-02.jpg`,
  makerspaceC: `${b}/maker-collective-makerspace-interior-03.jpg`,
  makerspaceD: `${b}/maker-collective-makerspace-interior-04.jpg`,
  makerspaceE: `${b}/maker-collective-makerspace-interior-05.jpg`,
  storytellingA: `${b}/storytelling-knights-session-01.jpg`,
  storytellingB: `${b}/storytelling-knights-session-02.jpg`,
  /** Storytelling Knights — additional photos (not yet placed in layouts). */
  storytellingKnights1: `${b}/storytelling-knights-1.jpg`,
  storytellingKnights2: `${b}/storytelling-knights-2.jpg`,
  storytellingKnights3: `${b}/storytelling-knights-3.jpg`,
  volunteerGlam: `${b}/volunteer-brick-city-glam.jpg`,
  volunteerStory: `${b}/volunteer-storytelling-knights.jpg`,
  volunteerMakers: `${b}/volunteer-maker-collective.jpg`,
  volunteerCommunity: `${b}/volunteer-community-outreach.jpg`,
  socialMetaA: `${b}/meta-pwa-icon-1024.png`,
  socialMetaB: `${b}/meta-pwa-icon-201.png`,
} as const;

/** New STK photos only — merge into `storytellingKnightsGallery` or pages when ready. */
export const storytellingKnightsNew = [
  img.storytellingKnights1,
  img.storytellingKnights2,
  img.storytellingKnights3,
] as const;

/** Storytelling Knights — reuse hero/session/volunteer photography (swap order as new assets land). */
export const storytellingKnightsGallery = [
  img.storytellingA,
  img.storytellingB,
  img.programStory,
  img.programStoryAlt,
  img.volunteerStory,
] as const;

/** Brick City Glam — photo gallery (order preserved). */
export const brickGlamGallery = [
  `${b}/brick-city-glam-gallery-01.jpg`,
  `${b}/brick-city-glam-gallery-02.jpg`,
  `${b}/brick-city-glam-gallery-03.jpg`,
  `${b}/brick-city-glam-gallery-04.jpg`,
  `${b}/brick-city-glam-gallery-05.jpg`,
  `${b}/brick-city-glam-gallery-06.jpg`,
  `${b}/brick-city-glam-gallery-07.jpg`,
  `${b}/brick-city-glam-gallery-08.jpg`,
  `${b}/brick-city-glam-gallery-09.jpg`,
  `${b}/brick-city-glam-gallery-10.jpg`,
  `${b}/brick-city-glam-gallery-11.jpg`,
  `${b}/brick-city-glam-gallery-12.jpg`,
  `${b}/brick-city-glam-gallery-13.jpg`,
  `${b}/brick-city-glam-gallery-14.jpg`,
  `${b}/brick-city-glam-gallery-15.jpg`,
  `${b}/brick-city-glam-gallery-16.jpg`,
  `${b}/brick-city-glam-gallery-17.jpg`,
] as const;
