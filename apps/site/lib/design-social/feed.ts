/**
 * Thrum's data layer.
 *
 * Imports no React, no Next, and no component — the dsgn philosophy's first
 * pillar ("separation of concerns is physical, not just logical") as a real
 * boundary rather than a naming convention. The test it has to pass: this
 * module compiles and every selector below is unit-testable with no UI
 * toolchain present at all.
 *
 * Everything here is invented. Thrum is not a real product; the people,
 * rooms, pulses, and counts are written for this demo.
 */

/** A room is Thrum's community unit — a named channel a pulse can be posted into. */
export interface Room {
  /** URL-safe id, also the display handle after the `~` sigil. */
  slug: string;
  name: string;
  blurb: string;
  members: number;
  /** Pulses posted in the last 24h. Drives the Explore ordering. */
  velocity: number;
  joined: boolean;
}

export interface Person {
  handle: string;
  name: string;
  bio: string;
  /** Room slug this person is best known in — shown in the hover preview. */
  homeRoom: string;
  followers: number;
  following: number;
  /** True for accounts Thrum has confirmed make what they say they make. */
  verified: boolean;
  followsYou: boolean;
}

/** A poll attached to a pulse. Options are immutable; `votes` is the tally. */
export interface Poll {
  question: string;
  options: { label: string; votes: number }[];
  closesInMinutes: number;
}

export interface Reply {
  id: string;
  author: string;
  minutesAgo: number;
  body: string;
  sparks: number;
}

export interface Pulse {
  id: string;
  author: string;
  room: string;
  minutesAgo: number;
  body: string;
  sparks: number;
  echoes: number;
  /** Whether the signed-in reader has already sparked this. */
  sparked: boolean;
  poll?: Poll;
  replies: Reply[];
  /** Which feed tabs this pulse belongs to. */
  streams: FeedStream[];
}

export type FeedStream = "for-you" | "following" | "rooms";

export type NotificationKind = "spark" | "reply" | "echo" | "follow" | "mention";

export interface Notification {
  id: string;
  kind: NotificationKind;
  actor: string;
  minutesAgo: number;
  /** Preformatted sentence fragment following the actor's name. */
  text: string;
  /** Quoted context, when the notification points at a specific pulse. */
  excerpt?: string;
  unread: boolean;
}

/** The signed-in reader. Kept separate from PEOPLE so "you" is never a lookup miss. */
export const VIEWER = {
  handle: "rune",
  name: "Rune Adeyemi",
  bio: "Building a modular synth out of a 1970s answering machine. Mostly at 2am.",
  homeRoom: "night-shift",
  followers: 4820,
  following: 311,
  verified: false,
  followsYou: false,
} as const satisfies Person;

const PEOPLE: Person[] = [
  {
    handle: "mox",
    name: "Moxie Tran",
    bio: "Typeface repair. I fix the kerning nobody asked me to fix.",
    homeRoom: "typeface-crimes",
    followers: 21400,
    following: 182,
    verified: true,
    followsYou: true,
  },
  {
    handle: "keris",
    name: "Keris Odum",
    bio: "Foraging within twenty minutes of a tram stop. Field notes, no foraging advice.",
    homeRoom: "urban-foraging",
    followers: 8930,
    following: 640,
    verified: false,
    followsYou: true,
  },
  {
    handle: "solder_witch",
    name: "Ines Bakker",
    bio: "Eurorack, badly. Ask me about the smoke.",
    homeRoom: "synth-diy",
    followers: 15200,
    following: 97,
    verified: true,
    followsYou: false,
  },
  {
    handle: "halfstop",
    name: "Dmitri Vance",
    bio: "Shooting expired film on purpose. Developing it in coffee, also on purpose.",
    homeRoom: "analog-photo",
    followers: 6410,
    following: 224,
    verified: false,
    followsYou: true,
  },
  {
    handle: "quietloop",
    name: "Ayo Fenwick",
    bio: "Ambient sets for empty rooms. Ninety minutes minimum or it doesn't count.",
    homeRoom: "night-shift",
    followers: 33900,
    following: 58,
    verified: true,
    followsYou: false,
  },
  {
    handle: "pressure",
    name: "Salla Virtanen",
    bio: "Cold brew, over-engineered. Currently arguing with a refractometer.",
    homeRoom: "cold-brew-lab",
    followers: 2980,
    following: 405,
    verified: false,
    followsYou: false,
  },
  {
    handle: "grommet",
    name: "Beatriz Alencar",
    bio: "Sewing machine mechanic. Every problem is tension.",
    homeRoom: "night-shift",
    followers: 11700,
    following: 133,
    verified: false,
    followsYou: true,
  },
];

const ROOMS: Room[] = [
  {
    slug: "night-shift",
    name: "Night Shift",
    blurb: "For anyone whose best hour is 2am. Post what you made instead of sleeping.",
    members: 48200,
    velocity: 1340,
    joined: true,
  },
  {
    slug: "synth-diy",
    name: "Synth DIY",
    blurb: "Breadboards, bad decisions, and the occasional working oscillator.",
    members: 26800,
    velocity: 910,
    joined: true,
  },
  {
    slug: "typeface-crimes",
    name: "Typeface Crimes",
    blurb: "Kerning offences spotted in the wild. Be specific, be kind to the designer.",
    members: 19400,
    velocity: 780,
    joined: true,
  },
  {
    slug: "urban-foraging",
    name: "Urban Foraging",
    blurb: "What's edible within a tram ride. Identification help, never identification advice.",
    members: 14100,
    velocity: 402,
    joined: false,
  },
  {
    slug: "analog-photo",
    name: "Analog Photo",
    blurb: "Film stocks, home darkrooms, and arguments about scanning.",
    members: 31500,
    velocity: 655,
    joined: false,
  },
  {
    slug: "cold-brew-lab",
    name: "Cold Brew Lab",
    blurb: "Extraction numbers, grind curves, and one very long thread about ice.",
    members: 9200,
    velocity: 218,
    joined: false,
  },
];

const PULSES: Pulse[] = [
  {
    id: "p1",
    author: "solder_witch",
    room: "synth-diy",
    minutesAgo: 6,
    body: "Got the answering-machine tape loop running as a delay line. Twelve seconds of feedback before it collapses into something that sounds like a room remembering itself. Schematic in the replies, it's four parts and a prayer.",
    sparks: 1842,
    echoes: 214,
    sparked: false,
    streams: ["for-you", "following", "rooms"],
    replies: [
      {
        id: "p1r1",
        author: "quietloop",
        minutesAgo: 4,
        body: "twelve seconds is a whole ambient track if you're patient enough. please record the collapse.",
        sparks: 96,
      },
      {
        id: "p1r2",
        author: "rune",
        minutesAgo: 2,
        body: "This is exactly the machine I have on my bench. Which head did you tap for the wet signal?",
        sparks: 41,
      },
      {
        id: "p1r3",
        author: "grommet",
        minutesAgo: 1,
        body: "the tension on those old capstan belts is the whole game. replace it before it eats the tape.",
        sparks: 28,
      },
    ],
  },
  {
    id: "p2",
    author: "mox",
    room: "typeface-crimes",
    minutesAgo: 34,
    body: "Found a bakery sign where the R and the U are set so tight they've fused into a single glyph. I have looked at it for nine minutes. I now believe the word is 'BREAD' and also that it is 'BRFAD'. Both readings are correct.",
    sparks: 6120,
    echoes: 1180,
    sparked: true,
    streams: ["for-you", "following"],
    replies: [
      {
        id: "p2r1",
        author: "halfstop",
        minutesAgo: 28,
        body: "shot this exact sign on expired Portra last spring. the grain did not help.",
        sparks: 310,
      },
      {
        id: "p2r2",
        author: "pressure",
        minutesAgo: 21,
        body: "BRFAD is a better product name and I would buy it.",
        sparks: 902,
      },
    ],
  },
  {
    id: "p3",
    author: "quietloop",
    room: "night-shift",
    minutesAgo: 92,
    body: "Ninety-minute set finished at 4:10am. Nobody was listening live, which is the point. Uploading it anyway because a set with no audience still has to exist somewhere.",
    sparks: 3410,
    echoes: 486,
    sparked: false,
    streams: ["for-you", "following", "rooms"],
    replies: [
      {
        id: "p3r1",
        author: "keris",
        minutesAgo: 74,
        body: "listened at 6am on a bus. counts.",
        sparks: 188,
      },
    ],
  },
  {
    id: "p4",
    author: "pressure",
    room: "cold-brew-lab",
    minutesAgo: 148,
    body: "Settle this for me. Same beans, same 18h steep, one batch brewed with ice in the vessel and one chilled after. I can taste a difference. My refractometer says I cannot.",
    sparks: 741,
    echoes: 62,
    sparked: false,
    streams: ["for-you", "rooms"],
    poll: {
      question: "Ice in the vessel, or chill after?",
      options: [
        { label: "Ice in the vessel", votes: 1284 },
        { label: "Chill after", votes: 2016 },
        { label: "The refractometer is right, you're wrong", votes: 3390 },
      ],
      closesInMinutes: 610,
    },
    replies: [
      {
        id: "p4r1",
        author: "mox",
        minutesAgo: 130,
        body: "the refractometer is measuring dissolved solids, not your feelings about dissolved solids.",
        sparks: 1204,
      },
      {
        id: "p4r2",
        author: "solder_witch",
        minutesAgo: 96,
        body: "run it blind with someone else pouring. that's the only version of this where the answer means anything.",
        sparks: 445,
      },
    ],
  },
  {
    id: "p5",
    author: "keris",
    room: "urban-foraging",
    minutesAgo: 320,
    body: "Elderflower is three weeks early on the east side of the river and exactly on time on the west. Same species, same latitude, four hundred metres apart. The only variable I can find is a car park.",
    sparks: 2280,
    echoes: 390,
    sparked: false,
    streams: ["for-you", "rooms"],
    replies: [
      {
        id: "p5r1",
        author: "grommet",
        minutesAgo: 290,
        body: "asphalt holds heat overnight. your car park is a tiny climate.",
        sparks: 671,
      },
    ],
  },
  {
    id: "p6",
    author: "halfstop",
    room: "analog-photo",
    minutesAgo: 640,
    body: "Developed a roll in day-old cold brew. Contrast is filthy, blacks are brown, grain looks like gravel. Worst results I've had all year and I've already loaded another roll.",
    sparks: 4890,
    echoes: 812,
    sparked: true,
    streams: ["for-you", "following", "rooms"],
    replies: [
      {
        id: "p6r1",
        author: "pressure",
        minutesAgo: 600,
        body: "day-old is the wrong variable. try it at 12h and 36h and tell me the blacks don't move.",
        sparks: 233,
      },
      {
        id: "p6r2",
        author: "mox",
        minutesAgo: 540,
        body: "'blacks are brown' is going straight into my notes as a colour name.",
        sparks: 512,
      },
    ],
  },
  {
    id: "p7",
    author: "grommet",
    room: "night-shift",
    minutesAgo: 890,
    body: "Third machine tonight. All three came in as 'skipping stitches'. All three were tension. It is always tension. I have never once opened one of these up and found it was anything other than tension.",
    sparks: 1560,
    echoes: 178,
    sparked: false,
    streams: ["for-you", "following", "rooms"],
    replies: [],
  },
  /*
   * The viewer's own two pulses. They carry only the "rooms" stream, never
   * "for-you" or "following" — your own posts showing up in your own
   * recommendation feed is a bug in every real product that has shipped it,
   * and a profile whose Pulses tab is an empty state is a worse first
   * impression than one with two real posts on it.
   */
  {
    id: "p8",
    author: "rune",
    room: "night-shift",
    minutesAgo: 210,
    body: "The answering machine has four heads and I have spent two weeks assuming the manual was right about which one is the playback. It was not. Two weeks. The manual is a 1978 photocopy of a 1976 manual for a different unit.",
    sparks: 2140,
    echoes: 305,
    sparked: false,
    streams: ["rooms"],
    replies: [
      {
        id: "p8r1",
        author: "solder_witch",
        minutesAgo: 190,
        body: "every service manual from that decade is a photocopy of a different machine. trace it yourself, always.",
        sparks: 418,
      },
      {
        id: "p8r2",
        author: "grommet",
        minutesAgo: 150,
        body: "two weeks is fast for that failure. I lost a month to a wiring diagram that had two pins swapped.",
        sparks: 96,
      },
    ],
  },
  {
    id: "p9",
    author: "rune",
    room: "synth-diy",
    minutesAgo: 1180,
    body: "Bench rule I keep relearning: if it works at 3am, do not touch it until you have written down why it works. I have now rebuilt the same filter stage four times because past me was confident and undocumented.",
    sparks: 890,
    echoes: 141,
    sparked: false,
    streams: ["rooms"],
    replies: [],
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "reply",
    actor: "solder_witch",
    minutesAgo: 3,
    text: "replied to your pulse",
    excerpt: "Second head, the one nobody uses. That's the whole trick.",
    unread: true,
  },
  {
    id: "n2",
    kind: "spark",
    actor: "mox",
    minutesAgo: 11,
    text: "sparked your reply in ~synth-diy",
    unread: true,
  },
  {
    id: "n3",
    kind: "follow",
    actor: "quietloop",
    minutesAgo: 46,
    text: "started following you",
    unread: true,
  },
  {
    id: "n4",
    kind: "echo",
    actor: "grommet",
    minutesAgo: 128,
    text: "echoed your pulse to 11.7K followers",
    excerpt: "The belt is always the belt. Replace it before it eats the tape.",
    unread: false,
  },
  {
    id: "n5",
    kind: "spark",
    actor: "halfstop",
    minutesAgo: 300,
    text: "and 84 others sparked your pulse",
    unread: false,
  },
  {
    id: "n6",
    kind: "reply",
    actor: "keris",
    minutesAgo: 460,
    text: "replied in ~night-shift",
    excerpt: "Counts. Everything made at 4am counts.",
    unread: false,
  },
  {
    id: "n7",
    kind: "follow",
    actor: "pressure",
    minutesAgo: 1400,
    text: "started following you",
    unread: false,
  },
  {
    id: "n8",
    kind: "echo",
    actor: "solder_witch",
    minutesAgo: 2100,
    text: "echoed your pulse to 15.2K followers",
    unread: false,
  },
];

/* ------------------------------------------------------------------ *
 * Selectors. Every one is pure: same input, same output, no mutation
 * of the module-level arrays above. The UI layer never reaches past
 * these into the raw arrays, which is what keeps swapping this file
 * for a real API a change to this file alone.
 * ------------------------------------------------------------------ */

const PEOPLE_BY_HANDLE = new Map<string, Person>(
  [VIEWER, ...PEOPLE].map((p) => [p.handle, p]),
);

/**
 * Looks up a person by handle.
 *
 * Returns a synthesised placeholder rather than `undefined` for an unknown
 * handle. That is the "trust the data" pillar applied to a render path: a
 * pulse authored by someone this client hasn't hydrated yet should still
 * render as a pulse, not vanish from the feed or crash the list. Structure
 * is enforced (a Person always comes back); content is not gatekept.
 *
 * Time: O(1). Space: O(1).
 */
export function personByHandle(handle: string): Person {
  const found = PEOPLE_BY_HANDLE.get(handle);
  if (found) return found;
  return {
    handle,
    name: handle,
    bio: "",
    homeRoom: "",
    followers: 0,
    following: 0,
    verified: false,
    followsYou: false,
  };
}

const ROOMS_BY_SLUG = new Map<string, Room>(ROOMS.map((r) => [r.slug, r]));

/** Looks up a room by slug, or `undefined` if the slug isn't known. Time: O(1). */
export function roomBySlug(slug: string): Room | undefined {
  return ROOMS_BY_SLUG.get(slug);
}

/** Every room, newest-activity first. Time: O(n log n). */
export function allRooms(): Room[] {
  return [...ROOMS].sort((a, b) => b.velocity - a.velocity);
}

/** Rooms the viewer has joined, in the sidebar's display order. Time: O(n). */
export function joinedRooms(): Room[] {
  return ROOMS.filter((r) => r.joined);
}

/**
 * The pulses belonging to one feed stream, newest first.
 *
 * Time: O(n log n) in the number of pulses. Space: O(n).
 */
export function pulsesForStream(stream: FeedStream): Pulse[] {
  return PULSES.filter((p) => p.streams.includes(stream)).sort(
    (a, b) => a.minutesAgo - b.minutesAgo,
  );
}

/** Pulses authored by one handle, newest first. Time: O(n log n). */
export function pulsesByAuthor(handle: string): Pulse[] {
  return PULSES.filter((p) => p.author === handle).sort(
    (a, b) => a.minutesAgo - b.minutesAgo,
  );
}

/**
 * Replies written by one handle, flattened out of every pulse's thread and
 * paired with the pulse they answered — what a profile's "Replies" tab needs.
 *
 * Time: O(n * r). Space: O(r).
 */
export function repliesByAuthor(handle: string): { reply: Reply; parent: Pulse }[] {
  return PULSES.flatMap((parent) =>
    parent.replies.filter((r) => r.author === handle).map((reply) => ({ reply, parent })),
  ).sort((a, b) => a.reply.minutesAgo - b.reply.minutesAgo);
}

/** Pulses the viewer has sparked — the profile's "Sparks" tab. Time: O(n log n). */
export function sparkedPulses(): Pulse[] {
  return PULSES.filter((p) => p.sparked).sort((a, b) => a.minutesAgo - b.minutesAgo);
}

/** A single pulse by id, or `undefined`. Time: O(n). */
export function pulseById(id: string): Pulse | undefined {
  return PULSES.find((p) => p.id === id);
}

/** Every notification, newest first. Time: O(n log n). */
export function allNotifications(): Notification[] {
  return [...NOTIFICATIONS].sort((a, b) => a.minutesAgo - b.minutesAgo);
}

/** Notifications of one kind, newest first. Time: O(n log n). */
export function notificationsOfKind(kinds: NotificationKind[]): Notification[] {
  return allNotifications().filter((n) => kinds.includes(n.kind));
}

/** Count of unread notifications, for the nav badge. Time: O(n). */
export function unreadCount(): number {
  return NOTIFICATIONS.reduce((sum, n) => sum + (n.unread ? 1 : 0), 0);
}

/** One rolled-up line in the weekly digest. */
export interface DigestEntry {
  /** Two-character marker — the digest summarises kinds, not people. */
  tag: string;
  text: string;
  /** Human span the roll-up covers. */
  span: string;
  /** True while the roll-up still contains something unread. */
  fresh: boolean;
}

/**
 * The weekly digest — notifications rolled up by kind rather than listed.
 *
 * Lives here rather than in the view because it answers a question about the
 * data ("how much of each kind happened"), not about how it is displayed.
 * Kinds with nothing in them are dropped rather than rendering a "0 sparks"
 * line, which is the same trust-the-data instinct as not gatekeeping content:
 * show what is there, don't invent a row to fill a grid.
 *
 * Time: O(n). Space: O(1) — at most three entries.
 */
export function weeklyDigest(): DigestEntry[] {
  const groups: { tag: string; kinds: NotificationKind[]; noun: [string, string] }[] = [
    { tag: "SP", kinds: ["spark", "echo"], noun: ["spark or echo", "sparks and echoes"] },
    { tag: "RE", kinds: ["reply", "mention"], noun: ["reply", "replies and mentions"] },
    { tag: "FO", kinds: ["follow"], noun: ["new follower", "new followers"] },
  ];

  return groups
    .map((g) => ({ ...g, items: NOTIFICATIONS.filter((n) => g.kinds.includes(n.kind)) }))
    .filter((g) => g.items.length > 0)
    .map(({ tag, items, noun }) => {
      const newest = items.reduce((a, b) => (a.minutesAgo < b.minutesAgo ? a : b));
      return {
        tag,
        text: `${items.length} ${items.length === 1 ? noun[0] : noun[1]}`,
        span: `latest ${Math.max(1, Math.round(newest.minutesAgo / 60))}h ago`,
        fresh: items.some((n) => n.unread),
      };
    });
}

/** Accounts the viewer doesn't follow yet, densest-signal first. Time: O(n log n). */
export function suggestedPeople(limit = 3): Person[] {
  return [...PEOPLE]
    .filter((p) => !p.followsYou)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit);
}

/** Total votes in a poll — the denominator every option's bar divides by. Time: O(n). */
export function pollTotal(poll: Poll): number {
  return poll.options.reduce((sum, o) => sum + o.votes, 0);
}

/**
 * Rooms whose name, slug, or blurb contains `query`, case-insensitively.
 *
 * An empty or whitespace-only query returns everything rather than nothing —
 * a search box that blanks the page the moment you clear it reads as broken.
 *
 * Time: O(n * m). Space: O(n).
 */
export function searchRooms(query: string): Room[] {
  const q = query.trim().toLowerCase();
  if (!q) return allRooms();
  return allRooms().filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.slug.includes(q) ||
      r.blurb.toLowerCase().includes(q),
  );
}

/** Headline numbers for the feed hero. Derived, never hardcoded. Time: O(n). */
export function networkStats(): { pulsesToday: number; roomsLive: number; makers: number } {
  return {
    pulsesToday: ROOMS.reduce((sum, r) => sum + r.velocity, 0),
    roomsLive: ROOMS.length,
    makers: ROOMS.reduce((sum, r) => sum + r.members, 0),
  };
}
