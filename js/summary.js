// "한눈에 보기" 요약: 분석·경고 결과를 문장 두 줄과 참고 줄로 조립하는 순수 함수.
// DOM·난수·시간을 쓰지 않으므로 같은 입력이면 항상 같은 문장이 나온다. 점수나 좋고 나쁨의 판단은 하지 않는다.
// js/dictionary.js, js/analyzer.js, js/checks.js 를 먼저 불러와야 한다.
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  // 한 구간이 여러 요소의 의미를 가질 때 문장에 넣을 요소(구체적인 요소가 먼저, 주제가 마지막).
  var PRIORITY = ['lighting', 'camera_motion', 'transition', 'style', 'camera', 'composition', 'color', 'quality',
    'subject_motion', 'setting', 'subject'];
  var EXPRESS = ['style', 'lighting', 'color', 'camera', 'composition', 'quality', 'camera_motion', 'transition'];
  var EXPRESS_LABEL = {
    style: '스타일', lighting: '조명', color: '색감', camera: '촬영 설정', composition: '구도', quality: '화질',
    camera_motion: '카메라 움직임', transition: '편집 효과'
  };
  var GLOSS_ELEMENTS = { subject: 1, setting: 1, subject_motion: 1 }; // 한국어 풀이를 붙이는 요소
  var MAX_PER_ELEMENT = 3;

  // 내용이 없는 머리말·일반어: 문장에서 군더더기라 뺀다.
  var GENERIC = {};
  ('camera shot lens lighting light lights style render background color colors tone tones palette motion movement ' +
   'view angle frame scene photo picture image').split(' ').forEach(function (w) { GENERIC[w] = true; });

  function norm(s) {
    return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // 받침이 있는 한글로 끝나는지(은/는, 이/가, 을/를, 으로/로 고를 때). 한글이 아니면 받침 없음으로 본다.
  function hasBatchim(word) {
    var ch = String(word).replace(/\s+$/, '').slice(-1);
    var code = ch.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 !== 0;
  }
  function josa(word, withBatchim, without) { return hasBatchim(word) ? withBatchim : without; }

  // "사막. 건조하고 광활한 모래땅" → "사막". 짧은 명사형 풀이만 쓰고 아니면 붙이지 않는다.
  function gloss(ko) {
    if (!ko || ko === '검증 필요') return '';
    var g = String(ko).split(/[.,(]/)[0].trim();
    return g.length > 0 && g.length <= 12 && g.split(' ').length <= 3 ? g : '';
  }

  function containsWords(longer, shorter) {
    var a = longer.split(' '), b = shorter.split(' ');
    if (b.length >= a.length) return false;
    for (var i = 0; i + b.length <= a.length; i++) {
      var ok = true;
      for (var j = 0; j < b.length; j++) if (a[i + j] !== b[j]) { ok = false; break; }
      if (ok) return true;
    }
    return false;
  }

  function fmt(item) {
    return '‘' + item.text + '’' + (item.gloss ? '(' + item.gloss + ')' : '') + (item.estimated ? '(추정)' : '');
  }
  function list(items) { return items.map(fmt).join(', '); }

  function elementKoMap() {
    var m = {};
    (PC.ELEMENTS || []).forEach(function (e) { m[e.id] = e.ko; });
    return m;
  }

  // 군더더기를 거르고 요소별로 모은다. 반환: { groups, negations }
  function collect(analysis) {
    var items = [], negations = [], seen = {};
    analysis.segments.forEach(function (seg, order) {
      if (seg.status !== 'matched') return;
      var active = seg.senses.filter(function (s) { return s.inScope && s.element !== 'intensity'; });
      if (!active.length) return;
      var key = norm(seg.text);
      if (GENERIC[key] || seen[key]) return; // 내용 없는 일반어, 같은 표현의 반복
      seen[key] = true;
      var elements = active.map(function (s) { return s.element; });
      var element = PRIORITY.filter(function (e) { return elements.indexOf(e) !== -1; })[0] || elements[0];
      var item = {
        key: key, text: seg.text, element: element, order: order, words: key.split(' ').length,
        estimated: seg.source === 'pattern', gloss: ''
      };
      if (GLOSS_ELEMENTS[element]) {
        var sense = active.filter(function (s) { return s.element === element; })[0];
        item.gloss = gloss(sense && sense.ko);
      }
      if (/^no /.test(key)) negations.push(item); else items.push(item);
    });

    // 더 긴 표현 안에 통째로 들어 있는 짧은 표현은 뺀다(close up ⊂ extreme close up).
    items = items.filter(function (a) {
      return !items.some(function (b) { return b !== a && containsWords(b.key, a.key); });
    });

    var groups = {};
    items.forEach(function (it) { (groups[it.element] = groups[it.element] || []).push(it); });
    Object.keys(groups).forEach(function (e) {
      var g = groups[e];
      if (g.length > MAX_PER_ELEMENT) {
        // 구체적인 표현(단어가 많은 것)부터 남기고, 화면에는 원래 순서로 보여 준다.
        g = g.slice().sort(function (a, b) { return b.words - a.words || a.order - b.order; }).slice(0, MAX_PER_ELEMENT);
        g.sort(function (a, b) { return a.order - b.order; });
      }
      groups[e] = g;
    });
    return { groups: groups, negations: negations.slice(0, MAX_PER_ELEMENT + 1) };
  }

  // 첫째 줄: 무엇이 그려지는가(주제·배경·대상의 움직임)
  function line1(groups, unmatchedWords) {
    var S = groups.subject, B = groups.setting, M = groups.subject_motion;
    var s;
    if (S && B) s = list(S) + ' 같은 주제가 ' + list(B) + ' 같은 배경에 놓인 장면을 그립니다';
    else if (S) s = list(S) + ' 같은 주제를 담은 장면을 그립니다';
    else if (B) s = list(B) + ' 같은 배경이 중심인 장면을 그립니다';
    else if (unmatchedWords.length) {
      s = '사전에서 찾지 못한 ' + unmatchedWords.map(function (w) { return '‘' + w + '’'; }).join(', ') +
        ' 등이 주제나 배경일 수 있습니다';
    } else s = '사전에서 주제나 배경으로 읽을 수 있는 단어를 찾지 못했습니다';
    if (M && (S || B)) s += '. 대상은 ' + list(M) + ' 같은 움직임을 보입니다';
    else if (M) s += '. ' + list(M) + ' 같은 움직임이 지시되어 있습니다';
    return '이 프롬프트는 ' + s.replace(/^이 프롬프트는 /, '') + '.';
  }

  // 둘째 줄: 어떻게 표현하라고 했는가(스타일·조명·색감·촬영·구도·화질, 영상은 움직임·편집)
  function line2(groups, negations) {
    var parts = [], last = '';
    EXPRESS.forEach(function (e) {
      if (!groups[e]) return;
      parts.push(list(groups[e]) + ' 같은 ' + EXPRESS_LABEL[e]);
      last = EXPRESS_LABEL[e];
    });
    var s = '';
    if (parts.length) s = parts.join(', ') + josa(last, '으로 ', '로 ') + '표현하도록 지시합니다.';
    if (negations.length) {
      var neg = '‘' + negations.map(function (n) { return n.text; }).join('’, ‘') + '’ 등은 피하도록 지시합니다.';
      s = s ? s + ' 또한 ' + neg : neg;
    }
    return s || '스타일·조명·색감 같은 표현 지시는 사전에서 찾지 못했습니다.';
  }

  // 참고 줄: 사실만 나열한다(판단하지 않음).
  function metaLines(analysis, checkResult) {
    var ko = elementKoMap(), lines = [];
    var ws = checkResult.warnings;
    var conflicts = ws.filter(function (w) { return w.kind === 'conflict'; });
    if (conflicts.length) {
      var shown = conflicts.slice(0, 2).map(function (w) {
        return '‘' + w.terms[0] + '’ ↔ ‘' + w.terms[1] + '’' + (w.uncertain ? '(확실하지 않음)' : '');
      }).join(', ');
      lines.push('서로 충돌할 수 있는 지시가 ' + conflicts.length + '건 있습니다: ' + shown + (conflicts.length > 2 ? ' 외 ' + (conflicts.length - 2) + '건' : '') + '.');
    }
    var wanted = ws.filter(function (w) { return w.kind === 'missing_wanted'; }).map(function (w) { return ko[w.element]; });
    if (wanted.length) lines.push('체크한 요소 중 발견되지 않은 것: ' + wanted.join(', ') + '.');
    var missing = ws.filter(function (w) { return w.kind === 'missing_recommended'; }).map(function (w) { return ko[w.element]; });
    if (missing.length) lines.push('지시가 없는 요소: ' + missing.join(', ') + '(생성 AI가 임의로 정합니다).');
    var vague = ws.filter(function (w) { return w.kind === 'vague' || w.kind === 'uncertain'; }).length;
    if (vague) lines.push('모호하거나 불확실한 표현이 ' + vague + '곳 있습니다.');
    var neg = ws.filter(function (w) { return w.kind === 'negation'; }).reduce(function (n, w) { return n + (w.count || 1); }, 0);
    if (neg) lines.push('부정 지시가 ' + neg + '곳 있습니다(모델에 따라 반대로 반영될 수 있음).');
    if (!lines.length) lines.push('눈에 띄는 충돌이나 모호한 표현은 발견되지 않았습니다.');
    return lines;
  }

  // analysis: PC.analyze 결과, checkResult: PC.check 결과
  // 반환: { sentences: [첫째 줄, 둘째 줄], meta: [참고 줄...], coverage: { read, total } }
  function summarize(analysis, checkResult) {
    var collected = collect(analysis);
    var excluded = {};
    checkResult.warnings.forEach(function (w) {
      if (w.kind !== 'vague' && w.kind !== 'uncertain' && w.kind !== 'negation') return;
      (w.terms || [w.term]).forEach(function (t) { if (t) excluded[norm(t)] = true; });
    });
    var unmatched = [], seen = {};
    analysis.segments.forEach(function (seg) {
      if (seg.status !== 'unmatched') return;
      var k = norm(seg.text);
      if (/^\d+$/.test(k) || excluded[k] || seen[k] || /[^\x00-\x7F]/.test(seg.text)) return;
      seen[k] = true;
      unmatched.push(seg.text);
    });
    return {
      sentences: [line1(collected.groups, unmatched.slice(0, 3)), line2(collected.groups, collected.negations)],
      meta: metaLines(analysis, checkResult),
      coverage: { read: analysis.summary.matched, total: analysis.summary.matched + analysis.summary.unmatched }
    };
  }

  PC.summary = { summarize: summarize, josa: josa, gloss: gloss };
})();
