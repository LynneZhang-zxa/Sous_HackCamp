// Exercise actual pages and call-start without workers, network, or credentials.
const fs = require('node:fs');
const path = require('node:path');
const babel = require('next/dist/compiled/babel/core');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const cache = new Map();
let sessionIds = [];
let tokenRequests = 0;
function load(file) {
  const full = path.resolve(root, file);
  if (cache.has(full)) return cache.get(full).exports;
  const module = { exports: {} }; cache.set(full, module);
  const code = babel.transformSync(fs.readFileSync(full, 'utf8'), {
    filename: full, babelrc: false, configFile: false,
    presets: [[require.resolve('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]],
  }).code;
  function localRequire(name) {
    if (name === 'react' && full.endsWith(path.join('components', 'voice', 'useVoiceCall.ts'))) return {
      useCallback: fn => fn, useEffect: () => {}, useRef: value => ({ current: value }), useState: value => [value, () => {}],
    };
    if (name === 'react' && full.endsWith(path.join('components', 'SavedRecipes.tsx'))) return {
      ...React, useEffect: () => {},
      useState: value => [Array.isArray(value) ? load('lib/recipe.ts').listRecipes().map(r => r.id) : value === false ? true : value, () => {}],
    };
    if (name.startsWith('@babel/runtime/')) return require('next/dist/compiled/' + name);
    if (name === 'next/navigation') return { notFound() { throw new Error('404'); } };
    if (name === '@/components/cook/CookScreen') return { CookScreen: () => null };
    if (name === '@/lib/store') return { createSession: async id => {
      sessionIds.push(id); return load('lib/session.ts').newSession(id, 'offline', 'offline');
    } };
    if (name === '@/lib/alebex') return {
      requireEnv: () => 'offline-agent', WS_URL: 'wss://example.test',
      resolvePublicBase: async () => ({ base: 'https://example.test', source: 'offline' }),
      mintWsToken: async () => { tokenRequests++; return 'offline-token'; },
    };
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const base = name.startsWith('@/') ? path.resolve(root, name.slice(2)) : path.resolve(path.dirname(full), name);
    const target = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync);
    if (!target) throw new Error('Unresolved local module: ' + name);
    return load(target);
  }
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}
async function main() {
  const { listRecipes, CREAMY_GARLIC_CHICKEN } = load('lib/recipe.ts');
  const { searchRecipes } = load('lib/recipe-search.ts');
  const { parseSaved, toggleSaved } = load('lib/saved-recipes.ts');
  const detail = load('app/recipes/[id]/page.tsx');
  const cook = load('app/cook/page.tsx').default;
  const listing = load('app/recipes/page.tsx').default;
  const { POST } = load('app/api/call/start/route.ts');
  const { useVoiceCall } = load('components/voice/useVoiceCall.ts');
  const recipes = listRecipes(); assert.equal(recipes.length, 50);
  assert.deepEqual(detail.generateStaticParams(), recipes.map(({ id }) => ({ id })));
  const html = renderToStaticMarkup(await listing({ searchParams: Promise.resolve({}) }));
  let saved = [];
  for (const recipe of recipes) {
    assert.ok(html.includes(`href="/recipes/${recipe.id}"`));
    const page = renderToStaticMarkup(await detail.default({ params: Promise.resolve({ id: recipe.id }) }));
    assert.ok(page.includes(`href="/cook?recipeId=${recipe.id}"`));
    assert.equal((await cook({ searchParams: Promise.resolve({ recipeId: recipe.id }) })).props.selectedRecipe.id, recipe.id);
    assert.ok(searchRecipes(recipes, { q: recipe.title.toUpperCase(), cuisine: recipe.cuisine, tag: recipe.tags[0], maxMinutes: String(recipe.totalMinutes) }).includes(recipe));
    saved = toggleSaved(saved, recipe.id);
    const response = await POST(new Request('https://example.test/api/call/start', { method: 'POST', body: JSON.stringify({ recipeId: recipe.id }) }));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.recipe.id, recipe.id); assert.equal(body.state.recipeId, recipe.id);
    assert.ok(body.startCall.context.includes(recipe.title));
    assert.deepEqual(JSON.parse(body.startCall.knowledgeBase), recipe);
    // Stop the real hook immediately after its mocked request, before audio/socket setup.
    const originalFetch = global.fetch;
    const requests = [];
    try {
      global.fetch = async (...args) => {
        requests.push(args);
        return { ok: false, json: async () => ({ error: 'Offline stop before microphone/socket' }) };
      };
      await useVoiceCall().start(recipe.id);
      assert.equal(requests.length, 1);
      assert.equal(requests[0][0], '/api/call/start');
      assert.deepEqual(JSON.parse(requests[0][1].body), { recipeId: recipe.id });
    } finally { global.fetch = originalFetch; }
  }
  assert.deepEqual(parseSaved(JSON.stringify(saved)), recipes.map(r => r.id));
  const collection = renderToStaticMarkup(React.createElement(load('components/SavedRecipes.tsx').SavedRecipes));
  for (const recipe of recipes) {
    assert.ok(collection.includes(`href="/recipes/${recipe.id}"`));
    assert.ok(collection.includes(`href="/cook?recipeId=${recipe.id}"`));
  }
  for (const recipe of recipes) assert.deepEqual(toggleSaved(saved, recipe.id), saved.filter(id => id !== recipe.id));
  assert.deepEqual(sessionIds, recipes.map(r => r.id)); assert.equal(tokenRequests, 50);
  assert.equal((await cook({ searchParams: Promise.resolve({}) })).props.selectedRecipe.id, CREAMY_GARLIC_CHICKEN.id);
  for (const id of ['', 'missing', '__proto__', 'toString']) {
    await assert.rejects(detail.default({ params: Promise.resolve({ id }) }), /404/);
    await assert.rejects(cook({ searchParams: Promise.resolve({ recipeId: id }) }), /404/);
    assert.equal((await POST(new Request('https://example.test/api/call/start', { method: 'POST', body: JSON.stringify({ recipeId: id }) }))).status, 404);
  }
  const sessionsBeforeInvalid = sessionIds.length;
  for (const body of ['{', 'null', '[]', '{"recipeId":null}', '{"recipeId":3}', '{"recipeId":["creamy-garlic-chicken"]}']) {
    assert.equal((await POST(new Request('https://example.test/api/call/start', { method: 'POST', body }))).status, 400);
  }
  assert.equal(sessionIds.length, sessionsBeforeInvalid);
  assert.equal(tokenRequests, 50);
  console.log('PASS: all 50 listing/detail/cook selections, combined search, full favorites collection, mocked call-start IDs, default cook and invalid-ID 404 handling. No provider calls.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
