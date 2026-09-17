// maplibre-gl v6 resolves its worker via a computed `new URL(...)` that bundlers
// cannot statically analyze, so the worker (and the shared chunk it imports) are
// never emitted -> 404 on maplibre-gl-worker.mjs / maplibre-gl-shared.mjs and the
// map fails. Importing the worker with Vite's `?worker&url` routes it through
// Vite's worker pipeline, which inlines the shared chunk into one hashed asset,
// and setWorkerUrl points maplibre at it. Works in dev and in the nginx prod build.
//
// NB: `?url` alone is NOT enough — it copies the worker verbatim, leaving its
// relative `./maplibre-gl-shared.mjs` import unresolved (the second 404).
// Import this module once, before any map is constructed.
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);
