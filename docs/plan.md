

## Add Mixed Media Support to ProjectCard

### What changes

1. **Install `lottie-react`** for Lottie animation rendering.

2. **Update the `Project` interface** to accept a `media` array where each item specifies its type:
   ```ts
   type MediaItem =
     | { type: "image"; src: string; alt?: string }
     | { type: "video"; src: string; poster?: string; webmSrc?: string }
     | { type: "lottie"; src: string }; // path to .json
   ```

3. **Create a `GallerySlot` component** that renders the correct element based on `type`:
   - `image` → `<img>` with lazy loading
   - `video` → `<video autoPlay muted loop playsInline>` with MP4 + optional WebM `<source>`
   - `lottie` → `<Lottie>` from `lottie-react`, loading JSON dynamically

4. **Update `ProjectCard`** to map over `project.media` instead of the hardcoded `[1,2,3]` array. Falls back to placeholder boxes if no media is provided.

5. **Update `Projects.tsx`** to populate `media` arrays with the test files you provide.

6. **Test end-to-end** in the preview to verify all three media types render correctly.

### Files to edit
- `package.json` — add `lottie-react`
- `src/components/ProjectCard.tsx` — new interface + `GallerySlot` + updated render
- `src/components/Projects.tsx` — add media data to project entries

Waiting for your test files before implementation.

