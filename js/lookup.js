// 외부 조회: 사전에 없는 단어를 사용자가 요청할 때만 키 없는 공개 API로 찾아본다.
// Wikipedia REST(영어 설명, 한국어 문서 제목) → 못 찾으면 Datamuse(정확히 일치할 때만).
// 결과는 참고 정보이며 경고 판정에는 쓰지 않는다. 성공·없음 결과는 localStorage 에 저장하고
// 오류(네트워크·요청 제한)는 저장하지 않는다. run() 은 거절되지 않고 항상 결과 객체로 끝난다.
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  var CACHE_KEY = 'promptcheck.lookup.v1';
  var TIMEOUT_MS = 8000;
  var GAP_MS = 300; // 연속 호출 사이의 최소 간격(요청 제한 완화)

  function norm(term) {
    return String(term).toLowerCase().replace(/[’‘]/g, "'").replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // 영어 단어(글자, 하이픈, 아포스트로피, 공백)만 조회한다. 숫자·한 글자·한글 등은 조회하지 않는다.
  function isLookupable(term) {
    var t = String(term).trim();
    return t.length >= 2 && /^[A-Za-z][A-Za-z'’ -]*$/.test(t);
  }

  // 설명 글에서 요소를 추정하는 단순 규칙. 틀릴 수 있어서 화면에 "추정·검증 안 됨"으로만 보여준다.
  var RULES = [
    ['camera_motion', /\b(camera movement|camera move|moving camera|dolly|tracking shot|panning|zoom(ing)?)\b/i],
    ['composition', /\b(composition|camera angle|camera shot|framing|viewpoint|point of view)\b/i],
    ['lighting', /\b(illuminat|lighting|light source|backlight|sunlight|daylight|period of daytime)/i],
    ['camera', /\b(lens|aperture|focus|exposure|photograph|optic|camera)\b/i],
    ['color', /\b(colou?r|hue|pigment|shade of|tone)\b/i],
    ['style', /\b(art movement|artistic|style|genre|painting|aesthetic|subculture|movement)\b/i],
    ['subject', /\b(animal|creature|mythical|legendary|bird|mammal|fixture|garment|clothing|plant|insect|furniture|object)\b/i]
  ];

  function matchRules(text) {
    if (!text) return null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(text)) return RULES[i][0];
    return null;
  }

  // 짧은 설명(description)을 먼저 보고, 분류가 안 되면 본문 첫 문장을 본다.
  function guessElement(description, extract) {
    var first = (extract || '').split('. ')[0];
    return matchRules(description) || matchRules(first);
  }

  function readCache(storage) {
    try {
      var raw = storage && storage.getItem(CACHE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === 'object' ? obj : {};
    } catch (e) { return {}; }
  }
  function writeCache(storage, cache) {
    try { storage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* 저장 실패는 무시 */ }
  }
  function defaultStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }
  function getCached(term, storage) {
    var hit = readCache(storage || defaultStorage())[norm(term)];
    if (!hit) return null;
    var copy = {};
    for (var k in hit) copy[k] = hit[k];
    copy.fromCache = true;
    return copy;
  }

  function defaultDeps() {
    return {
      fetch: function (url, opts) { return window.fetch(url, opts); },
      storage: defaultStorage(),
      sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
      now: function () { return Date.now(); }
    };
  }

  // 오류는 { lookupError: 'rate' | 'timeout' | 'network' | 'http' } 로 던진다.
  function makeGet(deps) {
    var lastAt = 0;
    return async function get(url) {
      var wait = lastAt + GAP_MS - deps.now();
      if (wait > 0) await deps.sleep(wait);
      lastAt = deps.now();
      var ctl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, TIMEOUT_MS) : null;
      var res;
      try {
        res = await deps.fetch(url, ctl ? { signal: ctl.signal } : undefined);
      } catch (e) {
        throw { lookupError: e && e.name === 'AbortError' ? 'timeout' : 'network' };
      } finally {
        if (timer) clearTimeout(timer);
      }
      if (res.status === 429) throw { lookupError: 'rate' };
      if (res.status === 404) return { status: 404, json: null };
      if (!res.ok) throw { lookupError: 'http' };
      var json;
      try { json = await res.json(); } catch (e) { throw { lookupError: 'http' }; }
      return { status: res.status, json: json };
    };
  }

  function words(s) { return norm(s).split(' ').filter(Boolean); }

  // 검색 결과 제목이 찾는 말의 단어를 모두 포함할 때만 받아들인다(엉뚱한 문서 방지).
  function titleCoversTerm(title, term) {
    var tw = words(title), need = words(term);
    return need.every(function (w) { return tw.indexOf(w) !== -1; });
  }

  async function wikipedia(term, get) {
    var enc = encodeURIComponent;
    var base = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
    var r = await get(base + enc(term.trim().replace(/\s+/g, '_')) + '?redirect=true');
    if (r.status === 404) {
      var s = await get('https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&format=json&origin=*&search=' + enc(term));
      var title = s.json && s.json[1] && s.json[1][0];
      if (!title || !titleCoversTerm(title, term)) return null;
      r = await get(base + enc(title.replace(/\s+/g, '_')) + '?redirect=true');
      if (r.status === 404) return null;
    }
    var d = r.json || {};
    var url = d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page;
    if (d.type === 'disambiguation') {
      return { status: 'ambiguous', source: 'wikipedia', title: d.title, url: url || null };
    }
    if (!d.extract && !d.description) return null;
    var ko = null;
    try {
      var l = await get('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=langlinks&lllang=ko&titles=' + enc(d.title));
      var pages = l.json && l.json.query && l.json.query.pages;
      var page = pages && pages[Object.keys(pages)[0]];
      ko = page && page.langlinks && page.langlinks[0] ? page.langlinks[0]['*'] : null;
    } catch (e) { ko = null; } // 한국어 제목은 덤이라 실패해도 결과는 유지한다.
    return {
      status: 'found', source: 'wikipedia', title: d.title, ko: ko,
      description: d.description || '', extract: d.extract || '', url: url || null,
      guess: guessElement(d.description, d.extract)
    };
  }

  async function datamuse(term, get) {
    if (/[ -]/.test(term.trim())) return null; // 한 단어만
    var r = await get('https://api.datamuse.com/words?sp=' + encodeURIComponent(term.trim()) + '&md=d&max=1');
    var hit = Array.isArray(r.json) && r.json[0];
    // 철자가 비슷한 엉뚱한 단어를 돌려주므로 정확히 일치할 때만 쓴다.
    if (!hit || String(hit.word).toLowerCase() !== term.trim().toLowerCase() || !hit.defs || !hit.defs.length) return null;
    var text = String(hit.defs[0]).replace(/^[a-z]+\t/i, '');
    return {
      status: 'found', source: 'datamuse', title: hit.word, ko: null,
      description: text, extract: '', url: null, guess: guessElement(text, '')
    };
  }

  async function run(term, deps) {
    deps = deps || defaultDeps();
    var key = norm(term);
    if (!isLookupable(term)) return { status: 'invalid', term: term };
    var cache = readCache(deps.storage);
    if (cache[key]) {
      var copy = {};
      for (var k in cache[key]) copy[k] = cache[key][k];
      copy.fromCache = true;
      return copy;
    }
    var get = makeGet(deps);
    var result;
    try {
      result = await wikipedia(term, get);
      if (!result) result = await datamuse(term, get);
      if (!result) result = { status: 'notfound' };
    } catch (e) {
      return { status: 'error', kind: (e && e.lookupError) || 'network', term: term };
    }
    result.term = term;
    cache[key] = result;
    writeCache(deps.storage, cache);
    return result;
  }

  PC.lookup = { run: run, getCached: getCached, isLookupable: isLookupable, guessElement: guessElement, norm: norm };
})();
