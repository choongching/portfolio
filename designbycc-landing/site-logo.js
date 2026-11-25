/* Where the opening's wordmark sits: window.SITE_LOGO, set by designbycc-landing/preloader/site-preloader.js from
   the "site" settings. If those scripts never ran (blocked, failed download), the site still lays the
   logo out from this fallback, the same as SITE_LOGO_DEFAULTS there. */
const FALLBACK = { size: 57, sizePhone: 74, maxHeight: 32, x: 0, y: 0, doodleHold: 0.5 };
export const siteLogo = () => window.SITE_LOGO || FALLBACK;
