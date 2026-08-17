import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(resolve(root, 'static/data/upl.geojson'), 'utf8'));

const MIN_DIST = 0.0018;
const W = 160;
const H = 140;
const PAD = 4;

function simplifyRing(ring) {
	if (ring.length < 4) return ring;
	const out = [ring[0]];
	for (let i = 1; i < ring.length - 1; i++) {
		const [x, y] = ring[i];
		const [px, py] = out[out.length - 1];
		if (Math.hypot(x - px, y - py) >= MIN_DIST) out.push(ring[i]);
	}
	out.push(ring[ring.length - 1]);
	return out.length >= 4 ? out : ring;
}

function polygonsOf(geom) {
	if (geom.type === 'Polygon') return [geom.coordinates];
	if (geom.type === 'MultiPolygon') return geom.coordinates;
	return [];
}

const raw = src.features.map((f) => ({
	name: f.properties.NOMBRE,
	polygons: polygonsOf(f.geometry).map((poly) => poly.map(simplifyRing))
}));

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const f of raw) {
	for (const poly of f.polygons) {
		for (const ring of poly) {
			for (const [x, y] of ring) {
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
			}
		}
	}
}

const sx = (W - 2 * PAD) / (maxX - minX);
const sy = (H - 2 * PAD) / (maxY - minY);
const s = Math.min(sx, sy);
const ox = PAD + (W - 2 * PAD - (maxX - minX) * s) / 2;
const oy = PAD + (H - 2 * PAD - (maxY - minY) * s) / 2;

function pt(x, y) {
	return `${(ox + (x - minX) * s).toFixed(1)},${(H - (oy + (y - minY) * s)).toFixed(1)}`;
}

function pathOf(polygons) {
	return polygons
		.map((poly) =>
			poly
				.map((ring) => {
					const [first, ...rest] = ring;
					return `M${pt(first[0], first[1])}${rest.map(([x, y]) => `L${pt(x, y)}`).join('')}Z`;
				})
				.join('')
		)
		.join('');
}

const out = {
	viewBox: `0 0 ${W} ${H}`,
	features: raw.map((f) => ({ name: f.name, d: pathOf(f.polygons) }))
};

const dest = resolve(root, 'static/data/upls-map.json');
writeFileSync(dest, JSON.stringify(out));
console.log(dest, `${(Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1)} KB`, out.features.length);
