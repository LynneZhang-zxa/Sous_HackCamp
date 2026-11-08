import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { listRecipes } from '../lib/recipe.ts';
const base = process.env.SOUS_TEST_BASE || 'http://127.0.0.1:3187';
const localFetch = url => fetch(url,{signal:AbortSignal.timeout(15000)});
const recipes = listRecipes();
for (const recipe of recipes) {
 const response = await localFetch(`${base}/recipes/${recipe.id}`);
 assert.equal(response.status, 200, recipe.id);
 assert.ok((await response.text()).includes(recipe.title), recipe.id);
}
for (const route of ['/recipes/not-a-real-recipe','/cook?recipeId=not-a-real-recipe']) {
 assert.equal((await localFetch(base+route)).status,404,route);
}
assert.equal((await localFetch(base+'/cook')).status,200);
console.log('PASS HTTP: all 50 detail routes, invalid detail/cook 404s, default cook');
const browser = await chromium.launch({headless:true,channel:'msedge'});
try {
 const context = await browser.newContext({viewport:{width:1280,height:900}});
 await context.route('**/*', route => {
  const u = new URL(route.request().url());
  if (u.origin !== base || u.pathname.startsWith('/api/')) return route.abort();
  return route.continue();
 });
 const page = await context.newPage();
 await page.goto(base);
 const primary = page.getByRole('navigation', {name:'Primary'});
 assert.deepEqual(await primary.locator(':scope > a, :scope > details > summary').allTextContents(), ['Home','My Recipes','Tools']);
 await page.getByRole('link',{name:'Show All',exact:true}).click();
 assert.equal(new URL(page.url()).pathname, '/recipes');
 await page.goto(base);
 const recommendation = page.locator('.recommendation-card');
 const view = recommendation.getByRole('link',{name:'View Recipe',exact:true});
 await view.waitFor();
 const daily = await view.getAttribute('href');
 await page.reload();
 await view.waitFor();
 assert.equal(await view.getAttribute('href'),daily);
 for (let i=0;i<5;i++) {
  const before = await view.getAttribute('href');
  await recommendation.getByRole('button',{name:'Surprise Me',exact:true}).click();
  await page.waitForFunction(previous => document.querySelector('.recommendation-card a').getAttribute('href') !== previous,before);
  const after = await view.getAttribute('href');
  assert.ok(recipes.some(r=>`/recipes/${r.id}`===after));
 }
 const recipe = recipes.at(-1);
 await page.goto(`${base}/recipes/${recipe.id}`);
 await page.getByRole('button',{name:`Save ${recipe.title}`,exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:`Unsave ${recipe.title}`,exact:true}).waitFor();
 const collection = await context.newPage();
 await collection.goto(base+'/collection/my-recipes');
 await collection.getByRole('link',{name:recipe.title,exact:true}).waitFor();
 await collection.getByRole('link',{name:'Cook by Voice',exact:true}).waitFor();
 await page.getByRole('button',{name:`Unsave ${recipe.title}`,exact:true}).click();
 await collection.getByText('No saved recipes yet.',{exact:false}).waitFor();
 await page.goto(base+'/recipes');
 const form = page.locator('#recipe-search');
 await form.locator('[name=q]').fill(recipe.title);
 await form.locator('[name=cuisine]').selectOption(recipe.cuisine);
 await form.locator('[name=tag]').selectOption(recipe.tags[0]);
 await form.locator('[name=maxMinutes]').fill(String(recipe.totalMinutes));
 await form.getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('heading',{name:recipe.title,exact:true}).waitFor();
 assert.equal(await page.locator('ul[aria-label="All recipes"] > li').count(),1);
 await page.locator('#recipe-search [name=q]').fill('no-such-recipe-xyz');
 await page.locator('#recipe-search').getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('heading',{name:'No matching recipes'}).waitFor();
 await page.getByRole('link',{name:'Reset Filters',exact:true}).click();
 await page.getByRole('status').filter({hasText:'50 recipes found'}).waitFor();
 const tools = page.locator('summary').filter({hasText:'Tools'});
 await tools.focus(); await tools.press('Enter');
 assert.equal(await tools.evaluate(el=>el.parentElement.open),true);
 await tools.press('Enter');
 const settings = page.locator('summary[aria-label="Settings"]');
 await settings.focus(); await settings.press('Enter');
 await page.getByText('Settings are coming soon.',{exact:true}).waitFor();
 const denied = await context.newPage();
 await denied.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError');};});
 await denied.goto(`${base}/recipes/${recipe.id}`);
 await denied.getByRole('button',{name:`Save ${recipe.title}`,exact:true}).click();
 await denied.getByRole('status').filter({hasText:'Could not save your change'}).waitFor();
 await denied.close();
 console.log('PASS browser: combined search/filter form, empty/reset states, keyboard Tools/Settings, storage-denied feedback.');
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/','/recipes','/tools','/collection/my-recipes']) {
  await page.goto(base+path);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`mobile overflow: ${path}`);
 }
 console.log('PASS browser: save/reload, Collection links, cross-tab removal, mobile overflow on Home/Recipes/Tools/Collection. All API and external requests blocked; no voice call started.');
} finally {await browser.close();}
