// 경고 엔진: analyze() 결과를 받아 경고 목록을 돌려주는 순수 함수.
// DOM·난수·시간을 쓰지 않으므로 같은 입력이면 항상 같은 결과가 나온다.
// js/dictionary.js 와 js/analyzer.js 를 먼저 불러와야 한다.
//
// 경고 종류와 심각도
//   warning(높음): missing_subject, missing_wanted
//   notice(낮음):  missing_recommended, category_mismatch, conflict, vague, uncertain, negation
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  // 사전에 없는 표현은 "빠졌다"고 오탐할 수 있으므로 해당 메시지에 이 문구를 붙인다.
  var DICT_NOTE = '사전에 없는 표현일 수 있으니 직접 확인하세요.';

  // 지정하지 않으면 안내하는 권장 요소(카테고리에 해당하는 것만 점검)
  var RECOMMENDED = ['style', 'lighting', 'composition', 'color', 'camera_motion', 'subject_motion'];

  // 충돌 가능성이 있는 용어 쌍. 사전 용어(소문자, 하이픈은 공백)끼리 비교한다.
  var CONFLICTS = [
    { a: ['warm tone'], b: ['cool tone'],
      reason: '따뜻한 색조와 차가운 색조는 서로 반대 방향의 색감입니다.' },
    { a: ['black and white'], b: ['vibrant', 'pastel'],
      reason: '흑백과 선명한 색·파스텔 색은 함께 쓰기 어렵습니다.' },
    { a: ['vibrant'], b: ['muted'],
      reason: '선명한 색과 채도 낮은 색은 서로 반대입니다.' },
    { a: ['close up'], b: ['wide shot', 'wide angle'],
      reason: '클로즈업과 넓게 담는 구도는 서로 반대입니다.' },
    { a: ['zoom in'], b: ['zoom out'],
      reason: '확대와 축소는 서로 반대 동작입니다.' },
    { a: ['static shot', 'static camera', 'fixed camera', 'locked camera', 'locked-off camera', 'stationary camera',
          'tripod shot', 'camera is static', 'camera is fixed', 'camera remains static', 'camera remains completely static',
          'camera remains still', 'camera remains fixed', 'camera stays static', 'camera stays completely static',
          'camera stays still', 'camera does not move', "camera doesn't move"],
      b: ['pan', 'tilt', 'dolly in', 'tracking shot', 'handheld', 'orbit'],
      reason: '고정된 화면과 카메라 움직임은 함께 쓰기 어렵습니다.' },
    // 부정형 카메라 움직임("no ...") ↔ 그 움직임을 요구하는 용어
    { a: ['no camera movement', 'no camera motion'],
      b: ['pan', 'tilt', 'dolly in', 'tracking shot', 'handheld', 'orbit', 'zoom in', 'zoom out'],
      reason: '카메라 움직임이 없어야 한다는 지시와 카메라가 움직이는 촬영 방식을 함께 쓰고 있습니다.' },
    { a: ['no camera shake'], b: ['handheld'],
      reason: '흔들림이 없어야 한다는 지시와 손으로 든 듯 흔들리는 촬영 방식(핸드헬드)은 함께 쓰기 어렵습니다.' },
    { a: ['no zoom', 'no camera zoom'], b: ['zoom in', 'zoom out'],
      reason: '확대·축소를 하지 말라는 지시와 확대·축소 동작이 함께 있습니다.' },
    { a: ['no pan', 'no panning', 'no camera pan'], b: ['pan'],
      reason: '카메라를 좌우로 돌리지 말라는 지시와 좌우로 도는 동작이 함께 있습니다.' },
    { a: ['no tilt'], b: ['tilt'],
      reason: '카메라를 위아래로 꺾지 말라는 지시와 위아래로 꺾는 동작이 함께 있습니다.' },
    // 부정형 피사체 움직임("no ...") ↔ 피사체 동작 용어. 표현이 가리키는 대상이 다를 수 있어
    // 카메라 쪽보다 확실하지 않으므로 uncertain 으로 표시한다. no movement/no motion 은 카메라일 수도 있어 여기서만 다룬다.
    { a: ['no character movement', 'no subject movement', 'no object movement', 'no movement', 'no motion'],
      b: ['walking', 'running', 'dancing', 'flying', 'jumping', 'spinning', 'floating'],
      uncertain: true,
      reason: '대상이 움직이지 않아야 한다는 지시와 대상이 움직이는 동작을 함께 쓰고 있습니다.' },
    { a: ['indoor'], b: ['outdoor'],
      reason: '실내와 야외는 서로 반대 장소입니다.' },
    { a: ['centered'], b: ['rule of thirds'],
      reason: '중앙 배치와 삼분할 구도는 서로 다른 배치 방식입니다.' },
    { a: ['low angle'], b: ["bird's eye view"],
      reason: '올려다보는 시점과 내려다보는 시점은 서로 반대입니다.' },
    { a: ['photorealistic'], b: ['anime', 'watercolor', 'oil painting', 'pixel art'],
      reason: '사실적 표현과 일러스트·회화풍 스타일은 서로 다른 방향입니다.' },
    { a: ['minimalist'], b: ['highly detailed', 'detailed'],
      reason: '요소를 줄이는 스타일과 세부 묘사를 늘리는 지시는 서로 반대입니다.' }
  ];

  // 평가어: 구체적인 시각 지시가 없다.
  var VAGUE_WORDS = ['beautiful', 'pretty', 'nice', 'good', 'great', 'amazing', 'awesome',
    'stunning', 'gorgeous', 'epic', 'perfect', 'best', 'cool', 'unique', 'interesting'];
  // 불확실한 표현(구절 포함)
  var UNCERTAIN_PHRASES = ['maybe', 'perhaps', 'something', 'stuff', 'etc', 'kind of', 'sort of'];
  // 부정 표현
  var NEGATION_WORDS = ['no', 'not', 'without', "don't"];

  var TOKEN_RE = /[^\s,.;:!?()\[\]{}"“”|\\\/<>]+/g;

  function norm(s) {
    return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/-/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function makeSet(list) {
    var o = {};
    list.forEach(function (w) { o[norm(w)] = true; });
    return o;
  }

  var VAGUE_SET = makeSet(VAGUE_WORDS);
  var NEG_SET = makeSet(NEGATION_WORDS);
  var UNCERTAIN_SINGLE = makeSet(UNCERTAIN_PHRASES.filter(function (p) { return p.indexOf(' ') === -1; }));

  // 심각도·종류 정렬 순서(고정)
  var LEVEL_RANK = { warning: 0, notice: 1 };
  var KIND_RANK = {
    missing_subject: 0, missing_wanted: 1, missing_recommended: 2, category_mismatch: 3,
    conflict: 4, vague: 5, uncertain: 6, negation: 7
  };

  function check(analysis, options) {
    var out = { warnings: [], summary: { warning: 0, notice: 0 } };
    if (!analysis || !Array.isArray(analysis.segments)) return out;

    var segs = analysis.segments;
    var category = analysis.category;
    var elements = PC.ELEMENTS || [];
    var elementKo = {}, applicable = {};
    elements.forEach(function (e) {
      elementKo[e.id] = e.ko;
      if (e.appliesTo.indexOf(category) !== -1) applicable[e.id] = true;
    });

    var found = [];
    function add(kind, level, fields) {
      var w = { kind: kind, level: level, verified: true };
      for (var k in fields) w[k] = fields[k];
      w._order = found.length;
      found.push(w);
    }

    function present(el) {
      return segs.some(function (s) {
        return s.status === 'matched' &&
          s.senses.some(function (x) { return x.element === el && x.inScope; });
      });
    }
    // 주제 판정: 주제로 분류된 구간이 있거나, 분류되지 않은 내용어(주제/배경 후보)가 있으면 "있음"
    function hasSubjectCandidate() {
      return segs.some(function (s) {
        if (s.status !== 'unmatched') return false;
        var n = norm(s.text);
        return !/^\d+$/.test(n) && !VAGUE_SET[n] && !NEG_SET[n] && !UNCERTAIN_SINGLE[n];
      });
    }
    var subjectPresent = present('subject') || hasSubjectCandidate();

    // W1. 빠진 요소
    if (!subjectPresent) {
      add('missing_subject', 'warning', {
        element: 'subject',
        message: '무엇을 그릴지(주제)를 가리키는 단어를 찾지 못했습니다. ' + DICT_NOTE
      });
    }

    var wantedList = [];
    ((options && options.wanted) || []).forEach(function (id) {
      if (applicable[id] && wantedList.indexOf(id) === -1) wantedList.push(id);
    });
    wantedList.forEach(function (id) {
      if (id === 'subject') return; // 주제는 위에서 처리
      if (!present(id)) {
        add('missing_wanted', 'warning', {
          element: id,
          message: "의도한 '" + elementKo[id] + "'에 해당하는 표현을 찾지 못했습니다. " + DICT_NOTE
        });
      }
    });
    RECOMMENDED.forEach(function (id) {
      if (!applicable[id] || wantedList.indexOf(id) !== -1 || present(id)) return;
      add('missing_recommended', 'notice', {
        element: id,
        message: "'" + elementKo[id] + "' 지시가 없습니다. 지정하지 않으면 생성 AI가 임의로 정합니다. " + DICT_NOTE
      });
    });

    // W2. 카테고리 불일치
    segs.forEach(function (s) {
      if (s.status !== 'out_of_scope') return;
      var kos = s.senses.map(function (x) { return x.elementKo; }).join('/');
      add('category_mismatch', 'notice', {
        term: s.text, start: s.start, end: s.end,
        message: "'" + s.text + "'은(는) 영상 전용 요소(" + kos + ")라서 이미지용 분석에서는 다루지 않습니다. 영상용이 맞는지 확인하세요."
      });
    });

    // W3. 충돌하는 지시
    function findTerm(list) {
      var set = makeSet(list);
      for (var i = 0; i < segs.length; i++) {
        if (segs[i].status === 'matched' && set[segs[i].term]) return segs[i];
      }
      return null;
    }
    CONFLICTS.forEach(function (c) {
      var sa = findTerm(c.a), sb = findTerm(c.b);
      if (!sa || !sb) return;
      var fields = {
        terms: [sa.text, sb.text],
        start: Math.min(sa.start, sb.start), end: Math.max(sa.end, sb.end),
        message: (c.uncertain ? '충돌 가능성(확실하지 않음)' : '충돌 가능성') + ": '" + sa.text + "' ↔ '" + sb.text + "'. " + c.reason +
          (c.uncertain ? ' 표현이 가리키는 대상이 서로 다를 수 있어 의도한 조합일 수도 있습니다.' : ' 의도한 조합이 아니라면 하나를 고르세요.')
      };
      if (c.uncertain) fields.uncertain = true;
      add('conflict', 'notice', fields);
    });

    // W4. 모호한 표현 · 불확실한 표현 · 부정 표현 (원문 단어 기준, 사전에 분류된 구간 안은 제외)
    var text = segs.map(function (s) { return s.text; }).join('');
    var tokens = [], m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(text)) !== null) {
      tokens.push({ key: norm(m[0]), start: m.index, end: m.index + m[0].length, raw: m[0] });
    }
    function insideClassified(start, end) {
      return segs.some(function (s) {
        return (s.status === 'matched' || s.status === 'out_of_scope') && start < s.end && end > s.start;
      });
    }
    var phrases = UNCERTAIN_PHRASES.map(norm);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (insideClassified(t.start, t.end)) continue;
      var raw = text.slice(t.start, t.end);
      if (VAGUE_SET[t.key]) {
        add('vague', 'notice', {
          term: raw, start: t.start, end: t.end,
          message: "'" + raw + "'은(는) 평가를 나타내는 표현이라 생성 AI가 구체적으로 무엇을 그릴지 알기 어렵습니다. 원하는 모습을 구체적인 요소(조명, 색, 스타일 등)로 바꿔 쓰는 게 좋습니다."
        });
        continue;
      }
      if (NEG_SET[t.key]) {
        add('negation', 'notice', {
          term: raw, start: t.start, end: t.end, verified: false,
          message: "'" + raw + "'은(는) 부정 지시입니다. 부정 지시는 모델에 따라 반대로 반영되기도 합니다. 빼고 싶은 것은 별도 입력 항목이 있는지 확인하세요. (검증 필요)"
        });
        continue;
      }
      // 불확실한 표현: 두 단어 구절을 먼저, 그다음 한 단어
      var matched = false;
      for (var p = 0; p < phrases.length && !matched; p++) {
        var words = phrases[p].split(' ');
        if (words.length === 2 && t.key === words[0] && tokens[i + 1] &&
            tokens[i + 1].key === words[1] &&
            /^\s+$/.test(text.slice(t.end, tokens[i + 1].start))) {
          var endPos = tokens[i + 1].end;
          add('uncertain', 'notice', {
            term: text.slice(t.start, endPos), start: t.start, end: endPos,
            message: "'" + text.slice(t.start, endPos) + "'은(는) 불확실한 표현이라 생성 AI가 임의로 해석할 수 있습니다. 원하는 것을 구체적으로 적으세요."
          });
          i++;
          matched = true;
        }
      }
      if (!matched && UNCERTAIN_SINGLE[t.key]) {
        add('uncertain', 'notice', {
          term: raw, start: t.start, end: t.end,
          message: "'" + raw + "'은(는) 불확실한 표현이라 생성 AI가 임의로 해석할 수 있습니다. 원하는 것을 구체적으로 적으세요."
        });
      }
    }

    // 정렬: 심각도 → 종류 → 발견 순서(고정)
    found.sort(function (a, b) {
      return LEVEL_RANK[a.level] - LEVEL_RANK[b.level] ||
        KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
        a._order - b._order;
    });
    found.forEach(function (w) {
      delete w._order;
      out.summary[w.level]++;
    });
    out.warnings = found;
    return out;
  }

  PC.check = check;
})();
