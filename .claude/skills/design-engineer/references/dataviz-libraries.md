# Data visualization: library selection

Chart *design* (color, form, accessibility, layout) is owned by the
`dataviz` skill — load that before building any chart, regardless of which
library you end up using. This doc only covers picking the library.

| Library | What it is | Reach for it when |
|---|---|---|
| **Recharts** | Declarative React chart components (`<LineChart>`, `<BarChart>`) built on D3 internals, SVG output. | Standard business-dashboard charts (line/bar/area/pie) and you want to move fast with minimal custom logic. The default choice for "add a chart to this dashboard." |
| **visx** | Airbnb's low-level D3-for-React primitives — scales, shapes, axes as composable React components, no opinionated chart wrapper. | The design calls for something Recharts' preset chart types can't express — a custom layout, an unusual interaction, precise control over every SVG element. More code, full control. |
| **Observable Plot** | A grammar-of-graphics API (`Plot.plot({ marks: [...] })`) for fast, information-dense exploratory charts, not React-native (works standalone or wrapped in a `useEffect` that mounts its SVG output). | Quick, correct statistical charts (small multiples, faceting, unusual aggregate types) where writing the equivalent by hand in Recharts/visx would take much longer — data exploration and editorial/journalistic charts more than product dashboards. |
| **D3 directly** | The full library — scales, shapes, forces, geo projections, everything above is built on subsets of it. | Force-directed graphs, geo/map projections, or any visualization type none of the above wrap — reach for it as a last resort given its steeper API, not a first choice for a standard chart. |
| **Nivo** | Pre-styled, themeable chart components (wraps D3 + visx internally), broad chart-type coverage including some visx doesn't preset (sankey, chord, calendar heatmap). | You want Recharts-level "just render a chart type" convenience but need a type Recharts doesn't ship (sankey, radar with more control, calendar heatmaps) — check its bundle size cost against your budget before adding it alongside Recharts rather than instead of it. |

## Rule of thumb

Don't install two chart libraries "just in case." Pick Recharts as the
default; drop to visx only for the specific chart that needs it, in the
same codebase, rather than swapping the whole dashboard to a lower-level
library because one chart is unusual.

## Canvas/WebGL for scale

All of the above render SVG, which degrades past roughly a few thousand
plotted points (DOM node count, not math). For genuinely large datasets
(streaming sensor data, a scatter plot with 100k+ points), reach for a
canvas-based renderer — `uPlot` (extremely fast, minimal API, time-series
focused) or deck.gl (geospatial/large-scale, WebGL-based) — rather than
trying to make an SVG library scale past what SVG rendering can handle.
