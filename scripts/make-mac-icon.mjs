// Writes the Agent Creator app icon as a macOS .icns file, with no tools
// beyond Node: each size is drawn as RGBA pixels, packed as PNG, and stored
// in a PNG-based .icns entry (or one 512 px PNG for a .png path).
// Usage: node scripts/make-mac-icon.mjs <out.icns|out.png>
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// .icns entry types that hold a PNG of the given pixel size.
const ENTRIES = [["icp4", 16], ["icp5", 32], ["icp6", 64], ["ic07", 128], ["ic08", 256], ["ic09", 512], ["ic10", 1024]];
const TOP = [0x4a, 0x86, 0xf0];   // lighter app accent
const BOTTOM = [0x1f, 0x4f, 0xb8]; // darker app accent
const SAMPLES = 4;                 // supersampling per axis, for smooth edges

// Coverage of the shapes at a point in unit space (0..1): background tile and a person.
function shapesAt(x, y) {
  const tile = roundedSquare(x, y, 0.1, 0.9, 0.2);
  const head = Math.hypot(x - 0.5, y - 0.4) < 0.14;
  const shoulders = y < 0.78 && Math.hypot((x - 0.5) / 0.26, (y - 0.8) / 0.22) < 1;
  return { tile, person: tile && (head || shoulders) };
}

function roundedSquare(x, y, lo, hi, r) {
  const dx = Math.max(lo + r - x, 0, x - (hi - r));
  const dy = Math.max(lo + r - y, 0, y - (hi - r));
  return x >= lo && x <= hi && y >= lo && y <= hi && Math.hypot(dx, dy) <= r;
}

function pixel(px, py, size) {
  let tile = 0, person = 0;
  for (let i = 0; i < SAMPLES; i++) {
    for (let j = 0; j < SAMPLES; j++) {
      const s = shapesAt((px + (i + 0.5) / SAMPLES) / size, (py + (j + 0.5) / SAMPLES) / size);
      tile += s.tile; person += s.person;
    }
  }
  const n = SAMPLES * SAMPLES, t = py / size;
  const bg = TOP.map((c, k) => c + (BOTTOM[k] - c) * t);
  const mix = person / Math.max(tile, 1);
  return [...bg.map((c) => Math.round(c + (255 - c) * mix)), Math.round((255 * tile) / n)];
}

function drawRgba(size) {
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); // leading 0 = PNG "no filter"
    for (let x = 0; x < size; x++) Buffer.from(pixel(x, y, size)).copy(row, 1 + x * 4);
    rows.push(row);
  }
  return Buffer.concat(rows);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function png(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(drawRgba(size))), pngChunk("IEND", Buffer.alloc(0))]);
}

function icnsBlock(type, data) {
  const head = Buffer.alloc(8);
  head.write(type, 0, "ascii");
  head.writeUInt32BE(data.length + 8, 4);
  return Buffer.concat([head, data]);
}

function icns() {
  const body = Buffer.concat(ENTRIES.map(([type, size]) => icnsBlock(type, png(size))));
  return icnsBlock("icns", body);
}

export function writeIcon(out) {
  writeFileSync(out, out.endsWith(".png") ? png(512) : icns());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2];
  if (!out) throw new Error("make-mac-icon: missing output path (usage: node scripts/make-mac-icon.mjs <out.icns|out.png>)");
  writeIcon(out);
}
