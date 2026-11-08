import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const baseURL = process.env.SOUS_TEST_URL || 'http://localhost:3000';
const outputDir = process.env.SOUS_TEST_OUTPUT || '/private/tmp/sous-discovery-checks';
mkdirSync(outputDir, { recursive: true });
import { chromium } from 'playwright';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL);
 await page.evaluate(()=>window.__pageMarker='same-document');
 for(const cuisine of ['Chinese','Italian','Japanese','Korean','Indian','Mexican']){
  await page.getByRole('button',{name:cuisine,exact:true}).click();
  assert.equal(await page.evaluate(()=>window.__pageMarker),'same-document');
  assert.equal(await page.getByRole('button',{name:cuisine,exact:true}).getAttribute('aria-pressed'),'true');
  const row=page.locator('.recipe-preview-row');assert.ok(await row.locator('.recipe-card').count()>0);
  const ys=await row.locator('.recipe-card').evaluateAll(cards=>cards.map(c=>Math.round(c.getBoundingClientRect().top)));assert.equal(new Set(ys).size,1);
  assert.equal(await page.getByRole('link',{name:'Show All'}).getAttribute('href'),'/recipes?cuisine='+cuisine);
 }
 await page.getByRole('button',{name:'Chinese',exact:true}).click();await page.getByRole('link',{name:'Show All'}).click();await page.waitForURL('**/recipes?cuisine=Chinese');
 assert.equal(await page.getByRole('button',{name:'Chinese',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Italian',exact:true}).click();assert.ok(page.url().includes('cuisine=Italian'));
 await page.getByRole('button',{name:'Japanese',exact:true}).click();await page.goBack();
 await page.waitForFunction(()=>document.querySelector('.cuisine-chips button[aria-pressed="true"]')?.textContent==='Italian');
 await page.goForward();await page.waitForFunction(()=>document.querySelector('.cuisine-chips button[aria-pressed="true"]')?.textContent==='Japanese');
 await page.getByRole('button',{name:'Reset Filters',exact:true}).click();
 await page.getByRole('textbox',{name:'Search recipes',exact:true}).fill('garlic');
 assert.ok(await page.locator('.discovery-grid .recipe-card').count()>0);
 await page.getByLabel('Sort by').selectOption('shortest');
 const times=await page.locator('.recipe-card-meta').evaluateAll(nodes=>nodes.filter(n=>/^\d+ min/.test(n.textContent)).map(n=>parseInt(n.textContent)));assert.deepEqual(times,[...times].sort((a,b)=>a-b));
 await page.getByRole('textbox',{name:'Search recipes',exact:true}).fill('zz-no-results');await page.getByRole('heading',{name:'No matching recipes'}).waitFor();
 await page.getByRole('button',{name:'Reset Filters',exact:true}).first().click();assert.equal(await page.locator('.discovery-grid .recipe-card').count(),50);
 await page.screenshot({path:outputDir+'/discovery-desktop.png',fullPage:true});
 await page.screenshot({path:outputDir+'/discovery-viewport.png'});
 await page.getByRole('link',{name:/^Cook .+ by voice$/}).first().click();await page.waitForURL('**/cook?recipeId=*');assert.ok(page.url().includes('recipeId='));
 for(const width of [1440,768,390])for(const route of ['/','/recipes','/recipes?cuisine=Chinese','/recipes/miso-soup']){
  await page.setViewportSize({width,height:900});await page.goto(baseURL+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' @'+width);
  if(width===390&&route==='/recipes'){await page.screenshot({path:outputDir+'/discovery-mobile.png',fullPage:true});await page.screenshot({path:outputDir+'/discovery-mobile-viewport.png'});}
  if(width===1440&&route==='/')await page.screenshot({path:outputDir+'/homepage-desktop.png'});
 }
 await page.goto(baseURL+'/recipes?cuisine=unknown-cuisine');
 await page.getByRole('heading',{name:'No matching recipes'}).waitFor();
 assert.equal(await page.getByRole('link',{name:'My Recipes',exact:true}).getAttribute('href'),'/collection/my-recipes');
 const detailLinks = await page.request.get(baseURL+'/recipes');
 assert.equal(detailLinks.status(),200);
 const html=await detailLinks.text();
 const paths=[...new Set([...html.matchAll(/href="(\/recipes\/[^"?#]+)"/g)].map(m=>m[1]))];
 assert.equal(paths.length,50);
 for(let i=0;i<paths.length;i+=5)await Promise.all(paths.slice(i,i+5).map(async path=>{const response=await page.request.get(baseURL+path);assert.equal(response.status(),200,path);
  const detail=await response.text();
  const photo=detail.match(/<img[^>]*src="(\/recipes\/[^"]+)"/);
  assert.ok(photo,path+' image missing');const imageResponse=await page.request.get(baseURL+photo[1]);assert.equal(imageResponse.status(),200,photo[1]);}));
 assert.deepEqual(errors,[]);console.log('PASS: homepage chips, single row, Show All, URL/history, search, sort, empty/reset, voice selection, responsive layouts.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
