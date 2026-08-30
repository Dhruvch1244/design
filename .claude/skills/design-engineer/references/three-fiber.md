# React Three Fiber (3D / WebGL)

## When this is the right call

A 3D scene, a shader background, an interactive product viewer, a WebGL
particle field. Not for anything a CSS gradient/animation/SVG can achieve —
3D has a real performance and complexity cost; reach for it because the
brief needs depth/lighting/geometry, not because it looks impressive in a
demo reel.

## The stack

- **`@react-three/fiber`** — a React renderer that targets Three.js instead
  of the DOM. Scene graph becomes JSX: `<mesh><boxGeometry/><meshStandardMaterial/></mesh>`.
  React version compatibility matters — fiber major versions track React
  majors (a fiber version built for React 18's concurrent features can
  break on React 19's changes to `use`/refs, and vice versa); check the
  installed React version against fiber's peer dependency before assuming
  an API from a different major still applies.
- **`@react-three/drei`** — the "everything else" helper library:
  `<OrbitControls>`, `<Environment>` (HDRI lighting in one line),
  `<Text>` (SDF-rendered 3D text without manually loading a font),
  `<PerspectiveCamera>`, `useGLTF` (model loading with caching/suspense).
  Almost every real R3F project needs drei alongside fiber — treat it as a
  default dependency, not an optional add-on.
- **`three`** itself is a peer dependency — fiber is a renderer for it, not
  a replacement. Raw Three.js APIs (`THREE.Vector3`, `THREE.Color`) are
  still what you reach for inside fiber components for math/values that
  don't need to be JSX.

## Performance budget (this is where R3F scenes go wrong on real pages)

- **One `<Canvas>` per page, not per component.** Each Canvas spins up its
  own WebGL context and render loop; multiple contexts on one page tank
  frame rate fast, especially on mobile GPUs.
- **`frameloop="demand"`** on the `<Canvas>` for scenes that don't need to
  render every frame (a static product view the user can only orbit, not
  an animated background) — this stops the render loop unless something
  explicitly calls `invalidate()`, saving battery/CPU for scenes that are
  mostly static.
- **Instance, don't duplicate.** Many copies of the same geometry
  (particles, a grid of objects) should use `InstancedMesh`
  (`<Instances>`/`<Instance>` in drei) — one draw call for thousands of
  objects instead of thousands of draw calls.
- **Suspense boundaries around asset loading.** `useGLTF`/`useTexture` throw
  promises; wrap the scene contents in `<Suspense fallback={...}>` inside
  the Canvas, and show a real loading state, not a blank frame.
- **Dispose of geometries/materials you create imperatively.** Anything
  built with `new THREE.BufferGeometry()` etc. outside of drei's declarative
  helpers needs manual `.dispose()` in a cleanup effect, or it leaks GPU
  memory across route changes in an SPA.
- **Mobile is not an afterthought.** Test the actual frame rate on a mid-tier
  phone, not just desktop Chrome — WebGL performance gaps between desktop
  and mobile GPUs are large. A scene that's smooth at 60fps on a dev laptop
  can be a slideshow on a three-year-old Android device; reduce particle
  counts / shadow resolution / post-processing behind a device-capability
  check (`navigator.hardwareConcurrency`, or drei's `<AdaptiveDpr>`/
  `<AdaptiveEvents>`) rather than shipping one fixed quality level.

## Stale training data warning

R3F's API around `useFrame`, event handling (`onPointerOver` etc. on
meshes), and `extend()` for registering custom Three.js classes as JSX
tags has been stable for a while, but **React 19 support (fiber v9)**
changed some internals around concurrent rendering — if the repo is on
React 19, verify the installed `@react-three/fiber` major is the one built
for it rather than assuming an older fiber major "just works," since peer
dependency mismatches here fail at runtime with unhelpful errors, not at
install time.

## Common shortcut: a shader background without hand-writing GLSL boilerplate

`@react-three/drei`'s `<shaderMaterial>` wrapper plus a small vertex/fragment
pair is usually enough for an ambient background effect (a mesh gradient, a
noise field) — reach for a full postprocessing pipeline
(`@react-three/postprocessing`) only when the effect genuinely needs
screen-space passes (bloom, depth-of-field, chromatic aberration), since
each pass is a full extra render cost.
