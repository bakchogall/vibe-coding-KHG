// 해부 화면: 입력 → analyze → check → 화면 그리기. 분석·경고 로직은 다른 파일에 있고 여기서는 화면만 다룬다.
// 사용자 입력은 textContent 로만 넣는다(innerHTML 사용 금지).
(function () {
  var PC = window.PromptCheck;
  var MAX_LEN = 5000;

  var CATEGORIES = [
    { id: 'image', label: '이미지 생성용 프롬프트' },
    { id: 'video', label: '영상 생성용 프롬프트' }
  ];
  var LEVEL_LABEL = { warning: '경고', notice: '안내' };
  var SOURCE_LABEL = { default: '기본 사전', user: '사용자 사전', pattern: '패턴 규칙(추정)' };

  var state = { category: 'image', analysis: null, selected: -1, highlighted: [] };

  var elementKo = {};
  (PC.ELEMENTS || []).forEach(function (e) { elementKo[e.id] = e.ko; });

  function $(id) { return document.getElementById(id); }

  // 작은 DOM 헬퍼: h('div', { class: 'x', text: '...' }, [자식...])
  function h(tag, props, children) {
    var e = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined) return;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'style') e.setAttribute('style', v);
        else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function elVar(id) { return 'var(--c-' + id + ')'; }

  function elementChip(id, zero) {
    return h('span', {
      class: 'chip' + (zero ? ' zero' : ''),
      style: '--chip-bg:' + elVar(id),
      text: elementKo[id] || id
    });
  }

  // 이 구간에서 현재 카테고리에 해당하는 의미들
  function activeSenses(seg) {
    return (seg.senses || []).filter(function (s) { return s.inScope; });
  }

  function segBackground(seg) {
    var s = activeSenses(seg);
    if (!s.length) return '';
    if (s.length === 1) return elVar(s[0].element);
    var step = 100 / s.length, parts = [];
    s.forEach(function (x, i) {
      parts.push(elVar(x.element) + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%');
    });
    return 'linear-gradient(90deg, ' + parts.join(', ') + ')';
  }

  function segLabel(seg) {
    if (seg.status === 'matched') {
      var names = activeSenses(seg).map(function (s) { return s.elementKo; }).join('·');
      return names + (seg.source === 'pattern' ? ' (추정)' : '');
    }
    if (seg.status === 'out_of_scope') return '영상 전용';
    return '';
  }

  function segAria(seg) {
    if (seg.status === 'unmatched') return seg.text + ': 미분류';
    return seg.text + ': ' + segLabel(seg);
  }

  // ---- 그리기 ----

  function renderSummary(analysis) {
    var s = analysis.summary;
    var parts = ['분류됨 ' + s.matched + '개' + (s.fromPattern ? ' (그중 패턴 추정 ' + s.fromPattern + '개)' : ''),
      '미분류 ' + s.unmatched + '개'];
    if (s.outOfScope) parts.push('이 종류에 해당 없음 ' + s.outOfScope + '개');
    $('summary').textContent = parts.join(' · ');

    var legend = $('legend');
    clear(legend);
    (PC.ELEMENTS || []).forEach(function (e) {
      if (!(e.id in s.byElement)) return;
      var n = s.byElement[e.id];
      var chip = h('span', {
        class: 'chip' + (n === 0 ? ' zero' : ''),
        style: '--chip-bg:' + elVar(e.id),
        text: e.ko + ' ' + n
      });
      legend.appendChild(h('li', null, [chip]));
    });
  }

  function renderAnatomy(analysis) {
    var box = $('anatomy');
    clear(box);
    analysis.segments.forEach(function (seg, i) {
      if (seg.status === 'separator') {
        // 줄바꿈은 <br> 로, 나머지 공백·구두점은 그대로 둔다.
        var lines = seg.text.split('\n');
        lines.forEach(function (line, k) {
          if (k > 0) box.appendChild(h('br'));
          if (line) box.appendChild(h('span', { class: 'sep', text: line }));
        });
        return;
      }
      var cls = 'seg ' + seg.status + (seg.source === 'pattern' ? ' pattern' : '');
      var kids = [h('span', { class: 'seg-text', text: seg.text }), h('span', { class: 'seg-label', text: segLabel(seg) })];
      if (seg.status === 'ignored') {
        box.appendChild(h('span', { class: cls, 'data-i': i }, kids));
        return;
      }
      var bg = segBackground(seg);
      box.appendChild(h('button', {
        type: 'button', class: cls, 'data-i': i, 'aria-label': segAria(seg),
        style: bg ? '--seg-bg:' + bg : null,
        onclick: function () { select(i); }
      }, kids));
    });
  }

  function senseRow(s) {
    var kids = [elementChip(s.element), h('span', { text: s.ko })];
    if (!s.verified) kids.push(h('span', { class: 'badge', text: '검증 필요' }));
    if (!s.inScope) kids.push(h('span', { class: 'badge', text: '이 종류에서는 분석하지 않음' }));
    return h('div', { class: 'sense' }, kids);
  }

  function renderDetail() {
    var box = $('detail');
    clear(box);
    var analysis = state.analysis;
    var seg = analysis && state.selected >= 0 ? analysis.segments[state.selected] : null;
    if (!seg) {
      box.appendChild(h('p', { class: 'hint', text: '단어를 눌러 보세요.' }));
      return;
    }
    box.appendChild(h('h3', { text: seg.text }));
    if (seg.status === 'unmatched') {
      box.appendChild(h('p', { class: 'meta', text: '사전과 패턴 규칙에 없는 표현입니다. 주제나 배경을 가리키는 말일 수 있어 "주제/배경 후보"로 봅니다.' }));
      var holder = h('div', { class: 'lookup' });
      box.appendChild(holder);
      renderLookup(holder, seg.text);
      return;
    }
    var meta = '출처: ' + (SOURCE_LABEL[seg.source] || seg.source);
    if (seg.rule) meta += ' · 규칙 ' + seg.rule;
    box.appendChild(h('p', { class: 'meta', text: meta }));
    seg.senses.forEach(function (s) { box.appendChild(senseRow(s)); });
    if (seg.senses.length > 1) {
      box.appendChild(h('p', { class: 'meta', text: '뜻이 여러 개인 단어입니다. 문맥에 맞는 쪽으로 읽으세요.' }));
    }
  }

  // ---- 외부 조회(사용자가 버튼을 누를 때만 호출) ----

  var lookupToken = 0;
  var SOURCE_NAME = { wikipedia: 'Wikipedia', datamuse: 'Datamuse' };
  var ERROR_TEXT = {
    rate: '요청이 너무 많아 잠시 제한되었습니다. 1~2분 뒤에 다시 시도해 주세요.',
    timeout: '응답이 너무 늦어 중단했습니다. 잠시 뒤 다시 시도해 주세요.',
    network: '연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.',
    http: '조회 서비스가 정상적인 응답을 주지 않았습니다. 잠시 뒤 다시 시도해 주세요.'
  };

  function shortExtract(text) {
    var t = (text || '').trim();
    if (t.length <= 240) return t;
    var cut = t.slice(0, 240), dot = cut.lastIndexOf('. ');
    return dot > 80 ? cut.slice(0, dot + 1) : cut + '…';
  }

  function renderLookup(holder, term) {
    clear(holder);
    if (!PC.lookup.isLookupable(term)) {
      holder.appendChild(h('p', { class: 'meta', text: '영어 단어만 조회할 수 있어서 이 표현은 조회하지 않습니다.' }));
      return;
    }
    var cached = PC.lookup.getCached(term);
    if (cached) { renderLookupResult(holder, cached, term); return; }
    holder.appendChild(h('button', {
      type: 'button', class: 'btn small', text: '외부에서 찾아보기',
      onclick: function () { startLookup(holder, term); }
    }));
    holder.appendChild(h('p', { class: 'meta', text: '누르면 이 단어가 Wikipedia 서버로 전송됩니다(찾지 못하면 Datamuse에도). 조회 결과는 이 브라우저에 저장됩니다.' }));
  }

  function startLookup(holder, term) {
    var token = ++lookupToken;
    clear(holder);
    holder.appendChild(h('p', { class: 'meta', text: '"' + term + '" 조회 중…' }));
    PC.lookup.run(term).then(function (res) {
      // 다른 단어로 넘어가 화면이 다시 그려졌으면 결과를 그리지 않는다.
      if (token !== lookupToken || !holder.isConnected) return;
      clear(holder);
      renderLookupResult(holder, res, term);
    });
  }

  function renderLookupResult(holder, res, term) {
    var box = h('div', { class: 'result' });
    if (res.status === 'found') {
      var src = SOURCE_NAME[res.source] || res.source;
      box.appendChild(h('p', { class: 'meta', text: '외부 조회 결과 · 참고용, 검증되지 않음' + (res.fromCache ? ' · 저장된 결과' : '') }));
      box.appendChild(h('p', null, [
        h('strong', { text: (res.ko ? res.ko + ' / ' : '') + res.title }),
        ' (' + src + ')'
      ]));
      if (PC.lookup.norm(res.title) !== PC.lookup.norm(term)) {
        box.appendChild(h('p', { class: 'meta', text: "'" + term + "'와 이름이 다른 문서로 연결되었습니다. 같은 뜻인지 확인하세요." }));
      }
      var body = res.description ? res.description + (res.extract ? ' — ' + shortExtract(res.extract) : '') : shortExtract(res.extract);
      if (body) box.appendChild(h('p', { text: body }));
      if (res.guess) {
        box.appendChild(h('p', null, [
          elementChip(res.guess), ' ',
          h('span', { class: 'meta', text: '자동 추정이라 틀릴 수 있고, 경고 판정에는 반영되지 않습니다.' })
        ]));
      } else {
        box.appendChild(h('p', { class: 'meta', text: '요소를 추정하지 못했습니다.' }));
      }
      if (res.url && res.url.indexOf('https://en.wikipedia.org/') === 0) {
        box.appendChild(h('p', null, [h('a', { href: res.url, target: '_blank', rel: 'noopener noreferrer', text: '원문 보기 (Wikipedia)' })]));
      }
    } else if (res.status === 'ambiguous') {
      box.appendChild(h('p', { text: "'" + term + "'은(는) 여러 뜻이 있는 단어입니다(Wikipedia 동음이의 문서). 문맥에 맞는 뜻을 직접 확인하세요." }));
    } else if (res.status === 'notfound') {
      box.appendChild(h('p', { text: 'Wikipedia와 Datamuse에서 찾지 못했습니다. 사전에 없는 고유한 표현일 수 있습니다.' }));
    } else if (res.status === 'error') {
      box.appendChild(h('p', { text: ERROR_TEXT[res.kind] || ERROR_TEXT.network }));
      box.appendChild(h('button', {
        type: 'button', class: 'btn small', text: '다시 시도',
        onclick: function () { startLookup(holder, term); }
      }));
    } else {
      box.appendChild(h('p', { class: 'meta', text: '조회할 수 없는 표현입니다.' }));
    }
    holder.appendChild(box);
  }

  function renderWarnings(analysis) {
    var box = $('warnings');
    clear(box);
    var result = PC.check(analysis);
    if (!result.warnings.length) {
      box.appendChild(h('p', { class: 'ok-box', text: '발견된 경고가 없습니다. 다만 사전에 없는 표현은 점검하지 못합니다.' }));
      return;
    }
    var list = h('ul', { class: 'warn-list' });
    result.warnings.forEach(function (w) {
      var head = [h('span', { class: 'level', text: LEVEL_LABEL[w.level] || w.level })];
      if (w.verified === false) head.push(h('span', { class: 'badge', text: '검증 필요' }));
      if (typeof w.start === 'number') {
        head.push(h('button', {
          type: 'button', class: 'btn small', text: '위치 보기',
          onclick: function () { highlightRange(w.start, w.end); }
        }));
      }
      list.appendChild(h('li', { class: 'warn-item ' + w.level }, [
        h('div', { class: 'warn-head' }, head),
        h('p', { text: w.message })
      ]));
    });
    box.appendChild(list);
  }

  function renderTerms(analysis) {
    var list = $('terms');
    clear(list);
    var seen = {}, any = false;
    analysis.segments.forEach(function (seg, i) {
      if ((seg.status !== 'matched' && seg.status !== 'out_of_scope') || seen[seg.term]) return;
      seen[seg.term] = true;
      any = true;
      var senses = seg.senses.map(function (s) {
        var kids = [elementChip(s.element), h('span', { text: ' ' + s.ko })];
        if (!s.verified) kids.push(h('span', { class: 'badge', text: '검증 필요' }));
        if (!s.inScope) kids.push(h('span', { class: 'badge', text: '이 종류에서는 분석하지 않음' }));
        return h('p', { class: 'term-sense' }, kids);
      });
      list.appendChild(h('li', null, [
        h('div', { class: 'term-name' }, [
          h('button', { type: 'button', text: seg.text, onclick: function () { select(i); } }),
          seg.source === 'pattern' ? h('span', { class: 'badge', text: '추정' }) : null
        ]),
        h('div', null, senses)
      ]));
    });
    if (!any) list.appendChild(h('li', null, [h('span', { class: 'ok-box', text: '사전·패턴으로 분류된 용어가 없습니다.' })]));
  }

  function segmentNode(i) {
    return $('anatomy').querySelector('[data-i="' + i + '"]');
  }

  function applySelectionClasses() {
    var nodes = $('anatomy').querySelectorAll('.seg');
    Array.prototype.forEach.call(nodes, function (n) {
      var i = Number(n.getAttribute('data-i'));
      n.classList.toggle('sel', i === state.selected);
      n.classList.toggle('hl', state.highlighted.indexOf(i) !== -1);
    });
  }

  function select(i) {
    state.selected = i;
    state.highlighted = [];
    applySelectionClasses();
    renderDetail();
    var node = segmentNode(i);
    if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
  }

  function highlightRange(start, end) {
    var idxs = [];
    state.analysis.segments.forEach(function (seg, i) {
      if (seg.status !== 'separator' && seg.start < end && seg.end > start) idxs.push(i);
    });
    state.highlighted = idxs;
    state.selected = -1;
    applySelectionClasses();
    renderDetail();
    if (idxs.length) {
      var node = segmentNode(idxs[0]);
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'center' });
    }
  }

  function analyzeAndRender() {
    var text = $('prompt').value;
    $('counter').textContent = text.length + ' / ' + MAX_LEN;
    var empty = !text.trim();
    $('empty').hidden = !empty;
    $('results').hidden = empty;
    if (empty) { state.analysis = null; return; }
    var analysis = PC.analyze(text, state.category);
    state.analysis = analysis;
    state.selected = -1;
    state.highlighted = [];
    renderSummary(analysis);
    renderAnatomy(analysis);
    renderDetail();
    renderWarnings(analysis);
    renderTerms(analysis);
  }

  // ---- 메뉴 ----

  function fillSelect(sel, items, value) {
    clear(sel);
    items.forEach(function (it) {
      var o = h('option', { value: it.id, text: it.label });
      if (it.id === value) o.selected = true;
      sel.appendChild(o);
    });
  }

  function init() {
    fillSelect($('category'), CATEGORIES, state.category);

    $('category').addEventListener('change', function (e) {
      state.category = e.target.value;
      analyzeAndRender();
    });
    $('prompt').addEventListener('input', analyzeAndRender);
    analyzeAndRender();
  }

  init();
})();
