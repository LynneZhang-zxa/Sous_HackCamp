const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'foundation-check.cjs'),'utf8');
const loader = source.slice(0,source.indexOf('const {listRecipes,getRecipe'));
const expected = Number(process.argv[2] || 50);
const checks = `
const {listRecipes,getRecipe} = load('lib/recipe.ts');
const recipes = listRecipes();
const {RECIPE_PHOTOS} = load('lib/recipes/image-sources.ts');
const contentOnly = ({image,imageKind,...content}) => content;
assert.equal(recipes.length, ${expected}, 'Expected catalog count');
assert.equal(new Set(recipes.map(r=>r.id)).size, recipes.length);
assert.equal(new Set(recipes.map(r=>r.title.toLowerCase())).size, recipes.length);
const originals = JSON.parse(fs.readFileSync(path.resolve(__dirname,'original-recipes.json'),'utf8'));
assert.equal(originals.length,20);
assert.equal(JSON.stringify(recipes.slice(0,20).map(contentOnly)),JSON.stringify(originals.map(contentOnly)),'Original records or ordering changed');
for(const original of originals) assert.equal(JSON.stringify(contentOnly(getRecipe(original.id))),JSON.stringify(contentOnly(original)),'Original changed: '+original.id);
for(const r of recipes) {
 assert.equal(getRecipe(r.id),r);
 for(const key of ['id','title','description','cuisine']) assert.ok(typeof r[key]==='string' && r[key].trim());
 assert.ok(Number.isInteger(r.servings) && r.servings>0);
 assert.ok(Number.isInteger(r.prepMinutes) && r.prepMinutes>=0 && Number.isInteger(r.cookMinutes) && r.cookMinutes>=0);
 assert.equal(r.totalMinutes,r.prepMinutes+r.cookMinutes); assert.ok(r.totalMinutes>0);
 assert.ok(r.tags.length && r.ingredients.length>=3 && r.steps.length>=4);
 assert.equal(new Set(r.steps.map(s=>s.id)).size,r.steps.length);
 assert.ok(fs.existsSync(path.resolve(__dirname,'../public',r.image.replace(/^\\//,''))));
 for(const i of r.ingredients) assert.ok(i.name && (i.amount===null || Number.isFinite(i.amount) && i.amount>0) && ['', 'cup', 'tablespoon', 'teaspoon', 'clove', 'pound', 'ounce'].includes(i.unit));
 const linked = new Set(r.steps.flatMap(s=>s.ingredients || []));
 for(const i of r.ingredients) assert.ok(linked.has(i.name),'Ingredient not linked to a step in '+r.id+': '+i.name);
 for(const s of r.steps) {
  assert.ok(s.id && s.title && s.instruction.length>20);
  if(s.durationSeconds!==undefined) assert.ok(Number.isFinite(s.durationSeconds) && s.durationSeconds>0);
  for(const name of s.ingredients || []) assert.ok(r.ingredients.some(i=>i.name===name),'Unknown ingredient: '+name);
 }
 if(!originals.some(o=>o.id===r.id)) {
  assert.ok(r.ingredients.every(i=>Number.isFinite(i.amount) && i.amount>0));
  assert.ok(r.steps.some(s=>s.safety));
  if (r.imageKind === 'placeholder') assert.equal(r.image,'/recipes/placeholder.svg');
  else assert.equal(r.image,RECIPE_PHOTOS[r.id]?.image,'Photo requires verified metadata');
  assert.equal(r.nutrition.status,'unavailable'); assert.equal(r.calories,null);
 }
}
console.log('PASS: '+recipes.length+' unique complete recipes; original 20 unchanged; assets, safety, ingredients, timing and nutrition checked.');
`;
vm.runInNewContext(loader+checks,{require,__dirname,console},{filename:__filename});
