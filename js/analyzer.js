// 프롬프트 분석 로직(1층 사전 일치 + 미분류). DOM·난수·시간을 쓰지 않는 순수 함수라
// 같은 입력이면 항상 같은 결과가 나온다. js/dictionary.js 를 먼저 불러와야 한다.
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  var CATEGORIES = { image: true, video: true };

  // 분류 대상이 아닌 기능어. 미분류 개수가 부풀지 않게 'ignored'로 처리한다.
  var IGNORED_WORDS = {};
  ('a an the of in on at with and or to for from by as is are be it its this that these those ' +
   'into onto over under near her his their him them she he they').split(' ')
    .forEach(function (w) { IGNORED_WORDS[w] = true; });

  // 단어 구분: 공백과 구두점. 하이픈·아포스트로피는 단어 안에 남긴다.
  var TOKEN_RE = /[^\s,.;:!?()\[\]{}"“”|\\\/<>]+/g;

  // 비교용 정규화: 소문자, 곡선 아포스트로피 통일, 하이픈→공백
  function norm(s) {
    return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/-/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  // 복수형 후보(구절의 마지막 단어에만 적용)
  function pluralStems(w) {
    var out = [];
    if (w.length > 3 && /ies$/.test(w)) out.push(w.slice(0, -3) + 'y');
    if (w.length > 3 && /es$/.test(w)) out.push(w.slice(0, -2));
    if (w.length > 2 && /s$/.test(w) && !/ss$/.test(w)) out.push(w.slice(0, -1));
    return out;
  }

  // 용어 항목 → 유효한 의미 목록. { senses: [...] } 또는 의미 1개짜리 { element, ko, verified } 를 받는다.
  // 요소가 없거나 같은 요소가 중복된 의미는 버린다.
  function normalizeSenses(t, elementMap) {
    var raw = Array.isArray(t.senses) ? t.senses : [t];
    var seen = {}, out = [];
    for (var i = 0; i < raw.length; i++) {
      var s = raw[i];
      if (!s || !elementMap[s.element] || seen[s.element]) continue;
      seen[s.element] = true;
      out.push({ element: s.element, ko: s.ko, verified: !!s.verified });
    }
    return out;
  }

  // 기본 사전 + 사용자 사전 → { key: entry }. 같은 용어는 사용자 사전이 우선한다.
  function buildIndex(userTerms, elementMap) {
    var index = {};
    var maxWords = 1;
    function add(list, source) {
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || typeof t.term !== 'string') continue;
        var key = norm(t.term);
        if (!key) continue;
        var senses = normalizeSenses(t, elementMap);
        if (!senses.length) continue;
        if (source === 'default' && index[key]) continue;
        index[key] = { term: key, senses: senses, source: source };
        var n = key.split(' ').length;
        if (n > maxWords) maxWords = n;
      }
    }
    add(PC.DEFAULT_TERMS || [], 'default');
    add(userTerms || [], 'user');
    return { map: index, maxWords: maxWords };
  }

  // 원문을 단어 단위(units)로 나눈다. 하이픈으로 이어진 단어는 같은 token 에 속한다.
  function toUnits(prompt) {
    var units = [];
    var tokenCount = [];
    var m, tokenIdx = 0;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(prompt)) !== null) {
      var tok = m[0], base = m.index, count = 0, p, partRe = /[^-]+/g;
      while ((p = partRe.exec(tok)) !== null) {
        units.push({
          start: base + p.index, end: base + p.index + p[0].length,
          key: norm(p[0]), token: tokenIdx, linkNext: false
        });
        count++;
      }
      tokenCount[tokenIdx] = count;
      tokenIdx++;
    }
    for (var i = 0; i + 1 < units.length; i++) {
      var a = units[i], b = units[i + 1];
      // 같은 token(하이픈) 이거나, 사이가 공백뿐이면 한 구절로 이을 수 있다.
      a.linkNext = a.token === b.token ||
        /^\s+$/.test(prompt.slice(a.end, b.start));
    }
    return { units: units, tokenCount: tokenCount };
  }

  // i 번째 단어에서 시작하는 가장 긴 사전 일치를 찾는다. 없으면 null.
  function matchAt(units, i, idx) {
    var avail = 1;
    while (avail < idx.maxWords && i + avail - 1 < units.length - 1 &&
           units[i + avail - 1].linkNext) avail++;
    for (var len = avail; len >= 1; len--) {
      var prefix = '';
      for (var k = 0; k < len - 1; k++) prefix += units[i + k].key + ' ';
      var last = units[i + len - 1].key;
      var hit = idx.map[prefix + last];
      if (!hit) {
        var stems = pluralStems(last);
        for (var s = 0; s < stems.length && !hit; s++) hit = idx.map[prefix + stems[s]];
      }
      if (hit) return { len: len, entry: hit };
    }
    return null;
  }

  function analyze(prompt, category, userTerms) {
    if (!CATEGORIES[category]) {
      throw new Error("category must be 'image' or 'video'");
    }
    prompt = typeof prompt === 'string' ? prompt : '';

    var elements = PC.ELEMENTS || [];
    var elementMap = {};
    elements.forEach(function (e) { elementMap[e.id] = e; });

    var idx = buildIndex(userTerms, elementMap);
    var parsed = toUnits(prompt);
    var units = parsed.units;

    var segments = [];
    var cursor = 0;
    function pushSeparator(upTo) {
      if (cursor < upTo) {
        segments.push({ text: prompt.slice(cursor, upTo), start: cursor, end: upTo, status: 'separator' });
      }
    }
    function push(seg, start, end) {
      pushSeparator(start);
      seg.text = prompt.slice(start, end);
      seg.start = start;
      seg.end = end;
      segments.push(seg);
      cursor = end;
    }

    var i = 0;
    while (i < units.length) {
      var hit = matchAt(units, i, idx);
      if (hit) {
        var e = hit.entry;
        var senses = e.senses.map(function (s) {
          var el = elementMap[s.element];
          return {
            element: s.element, elementKo: el.ko, ko: s.ko, verified: s.verified,
            inScope: el.appliesTo.indexOf(category) !== -1
          };
        });
        var anyInScope = senses.some(function (s) { return s.inScope; });
        push({
          status: anyInScope ? 'matched' : 'out_of_scope',
          term: e.term, source: e.source, senses: senses
        }, units[i].start, units[i + hit.len - 1].end);
        i += hit.len;
        continue;
      }
      // 못 찾은 단어: 같은 token(하이픈 연결) 안의 연속된 미분류는 하나로 묶는다.
      var j = i;
      while (j + 1 < units.length && units[j + 1].token === units[i].token &&
             !matchAt(units, j + 1, idx)) j++;
      var single = j === i && parsed.tokenCount[units[i].token] === 1;
      push({ status: single && IGNORED_WORDS[units[i].key] ? 'ignored' : 'unmatched' },
        units[i].start, units[j].end);
      i = j + 1;
    }
    pushSeparator(prompt.length);

    var summary = { matched: 0, unmatched: 0, ignored: 0, outOfScope: 0, byElement: {} };
    elements.forEach(function (e) {
      if (e.appliesTo.indexOf(category) !== -1) summary.byElement[e.id] = 0;
    });
    segments.forEach(function (s) {
      if (s.status === 'matched') {
        summary.matched++;
        // 다의어는 해당하는 의미(요소)마다 한 번씩 센다. 분류된 단어 수는 한 번만 센다.
        s.senses.forEach(function (x) { if (x.inScope) summary.byElement[x.element]++; });
      }
      else if (s.status === 'unmatched') summary.unmatched++;
      else if (s.status === 'ignored') summary.ignored++;
      else if (s.status === 'out_of_scope') summary.outOfScope++;
    });

    return { category: category, segments: segments, summary: summary };
  }

  PC.analyze = analyze;
})();
