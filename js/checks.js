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

  // 카메라 움직임 용어 묶음. 사전에 용어를 늘릴 때 여기에도 같은 뜻의 용어를 넣어야 충돌을 찾는다.
  // drone shot·aerial shot·helicopter shot(촬영 시점이기도 함), parallax·reveal shot(움직임의 결과/연출)은 넣지 않는다.
  var PAN_TERMS = ['pan', 'pan left', 'pan right', 'panning', 'panning shot', 'pan shot', 'slow pan', 'whip pan', 'swish pan',
    'pan and tilt', 'pan and zoom', 'camera pans', 'camera pans left', 'camera pans right'];
  var TILT_TERMS = ['tilt', 'tilt up', 'tilt down', 'whip tilt', 'pan and tilt', 'camera tilts', 'camera tilts up', 'camera tilts down'];
  var ZOOM_TERMS = ['zoom in', 'zoom out', 'slow zoom', 'slow zoom in', 'slow zoom out', 'zooming in', 'zooming out', 'crash zoom',
    'snap zoom', 'whip zoom', 'dolly zoom', 'vertigo effect', 'camera zooms in', 'camera zooms out', 'pan and zoom'];
  var SHAKE_TERMS = ['handheld', 'handheld camera', 'shaky cam', 'shaky camera', 'camera shake'];
  // 확대·축소(렌즈)를 뺀 카메라 이동·회전 용어
  var MOVE_TERMS = PAN_TERMS.concat(TILT_TERMS, SHAKE_TERMS, [
    'dolly in', 'dolly out', 'dolly back', 'dolly forward', 'dolly shot', 'push in', 'pull out', 'pull back',
    'truck left', 'truck right', 'trucking shot', 'lateral tracking shot', 'pedestal up', 'pedestal down',
    'crane up', 'crane down', 'crane shot', 'jib shot', 'boom up', 'boom down', 'rising shot', 'descending shot',
    'tracking shot', 'track in', 'track out', 'tracking in', 'tracking out', 'forward tracking shot', 'backward tracking shot',
    'reverse tracking shot', 'overhead tracking shot', 'side tracking shot', 'follow shot', 'following shot', 'follow cam',
    'steadicam', 'steadicam shot', 'gimbal shot', 'slider shot', 'cable cam',
    'orbit', 'orbiting shot', 'orbital shot', 'arc shot', 'arc around', 'orbit around', '360 orbit', '360 degree orbit',
    'circle around', 'revolve around', 'camera roll', 'barrel roll', 'rotating camera', 'camera rotation',
    'drone flyover', 'flyover', 'fly through', 'flythrough', 'fpv drone shot', 'fpv shot', 'aerial tracking shot', 'sweeping aerial shot',
    'camera pushes in', 'camera pulls back', 'camera pulls out', 'camera rises', 'camera descends', 'camera orbits',
    'camera circles', 'camera rotates', 'camera follows', 'camera tracks', 'camera glides', 'camera sweeps', 'camera drifts',
    'camera floats', 'camera swoops', 'camera dives', 'camera moves forward', 'camera moves backward', 'camera moves closer',
    'camera moves away', 'camera moves left', 'camera moves right', 'camera moves up', 'camera moves down',
    'moving camera', 'moving shot', 'gliding shot'
  ]);

  // 대상이 크게 움직이는 동작 용어. "no character movement" 같은 지시와 충돌할 수 있다.
  // 표정·호흡 같은 미세한 움직임과 자연 현상(바람에 흔들리는 풀, 흐르는 물)은 대상의 움직임 금지와 상관없어 뺀다.
  var SUBJECT_MOVE_TERMS = ['walking', 'running', 'dancing', 'flying', 'jumping', 'spinning', 'floating',
    'jogging', 'sprinting', 'strolling', 'wandering', 'marching', 'crawling', 'climbing', 'climbing up', 'climbing down',
    'swimming', 'diving', 'skipping', 'hopping', 'leaping', 'dashing', 'racing', 'charging', 'chasing', 'fleeing',
    'cycling', 'riding', 'rowing', 'surfing', 'waving', 'pointing', 'clapping', 'hugging', 'reaching', 'throwing',
    'pushing', 'pulling', 'lifting', 'standing up', 'sitting down', 'turning around', 'flipping', 'somersault', 'backflip',
    'cartwheel', 'kicking', 'punching', 'fighting', 'boxing', 'wrestling', 'swinging', 'twirling', 'tumbling', 'soaring',
    'gliding', 'falling', 'plunging', 'sinking', 'rising', 'ascending', 'bouncing', 'rolling', 'sliding', 'walk cycle', 'run cycle'];

  // 충돌 가능성이 있는 용어 쌍. 사전 용어(소문자, 하이픈은 공백)끼리 비교한다.
  var CONFLICTS = [
    { a: ['warm tone', 'warm light', 'warm lighting', 'warm sunlight', 'warm colors', 'warm palette'],
      b: ['cool tone', 'cool light', 'cool lighting', 'cold light', 'cool colors', 'cool palette'],
      reason: '따뜻한 색조와 차가운 색조는 서로 반대 방향의 색감입니다.' },
    { a: ['black and white'],
      b: ['vibrant', 'pastel', 'vibrant colors', 'vivid colors', 'bold colors', 'neon colors', 'pastel palette', 'neon palette', 'jewel tones'],
      reason: '흑백과 선명한 색·파스텔 색은 함께 쓰기 어렵습니다.' },
    { a: ['vibrant', 'vibrant colors', 'vivid colors', 'bold colors', 'saturated', 'high saturation', 'oversaturated'],
      b: ['muted', 'muted colors', 'muted palette', 'desaturated', 'low saturation', 'faded colors', 'washed out colors', 'washed out'],
      reason: '선명한 색과 채도 낮은 색은 서로 반대입니다.' },
    { a: ['close up', 'extreme close up', 'close up shot', 'tight shot', 'tight framing', 'fill the frame'],
      b: ['wide shot', 'wide angle', 'wide angle shot', 'extreme wide shot', 'extreme long shot', 'long shot', 'loose framing'],
      reason: '클로즈업과 넓게 담는 구도는 서로 반대입니다.' },
    { a: ['zoom in'], b: ['zoom out'],
      reason: '확대와 축소는 서로 반대 동작입니다.' },
    { a: ['static shot', 'locked-off shot', 'fixed shot', 'static camera', 'fixed camera', 'locked camera', 'locked-off camera', 'stationary camera',
          'tripod shot', 'camera is static', 'camera is fixed', 'camera remains static', 'camera remains completely static',
          'camera remains still', 'camera remains fixed', 'camera stays static', 'camera stays completely static',
          'camera stays still', 'camera does not move', "camera doesn't move"],
      b: MOVE_TERMS,
      reason: '고정된 화면과 카메라 움직임은 함께 쓰기 어렵습니다.' },
    // 부정형 카메라 움직임("no ...") ↔ 그 움직임을 요구하는 용어
    { a: ['no camera movement', 'no camera motion'],
      b: MOVE_TERMS.concat(ZOOM_TERMS),
      reason: '카메라 움직임이 없어야 한다는 지시와 카메라가 움직이는 촬영 방식을 함께 쓰고 있습니다.' },
    { a: ['no camera shake'], b: SHAKE_TERMS,
      reason: '흔들림이 없어야 한다는 지시와 손으로 든 듯 흔들리는 촬영 방식(핸드헬드)은 함께 쓰기 어렵습니다.' },
    { a: ['no zoom', 'no camera zoom'], b: ZOOM_TERMS,
      reason: '확대·축소를 하지 말라는 지시와 확대·축소 동작이 함께 있습니다.' },
    { a: ['no pan', 'no panning', 'no camera pan'], b: PAN_TERMS,
      reason: '카메라를 좌우로 돌리지 말라는 지시와 좌우로 도는 동작이 함께 있습니다.' },
    { a: ['no tilt'], b: TILT_TERMS,
      reason: '카메라를 위아래로 꺾지 말라는 지시와 위아래로 꺾는 동작이 함께 있습니다.' },
    // 부정형 피사체 움직임("no ...") ↔ 피사체 동작 용어. 표현이 가리키는 대상이 다를 수 있어
    // 카메라 쪽보다 확실하지 않으므로 uncertain 으로 표시한다. no movement/no motion 은 카메라일 수도 있어 여기서만 다룬다.
    { a: ['no character movement', 'no subject movement', 'no object movement', 'no movement', 'no motion'],
      b: SUBJECT_MOVE_TERMS,
      uncertain: true,
      reason: '대상이 움직이지 않아야 한다는 지시와 대상이 움직이는 동작을 함께 쓰고 있습니다.' },
    { a: ['indoor'], b: ['outdoor'],
      reason: '실내와 야외는 서로 반대 장소입니다.' },
    { a: ['centered', 'centered composition', 'center of frame'], b: ['rule of thirds', 'off center', 'off center composition'],
      reason: '중앙 배치와 삼분할 구도는 서로 다른 배치 방식입니다.' },
    { a: ['low angle', 'low angle shot', "worm's eye view", 'ground level shot'],
      b: ["bird's eye view", 'top down view', 'top down shot', 'overhead shot', 'overhead view', 'high angle', 'high angle shot',
          'aerial view', 'drone view', 'satellite view'],
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
    var negHits = []; // 부정 표현은 모아서 같은 문장끼리 안내 하나로 묶는다(no cuts, no dissolves, …)
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
        negHits.push({ raw: raw, start: t.start, end: t.end });
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

    // 부정 표현: 문장(. ! ? ; 줄바꿈으로 구분)마다 안내 하나
    function sentenceId(pos) {
      var n = 0;
      for (var k = 0; k < pos; k++) if (/[.!?;\n]/.test(text.charAt(k))) n++;
      return n;
    }
    var negGroups = [], negIndex = {};
    negHits.forEach(function (hit) {
      var id = sentenceId(hit.start);
      if (negIndex[id] === undefined) { negIndex[id] = negGroups.length; negGroups.push([]); }
      negGroups[negIndex[id]].push(hit);
    });
    var NEG_ADVICE = '부정 지시는 모델에 따라 반대로 반영되기도 합니다. 빼고 싶은 것은 별도 입력 항목이 있는지 확인하세요. (검증 필요)';
    negGroups.forEach(function (group) {
      var first = group[0], last = group[group.length - 1];
      var fields = { term: first.raw, start: first.start, end: last.end, verified: false };
      if (group.length === 1) {
        fields.message = "'" + first.raw + "'은(는) 부정 지시입니다. " + NEG_ADVICE;
      } else {
        fields.terms = group.map(function (h) { return h.raw; });
        fields.count = group.length;
        fields.term = fields.terms.join(', ');
        fields.message = '이 문장에 부정 지시가 ' + group.length + '곳 있습니다(' +
          fields.terms.map(function (r) { return "'" + r + "'"; }).join(', ') + '). ' + NEG_ADVICE;
      }
      add('negation', 'notice', fields);
    });

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
