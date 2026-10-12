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

**Fact rules (CC's corrections):**
- **No customer names in the portfolio.** Vallen Asia, David Jones, OCBC etc. belong in the
  resume or CV only.
- **CC left Trustana** (last day 28 Sep 2026, after Graas acquired it). Anything saying "Right
  now I'm at Trustana" is stale. CC is available for full-time, contract or freelance work.
- **UX years count from AsiaRooms (2013).** Aleph-Labs (2011-12) was UI and graphic work. In
  2026 that makes thirteen years.
- **AI years count from Saleswhale (2019),** an AI-first startup, through Trustana: seven years.
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
- **No slogans or trying too hard.** "I design how people steer AI, not the AI itself" was
  "trying too hard"; the headline became "Hi, I'm CC." Rejected: "Cut scope, not care",
  "ideas are cheap".
- **Concrete words:** "workflows" not "features", scale via real numbers from the sources,
  "Trustana's agent commerce" rather than a long explanation.
- **No em dashes** in any user-facing string, including aria labels and alt text. Use a colon
  or rephrase.
- Principles follow one pattern: a context sentence, then an "I ..." sentence.

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
