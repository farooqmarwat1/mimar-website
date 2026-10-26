// Loads a TypeScript source file under Node's test runner, with the "@/" alias,
// relative imports and JSON resolved to the real files. Anything listed in
// `mocks` (by the exact import string) is replaced, so a test can fake the
// database, the AI provider or the cache and exercise everything else as is.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');

const defaults = {
  'server-only': {},
  react: { cache: fn => fn },
  'next/cache': { unstable_cache: fn => fn, revalidatePath() {}, revalidateTag() {}, updateTag() {} },
  'next/server': { after() {} },
};

function load(file, mocks = {}) {
  const all = { ...defaults, ...mocks };
  const registry = new Map();

  function resolve(from, id) {
    let base;
    if (id.startsWith('@/')) base = path.join(root, 'src', id.slice(2));
    else if (id.startsWith('./') || id.startsWith('../')) base = path.resolve(path.dirname(from), id);
    else return null;
    for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), base]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
  }

  function evaluate(absolute) {
    if (registry.has(absolute)) return registry.get(absolute).exports;
    const mod = { exports: {} };
    registry.set(absolute, mod);
    const text = fs.readFileSync(absolute, 'utf8');
    if (absolute.endsWith('.json')) {
      mod.exports = JSON.parse(text);
      return mod.exports;
    }
    const source = ts.transpileModule(text, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const context = {
      exports: mod.exports,
      module: mod,
      require: id => {
        if (id in all) return all[id];
        const target = resolve(absolute, id);
        return target ? evaluate(target) : require(id);
      },
      Date, Error, SyntaxError, TypeError, URL, URLSearchParams, Request, Response, Buffer, process, Map, Set, JSON, Promise,
      console: { error() {}, log() {}, warn() {} },
    };
    vm.runInNewContext(source, context, { filename: absolute });
    return mod.exports;
  }

  return evaluate(path.join(root, file));
}

module.exports = { load, root };
