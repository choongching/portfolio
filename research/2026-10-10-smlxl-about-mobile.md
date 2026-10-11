# smlxl.company/about on phones and tablets, and how our About page compares

Spike date: 2026-10-10. Companion to `research/2026-10-10-smlxl-about-page.md` (desktop). Method:
headless Chrome over the DevTools protocol with a **real iPhone or iPad user agent** plus touch
emulation, at 360x780, 390x844, 430x932, 768x1024, 1024x1366 and 844x390 (landscape). Real
CDP touch taps and swipes on both sites.

**Trap that invalidated an earlier pass:** smlxl.company is WordPress and serves phones a
different home page (`wp_is_mobile()`: `.c-slider-responsive`, 40 phone-native slides, no
desktop slider). A small viewport with a desktop user agent gets the desktop page squeezed. The
About page is the same document on every device. Older iPad user agents also get the phone home,
even at 1024 wide.

## 1. The reference phone journey

| Moment | Reference | Ours |
|---|---|---|
| Card tap into About | Default crossfade: home fades 0.5s `power3.out`, then About fades in 0.5s `power2.inOut` with the colour wash 0.5s `power3.inOut`; scroll reset to 0. The card-zoom transition never runs on phones (it needs a desktop `.js-c-slider` trigger). | Same (`fadeToLayer`) |
| Scrolling About | **The document scrolls** (native touch scroll; on iOS the address bar collapses, status-bar tap goes to top) | The layer is its own fixed scroll container: address bar stays, status-bar tap does nothing |
| Header on About | Fixed, transparent, 65px; logo 46px wide; "+" 15px; never hides | Fixed; logo 19px wordmark; "+" 18px |
| Leaving (logo, back, menu) | Same crossfade. **Home comes back at the top, then its cards rise again** from `y = 0.75 x innerHeight`, 1s `power3.inOut`, rescaling as they move (the logo does not replay). Scroll locked until about 2.1s after the tap. | Home comes back at the top with the cards already in place (no rise) |
| "+" menu | Full-screen overlay, links scale in 0.4s staggered 0.1s, stays up through the leave fade, closes when the next page arrives | Our menu holds only "Resume" (deliberate) |
| Press/fact slider swipes | Swiper `touchAngle` 45: under 45° from horizontal drags the slider, steeper scrolls the page | Same rule, same settled positions at every viewport |

## 2. Our About page vs the reference (layout)

Matches: video, team, clients (2 columns, left-aligned), card widths and gaps, facts cards, the
press slider height fix, no horizontal overflow at any width, footer emails fit at 360.

| Priority | Gap | Where |
|---|---|---|
| P1 | **Header disappears over the footer** wherever the footer is taller than the screen (landscape 844x390): header and footer are both `#f2f2f2`. | header colour `styles.css`; needs an About-aware class |
| P2 | Top padding is 103px at every width; reference uses its header height: 65 (<=730), 95 (731 to 899), 103 (>=900). Our h1 sits 38px lower on phones. | `.all-components` padding, scope in `about.css` |
| P2 | "Show more" sits 20px tight to the last award (reference button is inside the row-gap) | `about.css` `.c-awards__more` |
| P2 | Footer 34 to 44px shorter on phones: missing empty city line above "Social media", emails 4.4px shorter, wordmark shorter than their logo | `about.css` footer block |
| P3 | Small labels 16px line height on phones vs 18.4 (accumulates to about 31px by the footer) | `about.css`, <=730 |
| P3 | Footer bottom row full width on phones; reference 4 of 6 columns | `index.html` footer `--span-sm: 4` |
| decided | Radii 8/16 vs reference 5/10; "+" 18 vs 15px; line wraps from Switzer vs Supreme | July 19 token decisions; global header |

Landscape phones fall into the desktop layout on both sites; press cards (530 to 600px) are
taller than the 390px screen on both. Usable on both apart from the P1 header.

## 3. Not verifiable headless

iOS address-bar collapse, rubber-band overscroll, edge back-swipe (iOS likely plays its own
animation before the crossfade), real momentum, `svh`/`dvh` behaviour, real network timing. These
need a pass on CC's iPhone over the local network.
