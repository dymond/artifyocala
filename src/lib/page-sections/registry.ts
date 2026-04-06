/** Every `_template` value allowed in `src/content/pages/*.json` sections. */
export const KNOWN_SECTION_TEMPLATES = [
  "pageIntro",
  "proseBand",
  "missionQuote",
  "objectivesList",
  "contactSection",
  "twoColumnDonateHero",
  "bulletBand",
  "splitImageText",
  "homeHeroFull",
  "homeMarquee",
  "whoScroll",
  "homeProgramsIntro",
  "homeMeetups",
  "homeSupportBand",
  "homeMoreGrid",
  "homeCtaBand",
] as const;

export type KnownSectionTemplate = (typeof KNOWN_SECTION_TEMPLATES)[number];

const knownSet = new Set<string>(KNOWN_SECTION_TEMPLATES);

export function getSectionTemplateKey(section: unknown): string {
  if (typeof section !== "object" || section === null || !("_template" in section)) {
    throw new Error("Section must be an object with _template");
  }
  const t = (section as { _template: unknown })._template;
  if (typeof t !== "string" || !t.length) {
    throw new Error("Section _template must be a non-empty string");
  }
  if (!knownSet.has(t)) {
    throw new Error(`Unknown section template: ${t}`);
  }
  return t;
}

export function isKnownSectionTemplate(
  t: string,
): t is KnownSectionTemplate {
  return knownSet.has(t);
}
