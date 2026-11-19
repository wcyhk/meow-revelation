# Rendering regression checks

Run from a deployment tree (with the generated offline manifest) on Windows with Chrome and Node 22:

```
node tools/test-model-reserve.mjs
node tools/smoke-render-resources.cjs <absolute-deployment-directory>
node tools/profile-render-resources.cjs <absolute-deployment-directory>
```

The browser checks use a fresh temporary Chrome profile and a local static server. They do not use an existing browser profile. Screenshots go to the system temporary directory, `eclipse-review`. An optional second argument checks a deployed URL. The smoke test includes a service-worker offline cold launch, so its input must have the exact bytes represented by `offline-assets.js` (archive git with `-c core.autocrlf=false`).

## 2026-11-19 comparison

Baseline: `9aeb216`. Chrome/ANGLE on Intel UHD D3D11; emulated phone layout 390×844, DPR 2, render ratio 1.35; 3× CPU throttling after initialization. Both runs use identical room/boss sequences. This is a browser/desktop-GPU measurement, not a physical-phone FPS claim. First-frame timings explicitly include `gl.finish()` to account for queued GPU work.

| Measure | Baseline | Updated |
| --- | ---: | ---: |
| Median first room render, 13 transitions | 193.2 ms | 59.6 ms |
| Median repeated boss construction, four bosses | 202.5 ms | 1.5 ms |
| Repeated boss first render | 147.9–230.0 ms | 6.2–13.9 ms |

Room draw calls and triangle counts match the baseline for every measured floor. Shader/texture preparation happens during loading; next-room models and incoming bosses are prepared during the reward pause. The initial loading screen can therefore take longer. A cache miss still has construction/upload costs, especially when deliberately jumping directly to a later room.

Four stress cycles across 20 room configurations and ten boss families stabilized at 469 GPU geometries, 95 textures and 100 programs in this run. Detached mobile rigs occupied 15,787,288 estimated bytes under the 16 MiB reserve limit. Explicitly clearing the reserve reduced GPU geometry count from 469 to 98. These counters are renderer resources, not total device memory; active actors, textures, program binaries and driver allocations are separate. Desktop reserve limit: 32 MiB.

Smoke coverage: real authored rig reset after reuse, independent twins, stable hit-flash shader wrapping, immediate reward selection while prewarming is pending, later-room prewarming, live boss phase changes, double-boss encounters, phone skill tap/drag, weapon-hunter entrance, desktop layout and offline cold launch. Model eviction releases owned geometry, skin skeletons, energy systems and materials. Closing practice views clears their renderer-local reserve.
