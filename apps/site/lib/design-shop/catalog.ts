/**
 * Sableroot's catalog: the whole product domain, as plain data plus pure
 * functions over it.
 *
 * This module imports no React, no Next, and no component — the dsgn
 * philosophy's first pillar ("separation of concerns is physical, not just
 * logical") applied at the scale this project actually has. The test it has
 * to pass is the one that file states: could this be built and tested with
 * no UI toolchain installed at all? Yes — everything below is a value or a
 * function of values. Filtering, sorting, pagination, and price arithmetic
 * are decided here, never inside a component's render.
 *
 * Everything in it is invented for this demo. There is no real Sableroot.
 */

export type CategoryId = "coffee" | "brewing" | "ceramics" | "gifts";

/** Motif names resolved by components/product-art.tsx. Data never holds SVG. */
export type ArtMotif = "sun" | "ridge" | "tide" | "grain" | "orbit" | "vessel";

/** Tone names resolved to `var(--art-<tone>)`. Data never holds a hex value. */
export type ArtTone =
  | "clay"
  | "sage"
  | "ochre"
  | "plum"
  | "slate"
  | "moss"
  | "rose"
  | "sand"
  | "espresso";

export interface OptionValue {
  id: string;
  label: string;
  /** Added to the product's base price, in cents. */
  priceDelta: number;
}

export interface ProductOption {
  id: string;
  label: string;
  /** `select` renders a Select; `chips` renders a single-select ToggleGroup. */
  kind: "select" | "chips";
  values: OptionValue[];
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  when: string;
  title: string;
  body: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  category: CategoryId;
  /** Base price in cents. Money is integer cents everywhere; never a float. */
  price: number;
  /** Struck-through original, in cents, when the product is marked down. */
  wasPrice?: number;
  tone: ArtTone;
  motif: ArtMotif;
  inStock: boolean;
  featured?: boolean;
  flag?: string;
  /** One paragraph, written to be read — this voice expects prose. */
  description: string;
  notes: string[];
  specs: Spec[];
  /** Rendered under the product page's second tab. */
  method: string;
  options: ProductOption[];
  reviews: Review[];
}

/**
 * Categories carry their own tone/motif pair rather than borrowing one from a
 * sample product. Deriving the artwork from "whatever is featured today" meant
 * two of the four shelves drew the same sun-on-ochre tile whenever the
 * featured set overlapped — the row read as a rendering bug, not four shelves.
 */
export const CATEGORIES: {
  id: CategoryId;
  label: string;
  blurb: string;
  tone: ArtTone;
  motif: ArtMotif;
}[] = [
  {
    id: "coffee",
    label: "Coffee",
    blurb: "Roasted Tuesdays, shipped Wednesdays.",
    tone: "ochre",
    motif: "sun",
  },
  {
    id: "brewing",
    label: "Brewing",
    blurb: "The short list of things worth owning.",
    tone: "slate",
    motif: "vessel",
  },
  {
    id: "ceramics",
    label: "Ceramics",
    blurb: "Thrown in small runs, so runs sell out.",
    tone: "clay",
    motif: "orbit",
  },
  {
    id: "gifts",
    label: "Gifts",
    blurb: "Boxed, with a card you can actually write on.",
    tone: "moss",
    motif: "grain",
  },
];

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  coffee: "Coffee",
  brewing: "Brewing",
  ceramics: "Ceramics",
  gifts: "Gifts",
};

const GRINDS: OptionValue[] = [
  { id: "whole", label: "Whole bean", priceDelta: 0 },
  { id: "filter", label: "Filter / drip", priceDelta: 0 },
  { id: "espresso", label: "Espresso", priceDelta: 0 },
  { id: "press", label: "French press", priceDelta: 0 },
  { id: "moka", label: "Moka pot", priceDelta: 0 },
];

/**
 * Bag sizes are per-product because the 1kg step is a real multiple of that
 * coffee's own price, not a flat surcharge — a fixed delta would quietly
 * make the cheapest bag the worst value per gram and the priciest the best,
 * which is the opposite of how a roaster actually prices weight.
 */
function bagSizes(basePrice: number): ProductOption {
  return {
    id: "size",
    label: "Bag size",
    kind: "chips",
    values: [
      { id: "250g", label: "250 g", priceDelta: 0 },
      { id: "1kg", label: "1 kg", priceDelta: Math.round(basePrice * 2.6) },
    ],
  };
}

const coffeeOptions = (basePrice: number): ProductOption[] => [
  bagSizes(basePrice),
  { id: "grind", label: "Grind", kind: "select", values: GRINDS },
];

export const PRODUCTS: Product[] = [
  {
    slug: "ember-ridge",
    name: "Ember Ridge",
    tagline: "Ethiopia · Guji · natural",
    category: "coffee",
    price: 2200,
    tone: "ochre",
    motif: "sun",
    inStock: true,
    featured: true,
    flag: "New lot",
    description:
      "Our loudest coffee of the year, and the one we argue about most. Dried on raised beds for eighteen days, which pushes it well past the polite end of a natural process — you get apricot skin and a syrupy weight that lingers longer than it has any right to. It is not a subtle cup, and we have stopped apologising for that.",
    notes: ["Apricot", "Cane sugar", "Jasmine"],
    specs: [
      { label: "Producer", value: "Adola Washing Station" },
      { label: "Altitude", value: "1,950–2,100 m" },
      { label: "Varietal", value: "Heirloom (74110, 74112)" },
      { label: "Process", value: "Natural, 18-day raised bed" },
      { label: "Roast", value: "Light" },
      { label: "Harvest", value: "November 2025" },
    ],
    method:
      "Best as a pour-over. 18 g coffee to 300 g water at 94 °C, medium grind, a 45-second bloom with 50 g, then two even pours. Total time around 2:45. It will take a hotter, faster brew than most naturals without turning astringent, so if the cup reads flat, grind finer before you reach for more coffee.",
    options: coffeeOptions(2200),
    reviews: [
      {
        id: "r1",
        author: "Priya Raman",
        initials: "PR",
        rating: 5,
        when: "3 weeks ago",
        title: "Worth the fuss",
        body: "I brewed this side by side with a washed Ethiopian I had open and it made the other bag taste like water. The apricot note is not marketing — it is just there, in the cup, immediately.",
      },
      {
        id: "r2",
        author: "Tomas Lindqvist",
        initials: "TL",
        rating: 4,
        when: "1 month ago",
        title: "Great, but grind fine",
        body: "First two brews were thin at my usual setting. Went two clicks finer and it opened right up. Docking one star only because the bag says medium grind and medium was wrong for me.",
      },
      {
        id: "r3",
        author: "Amara Osei",
        initials: "AO",
        rating: 5,
        when: "1 month ago",
        title: "The one I re-order",
        body: "Third bag. It holds up on a cheap flat-bottom brewer too, which matters when I am at the office.",
      },
    ],
  },
  {
    slug: "nightfall",
    name: "Nightfall",
    tagline: "House blend · dark roast",
    category: "coffee",
    price: 1900,
    tone: "espresso",
    motif: "orbit",
    inStock: true,
    featured: true,
    description:
      "The bag we sell most of, and the reason people find us. Two thirds Brazilian pulped natural for body, one third washed Sumatran for the low, resinous end. Taken darker than we take anything else, but stopped short of the point where roast flavour replaces origin flavour — there is still cocoa and plum under the smoke.",
    notes: ["Cocoa", "Black plum", "Toasted walnut"],
    specs: [
      { label: "Composition", value: "67% Brazil, 33% Sumatra" },
      { label: "Process", value: "Pulped natural / wet hulled" },
      { label: "Roast", value: "Dark" },
      { label: "Best for", value: "Milk drinks, French press" },
      { label: "Rest", value: "5–7 days off roast" },
    ],
    method:
      "Forgiving everywhere, best in a French press. 60 g per litre, coarse, four minutes, break the crust and skim. In an espresso basket pull it long — 18 g in, 40 g out, 30 seconds — because a short ristretto pushes the Sumatran component into something closer to ash.",
    options: coffeeOptions(1900),
    reviews: [
      {
        id: "r1",
        author: "Dan Whitfield",
        initials: "DW",
        rating: 5,
        when: "2 weeks ago",
        title: "Our office standard",
        body: "We go through a kilo a fortnight. It is the only dark roast anyone here agrees on, which after two years of arguing is a genuine result.",
      },
      {
        id: "r2",
        author: "Els Meijer",
        initials: "EM",
        rating: 4,
        when: "2 months ago",
        title: "Better with milk",
        body: "Black it is a touch heavy for me, but in a flat white it is exactly right. Bought the kilo the second time round.",
      },
    ],
  },
  {
    slug: "amber-hollow",
    name: "Amber Hollow",
    tagline: "Colombia · Huila · washed",
    category: "coffee",
    price: 2100,
    tone: "clay",
    motif: "ridge",
    inStock: true,
    featured: true,
    description:
      "A clean, unhurried washed Colombian that we keep in rotation because it never has an off week. Red apple and caramel, with enough acidity to stay interesting through a whole mug. If someone asks what coffee tastes like when nothing has gone wrong, this is the bag we hand them.",
    notes: ["Red apple", "Caramel", "Almond"],
    specs: [
      { label: "Producer", value: "Finca La Hondonada" },
      { label: "Altitude", value: "1,700–1,850 m" },
      { label: "Varietal", value: "Caturra, Castillo" },
      { label: "Process", value: "Washed, 36-hour ferment" },
      { label: "Roast", value: "Medium" },
      { label: "Harvest", value: "September 2025" },
    ],
    method:
      "Happy in almost anything. For a flat-bottom brewer: 30 g to 500 g at 96 °C, medium-coarse, three pours, done by 3:30. It is the coffee we hand to people who have just bought their first grinder, because it tastes good across a wide band of settings instead of only one.",
    options: coffeeOptions(2100),
    reviews: [
      {
        id: "r1",
        author: "Hana Sato",
        initials: "HS",
        rating: 5,
        when: "1 week ago",
        title: "Reliable in the best way",
        body: "Not the most dramatic bag I have had from Sableroot but I have never brewed a bad cup of it, including the ones I made badly.",
      },
      {
        id: "r2",
        author: "Marcus Bell",
        initials: "MB",
        rating: 5,
        when: "6 weeks ago",
        title: "Good in the moka pot",
        body: "Ordered it ground for moka and it holds up. Caramel really comes forward with the extra pressure.",
      },
    ],
  },
  {
    slug: "cold-front",
    name: "Cold Front",
    tagline: "Cold brew blend · coarse",
    category: "coffee",
    price: 1850,
    tone: "slate",
    motif: "tide",
    inStock: true,
    description:
      "Blended backwards from the finished drink rather than the hot cup. Cold water pulls less acidity and far less aromatic detail, so this leans on a heavier Brazilian base and a small percentage of dark-roasted Guatemalan to give the concentrate somewhere to go once it hits ice and milk.",
    notes: ["Molasses", "Cola nut", "Baker's chocolate"],
    specs: [
      { label: "Composition", value: "80% Brazil, 20% Guatemala" },
      { label: "Roast", value: "Medium-dark" },
      { label: "Grind", value: "Extra coarse recommended" },
      { label: "Yield", value: "1 kg makes ~6 L of concentrate" },
    ],
    method:
      "One part coffee to five parts cold water by weight. Steep sixteen hours at room temperature, not in the fridge — cold steeping needs the extra time and the extra warmth to get anywhere. Strain twice, dilute one to one, and use it within five days.",
    options: coffeeOptions(1850),
    reviews: [
      {
        id: "r1",
        author: "Jo Ferreira",
        initials: "JF",
        rating: 4,
        when: "3 weeks ago",
        title: "Does what it says",
        body: "Sixteen hours felt long and I nearly cut it short. Do not cut it short.",
      },
    ],
  },
  {
    slug: "rye-house",
    name: "Rye House Espresso",
    tagline: "Espresso blend · three origins",
    category: "coffee",
    price: 2300,
    tone: "plum",
    motif: "grain",
    inStock: true,
    flag: "Café blend",
    description:
      "The blend our own counter pulls all day. Built for a nine-bar machine and a milk drink, with enough structure that a straight double still reads as a coffee rather than a syrup. Reformulated twice a year as lots run out, so the bag date matters more than usual — the current build leans on a Honduran component that arrived in January.",
    notes: ["Dark cherry", "Brown sugar", "Cacao nib"],
    specs: [
      { label: "Composition", value: "Honduras, Brazil, Ethiopia" },
      { label: "Roast", value: "Medium-dark" },
      { label: "Recipe", value: "18 g in, 38 g out, 28 s" },
      { label: "Rest", value: "7–10 days off roast" },
      { label: "Best before", value: "12 weeks from roast" },
    ],
    method:
      "Give it a week in the bag before you dial it in — pulled at three days it gasses badly and the shot channels no matter what you do to the grind. Start at 18 g in for 38 g out in 28 seconds at 93 °C, then move the temperature, not the ratio, if it reads sharp.",
    options: coffeeOptions(2300),
    reviews: [
      {
        id: "r1",
        author: "Caro Nunes",
        initials: "CN",
        rating: 5,
        when: "4 days ago",
        title: "Dialed in on the second shot",
        body: "Rested it a week as instructed and it was almost embarrassingly easy to dial. Cherry note is real in a cortado.",
      },
      {
        id: "r2",
        author: "Ivan Petrov",
        initials: "IP",
        rating: 4,
        when: "1 month ago",
        title: "Great, changes though",
        body: "This bag tasted noticeably different from my last one. Not worse — just different. Worth knowing if you like consistency above all.",
      },
    ],
  },
  {
    slug: "meridian-decaf",
    name: "Meridian Decaf",
    tagline: "Colombia · sugarcane EA",
    category: "coffee",
    price: 2000,
    tone: "sage",
    motif: "orbit",
    inStock: true,
    description:
      "Decaffeinated with ethyl acetate derived from sugarcane, in Colombia, close to where it was grown — which keeps the green coffee out of a shipping container for an extra two months and shows up in the cup as sweetness that survived the process. We roast it a shade darker than the caffeinated equivalent because decaf beans take on colour faster than they take on flavour.",
    notes: ["Milk chocolate", "Orange peel", "Malt"],
    specs: [
      { label: "Origin", value: "Colombia, Risaralda" },
      { label: "Process", value: "Sugarcane EA, 99.9% caffeine-free" },
      { label: "Roast", value: "Medium" },
      { label: "Varietal", value: "Castillo" },
    ],
    method:
      "Treat it like a normal medium roast, then grind one step finer. Decaffeinated beans are more brittle and produce more fines, so the same setting that worked yesterday on a caffeinated bag will over-extract here. 18 g to 290 g, 93 °C, three pours.",
    options: coffeeOptions(2000),
    reviews: [
      {
        id: "r1",
        author: "Ruth Adeyemi",
        initials: "RA",
        rating: 5,
        when: "2 weeks ago",
        title: "Finally, an evening coffee",
        body: "I have tried a lot of decaf and most of it tastes like the idea of coffee. This one does not.",
      },
    ],
  },
  {
    slug: "quiet-harvest",
    name: "Quiet Harvest",
    tagline: "Guatemala · Antigua · washed",
    category: "coffee",
    price: 2400,
    tone: "moss",
    motif: "ridge",
    inStock: true,
    flag: "Limited · 300 bags",
    description:
      "Three hundred bags, and when they are gone we will not have more until next season. A single-estate Antigua grown in volcanic soil at the top of what the region can ripen, picked over four passes instead of the usual two. Dense, structured, and a little austere on the first sip — give it two minutes off the boil and it opens into stone fruit.",
    notes: ["Nectarine", "Cocoa", "Bergamot"],
    specs: [
      { label: "Producer", value: "Estancia Verde" },
      { label: "Altitude", value: "1,600–1,750 m" },
      { label: "Varietal", value: "Bourbon" },
      { label: "Process", value: "Washed" },
      { label: "Roast", value: "Light-medium" },
      { label: "Lot size", value: "300 bags" },
    ],
    method:
      "Worth a slower brew than you would normally give a washed coffee. 20 g to 320 g at 92 °C in a conical dripper, four pours of 80 g, forty seconds between each. Let the cup sit until it stops steaming before you judge it.",
    options: coffeeOptions(2400),
    reviews: [
      {
        id: "r1",
        author: "Nils Berger",
        initials: "NB",
        rating: 5,
        when: "5 days ago",
        title: "Bought two",
        body: "Bought a second bag the day after the first arrived because I did not trust myself to remember before it sold out.",
      },
      {
        id: "r2",
        author: "Sasha Kovač",
        initials: "SK",
        rating: 4,
        when: "3 weeks ago",
        title: "Needs to cool",
        body: "Genuinely a different coffee at 60 °C than at 80 °C. Be patient with it.",
      },
    ],
  },
  {
    slug: "wintering",
    name: "Wintering",
    tagline: "Seasonal blend · winter 2026",
    category: "coffee",
    price: 2050,
    tone: "rose",
    motif: "tide",
    inStock: false,
    description:
      "Our winter blend, sold out and not being re-roasted until the next crop lands. Built around a Peruvian component we could only get twelve bags of, so rather than substitute something else and keep the name on the shelf, we took it down. Back in around March.",
    notes: ["Dried fig", "Clove", "Demerara"],
    specs: [
      { label: "Composition", value: "Peru, Brazil" },
      { label: "Roast", value: "Medium" },
      { label: "Status", value: "Sold out — returns March" },
    ],
    method:
      "Brewed well as a heavier pour-over: 18 g to 280 g, 94 °C, two pours. It also made a genuinely good moka pot, which is not something we say often about a medium roast.",
    options: coffeeOptions(2050),
    reviews: [
      {
        id: "r1",
        author: "Greta Lund",
        initials: "GL",
        rating: 5,
        when: "2 months ago",
        title: "Please bring it back",
        body: "Drank the whole kilo in three weeks. The clove note is not subtle and I did not want it to be.",
      },
    ],
  },

  {
    slug: "fold-dripper",
    name: "Fold Dripper",
    tagline: "Glazed stoneware · flat bottom",
    category: "brewing",
    price: 4600,
    tone: "sand",
    motif: "vessel",
    inStock: true,
    featured: true,
    description:
      "A flat-bottomed stoneware cone with three drainage slots instead of one hole, which slows the drawdown enough to forgive a grinder that is not producing a perfectly even particle size. Made for us in a workshop that fires two runs a month. Heavy — deliberately so, because a preheated stoneware brewer holds temperature across the whole brew in a way a plastic one cannot.",
    notes: ["Stoneware", "Lead-free glaze", "Dishwasher safe"],
    specs: [
      { label: "Material", value: "Stoneware, matte exterior glaze" },
      { label: "Capacity", value: "Up to 500 ml brewed" },
      { label: "Filter", value: "Size 02 flat-bottom paper" },
      { label: "Weight", value: "410 g" },
      { label: "Care", value: "Dishwasher safe, no thermal shock" },
    ],
    method:
      "Rinse the paper and preheat the cone with the rinse water — a cold stoneware brewer will pull four or five degrees out of your first pour. 22 g to 360 g, medium grind, bloom 60 g for forty seconds, then two pours of 150 g.",
    options: [
      {
        id: "size",
        label: "Size",
        kind: "chips",
        values: [
          { id: "01", label: "1–2 cup", priceDelta: 0 },
          { id: "02", label: "2–4 cup", priceDelta: 600 },
        ],
      },
      {
        id: "glaze",
        label: "Glaze",
        kind: "select",
        values: [
          { id: "bone", label: "Bone", priceDelta: 0 },
          { id: "clay", label: "Raw clay", priceDelta: 0 },
          { id: "moss", label: "Moss", priceDelta: 400 },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Peter Mwangi",
        initials: "PM",
        rating: 5,
        when: "1 month ago",
        title: "Heavier than expected, in a good way",
        body: "Sits flat, does not slide on the scale, keeps its heat. The three slots really do slow it down.",
      },
      {
        id: "r2",
        author: "Lucia Marin",
        initials: "LM",
        rating: 4,
        when: "2 months ago",
        title: "Lovely, but preheat it",
        body: "First few brews were underextracted until I read the note about preheating. Would put that on the box.",
      },
    ],
  },
  {
    slug: "stem-kettle",
    name: "Stem Kettle 0.9 L",
    tagline: "Gooseneck · stovetop and induction",
    category: "brewing",
    price: 8800,
    tone: "slate",
    motif: "vessel",
    inStock: true,
    description:
      "A gooseneck with a counterweighted handle, which sounds like a detail until you have poured 400 g of water and your wrist has not moved. The spout tapers over its last four centimetres so the stream stays narrow at low flow rates without needing you to tilt the whole kettle. Induction-ready base, no electronics to fail.",
    notes: ["18/8 stainless", "Counterweighted handle", "Induction ready"],
    specs: [
      { label: "Capacity", value: "900 ml to the fill line" },
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Base", value: "Tri-ply, induction compatible" },
      { label: "Handle", value: "Ash, counterweighted" },
      { label: "Weight", value: "760 g empty" },
    ],
    method:
      "Fill to the line, not past it — the counterweight is calibrated for a 900 ml pour and an overfilled kettle pours front-heavy. Off the boil, water sits at roughly 94 °C after thirty seconds in an uncovered kettle at room temperature, which is the number most of our brew guides assume.",
    options: [
      {
        id: "finish",
        label: "Finish",
        kind: "select",
        values: [
          { id: "matte", label: "Matte black", priceDelta: 0 },
          { id: "brushed", label: "Brushed steel", priceDelta: 0 },
          { id: "copper", label: "Copper wash", priceDelta: 1200 },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Adele Fournier",
        initials: "AF",
        rating: 5,
        when: "3 weeks ago",
        title: "The handle is the point",
        body: "I did not believe the counterweight claim. It is real and I notice it every single morning.",
      },
    ],
  },
  {
    slug: "field-grinder",
    name: "Field Grinder",
    tagline: "Hand grinder · 48 mm conical burr",
    category: "brewing",
    price: 13500,
    tone: "espresso",
    motif: "grain",
    inStock: true,
    flag: "Best seller",
    description:
      "Forty-eight millimetre hardened steel conical burrs in an aluminium body, with the adjustment ring under the burr rather than under the handle — so the setting does not drift as you grind, which is the failure that makes most hand grinders frustrating rather than merely slow. Thirty grams of medium grind takes about forty seconds.",
    notes: ["48 mm steel burrs", "Stepped adjustment", "Travel case"],
    specs: [
      { label: "Burrs", value: "48 mm hardened steel, conical" },
      { label: "Adjustment", value: "Stepped, 36 positions" },
      { label: "Capacity", value: "35 g" },
      { label: "Body", value: "Anodised aluminium" },
      { label: "Weight", value: "620 g" },
      { label: "Included", value: "Waxed canvas travel case" },
    ],
    method:
      "Espresso sits between positions 4 and 8, pour-over between 14 and 20, French press from 26 up. Always approach a setting from coarse to fine, turning the ring while the burrs are empty — adjusting under load is what chips a burr edge.",
    options: [],
    reviews: [
      {
        id: "r1",
        author: "Yusuf Karim",
        initials: "YK",
        rating: 5,
        when: "2 weeks ago",
        title: "No drift",
        body: "My last grinder wandered two clicks over a single bag. This one has not moved in a month.",
      },
      {
        id: "r2",
        author: "Beth Callan",
        initials: "BC",
        rating: 4,
        when: "5 weeks ago",
        title: "Heavy for travel",
        body: "The case is lovely but 620 g is 620 g. Great at home, a considered decision in a backpack.",
      },
    ],
  },
  {
    slug: "fold-filters",
    name: "Fold Filters, 100 ct",
    tagline: "Flat-bottom · unbleached",
    category: "brewing",
    price: 900,
    tone: "sand",
    motif: "grain",
    inStock: true,
    description:
      "Unbleached flat-bottom papers cut for the Fold Dripper and every other size 02 flat-bottom brewer. Thicker than the standard supermarket paper, which slows drawdown slightly and is the reason our brew guides call for a medium rather than a medium-fine grind.",
    notes: ["Unbleached", "Size 02", "100 per box"],
    specs: [
      { label: "Count", value: "100 per box" },
      { label: "Size", value: "02, flat bottom" },
      { label: "Paper", value: "Unbleached, 100 gsm" },
    ],
    method:
      "Rinse before every brew, without exception. Unbleached paper carries more of its own flavour than bleached, and thirty seconds of hot water removes essentially all of it.",
    options: [
      {
        id: "pack",
        label: "Pack",
        kind: "chips",
        values: [
          { id: "100", label: "100 ct", priceDelta: 0 },
          { id: "300", label: "300 ct", priceDelta: 1500 },
        ],
      },
    ],
    reviews: [],
  },
  {
    slug: "bench-scale",
    name: "Bench Scale",
    tagline: "0.1 g · built-in timer",
    category: "brewing",
    price: 7200,
    tone: "moss",
    motif: "orbit",
    inStock: true,
    description:
      "A 0.1 gram scale with a timer that starts on first drip instead of on a button, and a silicone mat that survives being poured on. Two-second response, which is slow enough not to flicker under a pour and fast enough to stop you at 360 g rather than 380 g.",
    notes: ["0.1 g resolution", "Auto-start timer", "USB-C"],
    specs: [
      { label: "Resolution", value: "0.1 g" },
      { label: "Capacity", value: "2,000 g" },
      { label: "Timer", value: "Auto-start on first drip" },
      { label: "Power", value: "USB-C, ~40 h per charge" },
      { label: "Surface", value: "Removable silicone mat" },
    ],
    method:
      "Tare with the brewer and the filter already on the plate, not before. The auto-timer only triggers on a weight change under 2 g, so a pre-wet filter that has not finished dripping will start the clock early.",
    options: [],
    reviews: [
      {
        id: "r1",
        author: "Owen Traoré",
        initials: "OT",
        rating: 4,
        when: "1 month ago",
        title: "Timer trick is great",
        body: "Auto-start took a couple of brews to trust. Now I would not go back to pressing a button with wet hands.",
      },
    ],
  },

  {
    slug: "tilde-mug",
    name: "Tilde Mug, 10 oz",
    tagline: "Hand-thrown · four glazes",
    category: "ceramics",
    price: 2800,
    tone: "clay",
    motif: "vessel",
    inStock: true,
    featured: true,
    description:
      "Ten ounces, which is the size a filter coffee actually is rather than the size a mug usually is. Thrown by hand, so the wall thickness varies by a millimetre or two between pieces and the glaze breaks differently over each rim. Slightly wider at the mouth than the base, which sounds cosmetic and is mostly about how fast the coffee cools.",
    notes: ["Hand-thrown", "10 oz / 300 ml", "Dishwasher safe"],
    specs: [
      { label: "Capacity", value: "300 ml to the rim" },
      { label: "Material", value: "Stoneware" },
      { label: "Height", value: "92 mm" },
      { label: "Care", value: "Dishwasher and microwave safe" },
      { label: "Note", value: "Each piece varies slightly" },
    ],
    method:
      "Warm it before you pour. A room-temperature stoneware mug takes about four degrees off a 300 ml filter coffee in the first thirty seconds, which is enough to change what the first sip tastes like.",
    options: [
      {
        id: "glaze",
        label: "Glaze",
        kind: "chips",
        values: [
          { id: "bone", label: "Bone", priceDelta: 0 },
          { id: "clay", label: "Raw clay", priceDelta: 0 },
          { id: "sage", label: "Sage", priceDelta: 0 },
          { id: "espresso", label: "Espresso", priceDelta: 300 },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Ines Delgado",
        initials: "ID",
        rating: 5,
        when: "1 week ago",
        title: "Bought four",
        body: "The variation between them is the nice part, not a flaw. All four sit differently in the hand.",
      },
      {
        id: "r2",
        author: "Rob Ainsley",
        initials: "RA",
        rating: 5,
        when: "6 weeks ago",
        title: "Right size",
        body: "Every other mug I own is either too small or a soup bowl. This one is correct.",
      },
    ],
  },
  {
    slug: "saucer-pair",
    name: "Saucer Pair",
    tagline: "Two saucers · matched glaze",
    category: "ceramics",
    price: 3400,
    tone: "sand",
    motif: "orbit",
    inStock: true,
    description:
      "Two saucers with a recessed well deep enough to actually hold a spill, glazed to match the Tilde Mug range. Sold in pairs because they are fired in pairs and a single would leave an odd piece in the kiln.",
    notes: ["Set of two", "Stoneware", "Matches Tilde range"],
    specs: [
      { label: "Diameter", value: "148 mm" },
      { label: "Set", value: "Two pieces" },
      { label: "Material", value: "Stoneware" },
      { label: "Care", value: "Dishwasher safe" },
    ],
    method:
      "Stacks four deep without chipping. Beyond four the bottom saucer takes the weight on its foot ring rather than its rim, which is where the hairline cracks start.",
    options: [
      {
        id: "glaze",
        label: "Glaze",
        kind: "chips",
        values: [
          { id: "bone", label: "Bone", priceDelta: 0 },
          { id: "clay", label: "Raw clay", priceDelta: 0 },
          { id: "sage", label: "Sage", priceDelta: 0 },
        ],
      },
    ],
    reviews: [],
  },
  {
    slug: "cellar-canister",
    name: "Cellar Canister",
    tagline: "Airtight · one-way valve",
    category: "ceramics",
    price: 3800,
    tone: "sage",
    motif: "vessel",
    inStock: true,
    description:
      "An opaque stoneware canister with a silicone-gasketed lid and a one-way valve in the underside, so the carbon dioxide a fresh bag is still giving off can leave without letting oxygen back in. Opaque matters more than airtight for storage — light does more damage to roasted coffee, faster, than air does.",
    notes: ["One-way valve", "Silicone gasket", "Opaque"],
    specs: [
      { label: "Capacity", value: "500 g whole bean" },
      { label: "Seal", value: "Silicone gasket, replaceable" },
      { label: "Valve", value: "One-way degassing" },
      { label: "Material", value: "Stoneware, unglazed interior" },
    ],
    method:
      "Store it in a cupboard at room temperature, not in the fridge or freezer. Every time a cold canister comes out into a warm kitchen, condensation forms on the beans, and moisture is the one thing an airtight seal cannot undo.",
    options: [
      {
        id: "size",
        label: "Size",
        kind: "chips",
        values: [
          { id: "500g", label: "500 g", priceDelta: 0 },
          { id: "1kg", label: "1 kg", priceDelta: 800 },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Fern Ashby",
        initials: "FA",
        rating: 5,
        when: "3 weeks ago",
        title: "Gasket is replaceable",
        body: "Bought partly because they sell the spare gasket. Small thing, but it means this is not disposable.",
      },
    ],
  },

  {
    slug: "ritual-kit",
    name: "The Ritual Kit",
    tagline: "Dripper, filters, mug, one bag",
    category: "gifts",
    price: 11800,
    wasPrice: 13400,
    tone: "ochre",
    motif: "sun",
    inStock: true,
    featured: true,
    flag: "Save £16",
    description:
      "Everything needed to make a good cup on the first morning, boxed together: a Fold Dripper, a hundred filters, one Tilde Mug and a 250 g bag of your choosing. We put this together because the most common message we get is from someone who bought good coffee and had nothing to brew it with.",
    notes: ["Four pieces", "Boxed", "Blank card included"],
    specs: [
      { label: "Contents", value: "Fold Dripper, 100 filters, Tilde Mug, 250 g coffee" },
      { label: "Box", value: "Recycled board, 240 × 210 × 150 mm" },
      { label: "Card", value: "Blank, letterpressed" },
      { label: "Saving", value: "£16 against buying separately" },
    ],
    method:
      "The enclosed card is the first-brew guide on one side and blank on the other, so it can be written on and given without needing wrapping. If you are shipping it as a gift, add the note at checkout and we will leave the invoice out of the box.",
    options: [
      {
        id: "coffee",
        label: "Coffee in the box",
        kind: "select",
        values: [
          { id: "ember-ridge", label: "Ember Ridge (250 g)", priceDelta: 0 },
          { id: "nightfall", label: "Nightfall (250 g)", priceDelta: 0 },
          { id: "amber-hollow", label: "Amber Hollow (250 g)", priceDelta: 0 },
          { id: "quiet-harvest", label: "Quiet Harvest (250 g)", priceDelta: 200 },
        ],
      },
      {
        id: "glaze",
        label: "Mug glaze",
        kind: "chips",
        values: [
          { id: "bone", label: "Bone", priceDelta: 0 },
          { id: "clay", label: "Raw clay", priceDelta: 0 },
          { id: "sage", label: "Sage", priceDelta: 0 },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Martha Quinn",
        initials: "MQ",
        rating: 5,
        when: "2 weeks ago",
        title: "Gave two at Christmas",
        body: "Both recipients have since ordered coffee on their own, which I am counting as the kit working.",
      },
    ],
  },
  {
    slug: "three-month-table",
    name: "Three Month Table",
    tagline: "Three bags, three deliveries",
    category: "gifts",
    price: 6400,
    tone: "plum",
    motif: "sun",
    inStock: true,
    description:
      "Three 250 g bags, sent one at a time, chosen by whoever is on the roaster that month. It is not a subscription — it ends after the third bag and does not renew, does not need cancelling, and does not ask for a card on file. We built it that way after enough people told us the reason they would not gift a coffee subscription is that the recipient inherits the cancelling.",
    notes: ["Three bags", "No auto-renewal", "Roaster's choice"],
    specs: [
      { label: "Contents", value: "3 × 250 g, one per delivery" },
      { label: "Cadence", value: "Monthly or fortnightly" },
      { label: "Renewal", value: "None — ends after the third bag" },
      { label: "First bag", value: "Ships within two working days" },
    ],
    method:
      "Every bag arrives within five days of its roast date, and the roaster writes the reason for that month's pick on the back of the card. If a lot sells out mid-run, we substitute upward, never downward.",
    options: [
      {
        id: "cadence",
        label: "Cadence",
        kind: "chips",
        values: [
          { id: "monthly", label: "Monthly", priceDelta: 0 },
          { id: "fortnightly", label: "Fortnightly", priceDelta: 0 },
        ],
      },
      {
        id: "grind",
        label: "Grind",
        kind: "select",
        values: GRINDS,
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Leo Marchetti",
        initials: "LM",
        rating: 5,
        when: "1 month ago",
        title: "No cancelling — thank you",
        body: "Bought this for my father precisely because he will never have to remember to stop it.",
      },
    ],
  },
];

/** Products shown per page in the catalog grid. */
export const PER_PAGE = 9;

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/**
 * Money is integer cents (pence) everywhere in this app and is only ever
 * turned into a string here. Floats are never used for money — 0.1 + 0.2
 * arithmetic in a cart subtotal is a real, reproducible off-by-a-penny bug,
 * not a theoretical one.
 */
export function formatMoney(pence: number): string {
  return currency.format(pence / 100);
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function averageRating(product: Product): number | null {
  if (product.reviews.length === 0) return null;
  const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / product.reviews.length) * 10) / 10;
}

export type SortId = "featured" | "price-asc" | "price-desc" | "name";

export const SORTS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured first" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name, A to Z" },
];

export interface CatalogQuery {
  categories: CategoryId[];
  /** Empty means "no availability filter applied", not "show nothing". */
  availability: ("in-stock" | "sale")[];
  sort: SortId;
}

export const EMPTY_QUERY: CatalogQuery = {
  categories: [],
  availability: [],
  sort: "featured",
};

/**
 * Filter, then sort. Both are pure and total — an unknown sort id falls back
 * to the catalog's own order rather than throwing, because a stale URL should
 * degrade to "the default listing", not to an error page. This mirrors the
 * philosophy's fifth pillar: gatekeep structure, not content.
 */
export function queryCatalog(query: CatalogQuery): Product[] {
  const filtered = PRODUCTS.filter((product) => {
    if (query.categories.length > 0 && !query.categories.includes(product.category)) {
      return false;
    }
    if (query.availability.includes("in-stock") && !product.inStock) return false;
    if (query.availability.includes("sale") && product.wasPrice === undefined) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (query.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
      break;
  }
  return sorted;
}

export function pageCount(total: number, perPage: number = PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/**
 * Clamps rather than validates. A page number past the end of the results
 * (typical after tightening a filter) returns the last page of real products
 * instead of an empty grid that looks like a bug.
 */
export function paginate<T>(items: T[], page: number, perPage: number = PER_PAGE): T[] {
  const last = pageCount(items.length, perPage);
  const safe = Math.min(Math.max(1, Math.trunc(page)), last);
  const start = (safe - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function relatedProducts(product: Product, limit = 3): Product[] {
  const sameCategory = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category === product.category && p.inStock,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const fill = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category !== product.category && p.inStock,
  );
  return [...sameCategory, ...fill].slice(0, limit);
}

export function featuredProducts(limit = 3): Product[] {
  return PRODUCTS.filter((p) => p.featured && p.inStock).slice(0, limit);
}

export type Selection = Record<string, string>;

/** The default selection for a product: the first value of every option. */
export function defaultSelection(product: Product): Selection {
  const selection: Selection = {};
  for (const option of product.options) {
    selection[option.id] = option.values[0].id;
  }
  return selection;
}

/** Base price plus every selected option's delta, in pence. */
export function priceFor(product: Product, selection: Selection): number {
  return product.options.reduce((total, option) => {
    const chosen = option.values.find((v) => v.id === selection[option.id]);
    return total + (chosen?.priceDelta ?? 0);
  }, product.price);
}

/** "1 kg · Filter / drip" — the human-readable form of a Selection. */
export function describeSelection(product: Product, selection: Selection): string {
  return product.options
    .map((option) => option.values.find((v) => v.id === selection[option.id])?.label)
    .filter((label): label is string => Boolean(label))
    .join(" · ");
}
