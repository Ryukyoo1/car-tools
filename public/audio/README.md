# CAR TOOLS — Ambient Audio

The Ambient tool generates its sounds **procedurally with the Web Audio API**
(filtered white / pink / brown noise), so it works fully offline with no bundled
audio files and no copyright concerns.

## Adding real audio files (optional)

If you prefer real recordings, drop files here, e.g.:

- `rain.mp3`
- `ocean.mp3`
- `forest.mp3`
- `fireplace.mp3`
- `cafe.mp3`
- `road.mp3`

Then extend `services/audio.ts` (`AmbientEngine`) to load `/audio/<name>.mp3`
via an `HTMLAudioElement` and fall back to the procedural generator when the file
is missing. The UI and mixing architecture already support both approaches.
