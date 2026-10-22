import { isIP } from "node:net";

/**
 * Is this IP address one the blog generator must never connect to (loopback,
 * private ranges, link-local / cloud metadata, multicast, and IPv6 forms that
 * embed an IPv4 address)? Pure so it can be unit-tested; used by safe-fetch.ts.
 *
 * IPv6 is parsed to bytes rather than matched as text: the URL parser rewrites
 * "[::ffff:127.0.0.1]" to "[::ffff:7f00:1]", and a text match on the dotted form
 * would let that straight through to localhost. Anything unparseable is refused.
 */

export function isPrivateV4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function ipv6Bytes(ip: string): number[] | null {
  let addr = ip.toLowerCase().split("%")[0];
  // A dotted IPv4 tail ("::ffff:1.2.3.4") becomes two hextets.
  const tail = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(addr);
  if (tail) {
    const [a, b, c, d] = tail.slice(1).map(Number);
    if ([a, b, c, d].some((n) => n > 255)) return null;
    addr = `${addr.slice(0, tail.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = addr.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? head.length !== 8 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  if (groups.length !== 8) return null;
  const bytes: number[] = [];
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    const n = parseInt(group, 16);
    bytes.push(n >> 8, n & 255);
  }
  return bytes;
}

export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateV4(ip);
  if (kind !== 6) return true;

  const b = ipv6Bytes(ip);
  if (!b) return true;
  const v4At = (offset: number) => isPrivateV4(`${b[offset]}.${b[offset + 1]}.${b[offset + 2]}.${b[offset + 3]}`);
  const zeros = (from: number, to: number) => b.slice(from, to).every((x) => x === 0);

  if (zeros(0, 10) && b[10] === 0xff && b[11] === 0xff) return v4At(12); // ::ffff:a.b.c.d (IPv4-mapped)
  if (zeros(0, 12)) return true; // ::, ::1 and IPv4-compatible ::a.b.c.d
  if (b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && zeros(4, 12)) return v4At(12); // 64:ff9b::/96 (NAT64)
  if (b[0] === 0x20 && b[1] === 0x02) return v4At(2); // 2002::/16 (6to4)
  if (b[0] === 0x20 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00) return true; // 2001::/32 (Teredo)
  if ((b[0] & 0xfe) === 0xfc) return true; // fc00::/7 unique local
  if (b[0] === 0xfe && (b[1] & 0x80) === 0x80) return true; // fe80::/10 link-local and fec0::/10 site-local
  if (b[0] === 0xff) return true; // ff00::/8 multicast
  return false;
}
