const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** ULID: 48-bit timestamp + 80 bits of randomness, Crockford base32 encoded, lexically sortable. */
export function ulid(time: number = Date.now()): string {
  let t = time
  let timePart = ''
  for (let i = 0; i < 10; i++) {
    timePart = CROCKFORD[t % 32] + timePart
    t = Math.floor(t / 32)
  }
  let randPart = ''
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  for (let i = 0; i < 16; i++) {
    randPart += CROCKFORD[bytes[i] % 32]
  }
  return timePart + randPart
}

export function nanoid(size = 21): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  let id = ''
  for (let i = 0; i < size; i++) id += alphabet[bytes[i] % alphabet.length]
  return id
}

const FIRST_NAMES = ['Aarav', 'Priya', 'Liam', 'Emma', 'Noah', 'Olivia', 'Mateo', 'Sofia', 'Kenji', 'Yuki', 'Chen', 'Mei', 'Omar', 'Fatima', 'Lucas', 'Ana']
const LAST_NAMES = ['Sharma', 'Patel', 'Smith', 'Johnson', 'Garcia', 'Müller', 'Tanaka', 'Wang', 'Kim', 'Rossi', 'Silva', 'Kowalski', 'Novak', 'Andersen']
const DOMAINS = ['example.com', 'mail.test', 'corp.internal', 'devmail.io']
const STREETS = ['Maple St', 'Oak Ave', 'Sunset Blvd', 'Park Lane', 'River Rd', 'Elm St', '5th Ave', 'Church St']
const CITIES = ['Springfield', 'Riverton', 'Fairview', 'Georgetown', 'Clinton', 'Madison', 'Franklin', 'Greenville']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export type FakePerson = { name: string; email: string; address: string }

export function fakePerson(): FakePerson {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 100)}@${pick(DOMAINS)}`
  const address = `${Math.floor(Math.random() * 9000) + 100} ${pick(STREETS)}, ${pick(CITIES)}`
  return { name: `${first} ${last}`, email, address }
}
