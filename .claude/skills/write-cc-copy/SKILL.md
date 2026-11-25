---
name: write-cc-copy
description: Write or edit copy about CC for designby.cc and the landing study (About page, card text, bios, availability lines, keyword lists, alt and aria text). Use whenever a string describes CC, CC's work or career, or asks CC to "polish the wording", "make it shorter", "reword", "lock this", or to debate copy. Covers where the facts live, the fact rules, CC's voice and the iteration loop.
---

# write-cc-copy

How CC wants copy about them written, from the About page rounds (2026-10-11/12) and the
LinkedIn spiral keywords (2026-10-12). For sweeping existing text against rules (em dashes etc.)
use `/copy-pass`; this skill is for writing new copy and choosing words.

## 1. Facts first: never invent

Read before drafting, so CC isn't asked for facts that are already written down:

1. `~/Documents/Claude/Projects/All About Me (CC)/CC_Portfolio_Context_Brief.md`: timeline,
   positioning, writing rules.
2. `LinkedIn Profile - CC (Latest).md` in the same folder: newest facts.
3. The resume page, `public/resume.html` (live at designby.cc/resume): exact role names,
   skills and keywords. Reuse its words verbatim when CC asks for keywords.
4. The locked About copy in `designbycc-landing/index.html` (`.page-layer--about`): don't
   rewrite it unasked, and don't contradict it elsewhere.
5. The resume PDF's source, `docs/resume/resume-pdf.html` (2026-11-24): the cleanest version of
   every role's bullets. The README's resume part is generated from it.

**One fact, many places.** A fact about CC lives in the About page, the meta and JSON-LD
descriptions (homepage + `/resume`), `/resume`, `docs/resume/resume-pdf.html` (then
`pnpm resume:pdf`), `public/llms.txt` and the README. When CC changes one, propose the same change
everywhere (`seo-sweep` lists the SEO side), and ship it as one PR (#93 did this for Trustana).

**Fact rules (CC's corrections):**
- **No customer names in the portfolio.** Vallen Asia, David Jones, OCBC etc. belong in the
  resume or CV only.
- **CC left Trustana** (last day 28 Sep 2026, after Graas acquired it). Anything saying "Right
  now I'm at Trustana" is stale. CC is available for **IC roles**: the site says "I'm available
  now for full-time, contract or freelance IC work." (status card and About "Now", #104).
- **The B2B framing (#103):** Saleswhale and Trustana, CC's seven AI years, were early-stage B2B
  SaaS startups. The homepage intro card says "Thirteen years in design, seven of them shaping
  B2B AI products." The headline keeps "enterprise teams" (who the work serves).
- **Trustana, CC's framing (2026-11-24):** joined as the second hire, promoted from Senior to
  Lead, **the only designer until the Graas acquisition (August 2026)**, and took the product from
  zero to one: a B2B marketplace, then PIM and AI enrichment, then Commerce Agents; enterprise
  retailers across APAC and the Middle East used it to process 30K+ SKUs a month. "Only designer
  until the acquisition" is CC's own wording; the LinkedIn notes still say "most of the past five
  years" (CC to update), so don't revert to "most of".
- **UX years count from AsiaRooms (2013).** Aleph-Labs (2011-12) was UI and graphic work. In
  2026 that makes thirteen years.
- **AI years count from Saleswhale (2019),** an AI-first startup, through Trustana: seven years.
- **Location:** CC is based in Penang and ready to work globally (since 2026-10-12; was Singapore).
  In headers, descriptions and `llms.txt` (2026-11-25): "Penang, Malaysia (UTC+8) · Open to remote,
  worldwide". "Remote" is the term recruiters and answer engines search for; the time zone answers
  the remote hirer's first question. Relocation is not confirmed: don't add it unless CC says so.
- Trustana's most recent work: agentic commerce, "Trustana's Commerce Agents", launched July 2026.
- If a fact isn't in the sources, stop and ask CC. Don't round, extrapolate or fill gaps.

## 2. Voice

- **Plain over storytelling.** No origin anecdotes, pivot stories or payoff lines. CC rejected a
  restyle in vladmoroz.com's style as "too blunt" (admissions like a product that "didn't find its
  market"). Improve clarity and word choice line by line; offer a style device one at a time,
  never a full restyle.
- **Minimal.** Vlad-length: "the details, but not the full long story". Cut anything that repeats
  the intro, and anything that only adds detail without value ("do we really need these details?
  does it help to add value?"). Propose removals before additions.
- **Say whose moment it is.** "Joined as the second hire and was the only designer" read as if CC
  was the only designer *on the day they joined* (CC: "very badly written, confusing"). Keep each
  claim in its own clause or fragment ("The second hire, promoted…", "The only designer until…").
- **Past tense for past roles**, and no pivot stories: "a B2B marketplace, then PIM and AI
  enrichment" shows the change without narrating it.
- **No slogans or trying too hard.** "I design how people steer AI, not the AI itself" was
  "trying too hard"; the headline became "Hi, I'm CC." Rejected: "Cut scope, not care",
  "ideas are cheap".
- **Concrete words:** "workflows" not "features", scale via real numbers from the sources,
  "Trustana's agent commerce" rather than a long explanation.
- **No em dashes** in any user-facing string, including aria labels and alt text. Use a colon
  or rephrase.
- Principles follow one pattern: a context sentence, then an "I ..." sentence.
- **Add a keyword by inserting it,** not by rewriting the sentence around it. For "early stage
  AI product teams", "the last seven at early-stage B2B SaaS startups building AI products" was
  accurate but long; CC chose "seven of them shaping B2B AI products" ("keep it short"). Same
  for the status card: "freelance IC work", not a new "IC roles: …" sentence.
- **No dated lines** ("Updated October 2026") or small labels that only repeat the obvious
  ("Status"). CC removed both from the status card and About "Now" (#104, #105): they go stale.

## 3. The loop

1. Draft 2 to 3 options with **one recommendation** and a one-line reason each. Keep them short.
2. When CC picks (or says "try it"), put it **on the page** and show it on localhost. CC judges
   copy in place, not in chat.
3. Iterate line by line on CC's notes. Once CC says "lock this", treat it as final and record it
   in memory (`project_about_intro_copy_locked.md` holds the About page).
4. Keep copy changes on their own branch and devlog entry (`copy/<slug>`), and ship only when CC
   says "commit and merge".

**When CC asks for a debate**, run critics in rounds: a head of product, a copy editor, an
engineering lead and an AI-native design lead, each reacting to the current draft. CC's rule for
ending it: the loop ends when a round has produced new or better ideas. Then bring back the
best version with a recommendation, not the transcript.

## 4. Checks before showing CC

- Every fact traces to one of the sources above.
- No customer names, no em dashes, no stale Trustana line, year counts as above.
- The copy fits its box: on the spiral card, the keyword list stays about 200 characters so the
  type stays the same size.
- The intro card (72 px desktop, 30 px phones) and the status card keep their line count: check
  headless on desktop and iPhone that no word sits alone on the last line.
