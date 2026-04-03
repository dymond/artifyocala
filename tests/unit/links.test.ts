import { describe, expect, it } from 'vitest';
import {
  LINKS,
  SITE,
  validateOutboundLinks,
  mailtoTourMakerCollective,
} from '../../src/lib/links';

describe('links', () => {
  it('exposes https URLs for all outbound keys', () => {
    expect(validateOutboundLinks()).toEqual([]);
  });

  it('uses artifyocala.org email', () => {
    expect(SITE.email).toBe('info@artifyocala.org');
    expect(mailtoTourMakerCollective()).toMatch(/^mailto:info@artifyocala\.org\?/);
  });

  it('keeps Zeffy and form endpoints on expected hosts', () => {
    expect(new URL(LINKS.zeffyMakerspaceDonation).hostname).toBe('www.zeffy.com');
    expect(new URL(LINKS.jotformCasting).hostname).toBe('form.jotform.com');
    expect(new URL(LINKS.boloMembershipApply).hostname).toBe('fill.boloforms.com');
  });
});
