// Offline checks for pure application logic; no network, credentials or child processes.
const fs = require("node:fs");
const path = require("node:path");
const {stripTypeScriptTypes} = require("node:module");
const assert = require("node:assert/strict");
const cache = new Map();
function load(file) {
 const full = path.resolve(__dirname,"..",file);
 if (cache.has(full)) return cache.get(full).exports;
 const module = {exports:{}}; cache.set(full,module);
 let code = stripTypeScriptTypes(fs.readFileSync(full,"utf8"));
 const exported = [...code.matchAll(/export (?:const|function|class) (\w+)/g)].map(m=>m[1]);
 code = code.replace(/import \{([^}]+)\} from (["'][^"']+["']);/g, "const {$1} = require($2);").replace(/export (?=const|function|class)/g, "");
 code += "\nObject.assign(exports,{"+exported.join(",")+"});";
 new Function("require","module","exports",code)(name => name.startsWith(".") ? load(path.relative(path.resolve(__dirname,".."),path.resolve(path.dirname(full),name+".ts"))) : require(name),module,module.exports);
 return module.exports;
}
const {listRecipes,getRecipe,formatAmount,spokenAmount} = load("lib/recipe.ts");
const {searchRecipes} = load("lib/recipe-search.ts");
const {parseSaved,toggleSaved} = load("lib/saved-recipes.ts");
const {newSession} = load("lib/session.ts");
const {buildStartCall} = load("lib/agent-config.ts");
const recipes = listRecipes();
assert.equal(recipes.length,50);
assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);
for (const r of recipes) {
 assert.equal(getRecipe(r.id),r);
 assert.ok(r.ingredients.length && r.steps.length && r.description);
 assert.equal(r.totalMinutes,r.prepMinutes+r.cookMinutes);
 assert.ok(fs.existsSync(path.resolve(__dirname,"../public",r.image.slice(1))));
 for(const q of [r.title.toUpperCase(),r.cuisine,r.ingredients[0].name,r.tags[0]]) assert.ok(searchRecipes(recipes,{q:`  ${q}  `}).includes(r));
 assert.ok(searchRecipes(recipes,{cuisine:r.cuisine,tag:r.tags[0],maxMinutes:String(r.totalMinutes)}).includes(r));
 const state = newSession(r.id,"offline","offline");
 const call = buildStartCall("offline",r,state,"https://example.test");
 assert.ok(call.context.includes(r.title)); assert.ok(call.context.length<=4000);
 assert.deepEqual(JSON.parse(call.knowledgeBase),r);
 assert.equal(parseSaved(JSON.stringify(toggleSaved([],r.id)))[0],r.id);
 assert.deepEqual(toggleSaved([r.id],r.id),[]);
}
assert.equal(getRecipe("__proto__"),undefined);
assert.deepEqual(searchRecipes(recipes,{q:"zzzz-no-recipe"}),[]);
for(const sort of ["shortest","longest"]) { const found=searchRecipes(recipes,{sort}); for(let i=1;i<found.length;i++) assert.ok(sort==="shortest" ? found[i].totalMinutes>=found[i-1].totalMinutes : found[i].totalMinutes<=found[i-1].totalMinutes); }
for(const value of [null,"{","null","{}"]) assert.deepEqual(parseSaved(value),[]);
assert.deepEqual(parseSaved(JSON.stringify([recipes[0].id,recipes[0].id,"invalid"])),[recipes[0].id]);
assert.equal(formatAmount(0.1,"cup"),"0.1 cup");
assert.equal(spokenAmount(0.1,"cup"),"0.1 cup");
console.log(`PASS: ${recipes.length} recipe records, assets, search, combined filters, sorting, saved-data persistence and mocked call payloads. No external calls.`);
