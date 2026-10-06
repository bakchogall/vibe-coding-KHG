// 사용자 사전: localStorage 에 저장하는 사용자 용어의 검증·저장 로직. 화면과 분리된 순수 함수들이다.
// 저장 형태: [{ term, senses: [{ element, ko, verified }] }]  (키: promptcheck.userTerms.v1)
// 설명을 모르는 의미는 verified:false + ko:'검증 필요' 로 저장한다(지어내지 않는다).
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  var KEY = 'promptcheck.userTerms.v1';
  var MAX_TERMS = 500;
  var MAX_KO = 100;
  var MAX_SENSES = 6;
  var MAX_TERM_LEN = 40;
  var MAX_TERM_WORDS = 6;
  var UNVERIFIED = '검증 필요';

  // 저장용 용어 표기: 소문자, 곡선 아포스트로피 통일, 공백 정리(하이픈은 입력 그대로)
  function normalizeTerm(s) {
    return String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }
  // 분석기와 같은 비교 키: 하이픈은 공백과 같다(close-up == close up)
  function keyOf(term) {
    return normalizeTerm(term).replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // entry: { term, senses:[{ element, ko, verified }] } (입력 그대로)
  // ctx: { userTerms: 저장된 목록, originalTerm: 수정 중이면 원래 용어(없으면 새로 추가), elementIds: 허용 요소 id }
  // 반환: { errors: [...], entry: 정리된 항목 }
  function validate(entry, ctx) {
    var errors = [];
    var term = normalizeTerm(entry && entry.term);
    var elementIds = ctx.elementIds || [];
    var userTerms = ctx.userTerms || [];

    if (!term) errors.push('용어를 입력하세요.');
    else {
      if (term.length > MAX_TERM_LEN) errors.push('용어는 ' + MAX_TERM_LEN + '자 이하로 입력하세요.');
      if (!/^[a-z0-9][a-z0-9' -]*$/.test(term)) errors.push('용어는 영어 글자, 숫자, 하이픈(-), 아포스트로피(\')만 쓸 수 있습니다.');
      if (term.split(' ').length > MAX_TERM_WORDS) errors.push('용어는 ' + MAX_TERM_WORDS + '단어 이하로 입력하세요.');
    }

    var senses = [], seen = {};
    var rawSenses = (entry && entry.senses) || [];
    if (!rawSenses.length) errors.push('의미를 하나 이상 입력하세요.');
    if (rawSenses.length > MAX_SENSES) errors.push('의미는 ' + MAX_SENSES + '개까지 추가할 수 있습니다.');
    rawSenses.forEach(function (s, i) {
      var n = i + 1;
      if (!s || elementIds.indexOf(s.element) === -1) { errors.push(n + '번째 의미: 요소를 선택하세요.'); return; }
      if (seen[s.element]) { errors.push(n + '번째 의미: 같은 요소가 이미 있습니다. 한 용어에 같은 요소의 의미는 하나만 둘 수 있습니다.'); return; }
      seen[s.element] = true;
      var verified = s.verified !== false; // 기본은 설명을 직접 쓴 것
      var ko = String(s.ko || '').trim();
      if (!verified) ko = UNVERIFIED;
      else if (!ko) { errors.push(n + '번째 의미: 설명을 입력하거나 "검증 필요 표시"를 체크하세요.'); return; }
      else if (ko.length > MAX_KO) { errors.push(n + '번째 의미: 설명은 ' + MAX_KO + '자 이하로 입력하세요.'); return; }
      senses.push({ element: s.element, ko: ko, verified: verified });
    });

    // 같은 용어(하이픈·공백 무시)가 이미 내 사전에 있는지. 수정 중인 항목 자신은 제외한다.
    var key = keyOf(term), origKey = ctx.originalTerm ? keyOf(ctx.originalTerm) : null;
    if (term) {
      var dup = userTerms.some(function (t) { var k = keyOf(t.term); return k === key && k !== origKey; });
      if (dup) errors.push("'" + term + "'은(는) 이미 내 사전에 있습니다. 목록에서 수정하세요.");
      if (!origKey && userTerms.length >= MAX_TERMS) errors.push('내 사전은 ' + MAX_TERMS + '개까지 저장할 수 있습니다.');
    }
    return { errors: errors, entry: { term: term, senses: senses } };
  }

  // 새로 추가하거나(originalTerm 없음) 같은 자리를 바꾼다. 새 배열을 돌려준다.
  function upsert(list, entry, originalTerm) {
    var out = list.slice();
    if (originalTerm) {
      var k = keyOf(originalTerm);
      for (var i = 0; i < out.length; i++) {
        if (keyOf(out[i].term) === k) { out[i] = entry; return out; }
      }
    }
    out.push(entry);
    return out;
  }

  function remove(list, term) {
    var k = keyOf(term);
    return list.filter(function (t) { return keyOf(t.term) !== k; });
  }

  // 저장된 한 항목이 쓸 만한 모양인지(요소 id 검사는 분석기가 따로 거른다)
  function sanitize(raw, elementIds) {
    if (!raw || typeof raw.term !== 'string' || !Array.isArray(raw.senses)) return null;
    var r = validate(raw, { userTerms: [], elementIds: elementIds });
    return r.errors.length ? null : r.entry;
  }

  function defaultStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  // 읽기: { terms, skipped, corrupt }. 깨진 데이터는 무시하고 빈 목록으로 시작한다.
  function load(storage, elementIds) {
    storage = storage === undefined ? defaultStorage() : storage;
    var raw = null;
    try { raw = storage && storage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) return { terms: [], skipped: 0, corrupt: false };
    var arr;
    try { arr = JSON.parse(raw); } catch (e) { return { terms: [], skipped: 0, corrupt: true }; }
    if (!Array.isArray(arr)) return { terms: [], skipped: 0, corrupt: true };
    var terms = [], skipped = 0, seen = {};
    arr.forEach(function (item) {
      var clean = sanitize(item, elementIds);
      var k = clean ? keyOf(clean.term) : null;
      if (!clean || seen[k] || terms.length >= MAX_TERMS) { skipped++; return; }
      seen[k] = true;
      terms.push(clean);
    });
    return { terms: terms, skipped: skipped, corrupt: skipped > 0 };
  }

  // 쓰기: 성공하면 true
  function save(storage, list) {
    storage = storage === undefined ? defaultStorage() : storage;
    try { storage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  // 분석기에 넘길 모양(저장 형태와 같다). 복사본을 돌려준다.
  function toAnalyzerTerms(list) {
    return list.map(function (t) {
      return { term: t.term, senses: t.senses.map(function (s) { return { element: s.element, ko: s.ko, verified: s.verified }; }) };
    });
  }

  PC.userDict = {
    KEY: KEY, MAX_TERMS: MAX_TERMS, MAX_KO: MAX_KO, MAX_SENSES: MAX_SENSES, UNVERIFIED: UNVERIFIED,
    normalizeTerm: normalizeTerm, keyOf: keyOf, validate: validate, upsert: upsert, remove: remove,
    load: load, save: save, toAnalyzerTerms: toAnalyzerTerms
  };
})();
