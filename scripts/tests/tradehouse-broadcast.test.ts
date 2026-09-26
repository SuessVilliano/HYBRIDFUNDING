import assert from 'node:assert/strict';
import { buildOBSCollection } from '../../client/src/lib/tradehouse-obs';
import { rehearsalFeed } from '../../client/src/lib/tradehouse-feed';
const demo = rehearsalFeed();
assert.equal(demo.standings.length, 8);
assert.ok(demo.standings.every(t=>!t.verified));
assert.equal(new Set(demo.standings.map(t=>t.id)).size,8);
for (const rehearsal of [true,false]) {
 const collection=buildOBSCollection('https://hybridfunding.co',rehearsal,'alpha & beta','second/trader');
 assert.equal(collection.scene_order.length,3);
 const sources=collection.sources as any[];
 const graphics=sources.filter(s=>s.id==='browser_source');
 assert.equal(graphics.length,3);
 for (const source of graphics) {
  const url=new URL(source.settings.url);
  assert.equal(url.searchParams.get('demo'),rehearsal?'1':null);
  assert.equal(url.searchParams.get('left'),'alpha & beta');
  assert.equal(url.searchParams.get('overlay'),'1');
  assert.equal(source.settings.width,1920);
  assert.equal(source.settings.height,1080);
 }
 for (const scene of sources.filter(s=>s.id==='scene')) assert.ok(graphics.some(g=>g.name===scene.settings.items[0].name));
}
console.log('PASS: rehearsal isolation, unique eight-seat roster, OBS scene references, encoded contestant IDs, 1080p source dimensions');
