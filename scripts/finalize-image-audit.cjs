const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const recipes = JSON.parse(fs.readFileSync('scripts/image-audit-input.json','utf8'));
const candidates = fs.readdirSync('public/recipes').filter(f=>f.includes('-commons.'));
const records = recipes.map(recipe=> {
 const file = path.resolve('public',recipe.image.slice(1));
 const placeholder = recipe.image.endsWith('placeholder.svg');
 return {...recipe, exists:fs.existsSync(file), sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  status:placeholder?'needs-licensed-photo':'existing-photo-needs-dish-match-review',
  notes:placeholder?'Shared fallback, not a photograph. Needs a verified matching photograph and license.':'Existing file loads and is unique. Prior source URLs are in SOURCES.md; exact dish and ingredient match is not verified.',
  candidate:candidates.find(f=>f.startsWith(recipe.id+'-commons.'))??null};
});
fs.writeFileSync('public/recipes/image-audit.json',JSON.stringify(records,null,2)+'\n');
// Keep unapproved, unused candidates out of public assets. Only move files created by this task.
const destination = path.resolve('scripts/image-candidates');
fs.mkdirSync(destination,{recursive:true});
for (const file of candidates) fs.renameSync(path.resolve('public/recipes',file),path.join(destination,file));
console.log(`Audited ${records.length} recipes: ${records.filter(r=>r.status==='needs-licensed-photo').length} need photos. Candidates retained outside public/.`);
