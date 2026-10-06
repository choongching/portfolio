# designby.cc: standing rules

## Copy

- No em dashes in any copy. Use a colon or rephrase.
- Do not invent copy, features or numbers. If something doesn't match what you were told, stop and ask CC.

## Process

- One change = one branch = one PR = one devlog entry (`docs/devlog.md`, newest first).
- Handoff notes from Cowork live in `research/` with a dated filename (`YYYY-MM-DD-<slug>.md`).

## Media

- Adapt the box to the video, never the video to the box.
- Trustana hero video: 2560x1604, 60fps, no audio. The lossless master lives in
  `~/Downloads/Screen Charm Footages/montage/`; never commit it. Re-encode from the master only,
  never from the web files. Procedure: the `rebuild-hero-video` skill.

## Landing study (`designbycc-landing/`)

- Before touching slider cards or card-to-page transitions, load the `slider-page-transitions`
  skill. Every card exists twice (desktop + mobile tree); nothing may sit between slides.
- Verify layout changes with `.claude/skills/slider-page-transitions/check-slider.mjs`, not by
  counting elements.
