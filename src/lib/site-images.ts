/**
 * Self-hosted originals from the legacy Wix site (see scripts/download-wix-assets.mjs).
 * Wix filenames keep media IDs for traceability; brand logos use readable names in /public/images/.
 */
const b = '/images';

export const img = {
  /** Wordmark for light backgrounds (outlined / hollow treatment). */
  logoOnLightHollow: `${b}/logo-on-light-hollow.png`,
  /** Full wordmark for dark backgrounds (filled). */
  logoOnDarkFull: `${b}/logo-on-dark-full.png`,
  logoMark: `${b}/dfa8a7_6c5154e19bd6478ab905b693a5a926fe.png`,
  homeMakerCollage: `${b}/maker-collective-logo.png`,
  makersHiring: `${b}/dfa8a7_408ec4ca9c754cfbad77c7bed422ce12.jpg`,
  communityFeatured: `${b}/dfa8a7_cec5984add7c48afb716325c8ae5edc4.jpg`,
  programGlam: `${b}/dfa8a7_38e233a4b1b7436cad38dd96855ca4c1.jpg`,
  programStory: `${b}/dfa8a7_dc2494852d2c40a2bd7cfcc2114043b1.jpg`,
  programStoryAlt: `${b}/dfa8a7_c5a876a337ac4fd0b5821d0e7d2f75fb.jpg`,
  programOutreach: `${b}/dfa8a7_bb3e8df31251476891bf0b33eb01f2ba.jpg`,
  meetupPhoto: `${b}/dfa8a7_71650ffa304643cd80674c9b1be3c5ab.jpg`,
  meetupMonthlyGraphic: `${b}/dfa8a7_a116171c772045dea84878b4d0946b81.png`,
  createArtCommunity: `${b}/dfa8a7_1e3b119cb2d94d6eb01707c523f01992.jpg`,
  galleryTours: `${b}/dfa8a7_a3d3543ef415402ab015bfffc33d1765.jpg`,
  metroArtsCalendar: `${b}/dfa8a7_c50d01efee3846a694b754d129bc4f30.jpg`,
  getCreative: `${b}/dfa8a7_06a5df2e7700459aace1c425f9d80998.jpg`,
  aboutGraphic: `${b}/dfa8a7_f95ade08394f4abc87c4b8bbf33aeacf.png`,
  makerspaceBanner: `${b}/dfa8a7_186799549e964e46b82cf395833a031a.png`,
  makerspaceA: `${b}/dfa8a7_11a08acd65f443b2a9c52306edfdadad.jpg`,
  makerspaceB: `${b}/dfa8a7_2ef53cd397944d96a740183cfe4537c2.jpg`,
  makerspaceC: `${b}/dfa8a7_6eaf06039a634de59c431c62c0f570b4.jpg`,
  makerspaceD: `${b}/dfa8a7_eec7118db9884641920f4b0218220f8b.jpg`,
  makerspaceE: `${b}/dfa8a7_f406a944ae0b4dd89e2a6ff7618feab9.jpg`,
  storytellingA: `${b}/dfa8a7_4ced91320eb443c2847cfd6eb59d00ff.jpg`,
  storytellingB: `${b}/dfa8a7_72a3e41dd50d4cbe974231f34efce71b.jpg`,
  volunteerGlam: `${b}/dfa8a7_109f94c4b17c4bf5a7e960dd505bfd87.jpg`,
  volunteerStory: `${b}/dfa8a7_7e4ddd7ea5e54b718addd2b8b4435340.jpg`,
  volunteerMakers: `${b}/dfa8a7_bbe315cfc9354e3bb65ea50823bf8782.jpg`,
  volunteerCommunity: `${b}/dfa8a7_c48072f007274fb98ba590fa0a647496.jpg`,
  socialMetaA: `${b}/11062b_2381e8a6e7444f4f902e7b649aa3f0ac.png`,
  socialMetaB: `${b}/11062b_55e4be1e75564866b6c28290f9a9d271.png`,
} as const;

/** Brick City Glam — photo gallery from the Wix program page. */
export const brickGlamGallery = [
  `${b}/dfa8a7_275103b808624b2fa8eb63f7282e21fd.jpg`,
  `${b}/dfa8a7_48559abd8f534ec2b4782c803d3ad537.jpg`,
  `${b}/dfa8a7_4e0420e5a1894ca280b9bd9e127d0800.jpg`,
  `${b}/dfa8a7_6916237e52474625b285d9a906e2315f.jpg`,
  `${b}/dfa8a7_906c584b0dab4c519083cc51ee0351f5.jpg`,
  `${b}/dfa8a7_91cad61fb47343d9b63c444001e148b2.jpg`,
  `${b}/dfa8a7_a4b99b66c15e45ca8be842443d923b79.jpg`,
  `${b}/dfa8a7_ac9da977805a472bb6ec5967692fb212.jpg`,
  `${b}/dfa8a7_d22147a2acbe43c3b9ee66a3ce134fb9.jpg`,
  `${b}/dfa8a7_dc89f303bbb54e58ad93bafe244a0606.jpg`,
  `${b}/dfa8a7_ddf8f2d03ae0432e8c767db19c95b23a.jpg`,
  `${b}/dfa8a7_df03084b956b4109aa650463de9749c4.jpg`,
  `${b}/dfa8a7_e07c9a12373449aea498b4d6a8d1567b.jpg`,
  `${b}/dfa8a7_e38a57db968846ff9f659f7523680b16.jpg`,
  `${b}/dfa8a7_f01fc9f0469148d2a7dbbcf74ff1f302.jpg`,
  `${b}/dfa8a7_f69c29af86d24dff9a3cc807e4f2cfc2.jpg`,
  `${b}/dfa8a7_f9ef485e391d4ba8ad77db1dcea54320.jpg`,
] as const;
