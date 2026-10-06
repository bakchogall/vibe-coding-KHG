// 용어 사전 화면: 기본 용어 + 내가 추가한 용어를 보여 주고, 사용자 용어를 추가·수정·삭제한다.
// 저장·검증은 js/userdict.js 가 맡고, 여기서는 화면만 다룬다. 사용자 입력은 textContent 로만 넣는다.
(function () {
  var PC = window.PromptCheck;
  var ui = PC.ui, U = PC.userDict;
  var $ = ui.$, h = ui.h, clear = ui.clear, elementChip = ui.elementChip;

  var opts = null;      // { getUserTerms, setUserTerms, onChange }
  var editing = { original: null, copyOfDefault: false }; // original: 수정 중인 내 용어(없으면 새로 추가)
  var drafts = [];      // 의미 입력 줄 [{ element, ko, verified }]
  var elementIds = (PC.ELEMENTS || []).map(function (e) { return e.id; });

  function blankSense() { return { element: '', ko: '', verified: true }; }

  // ---- 의미 입력 줄 ----

  function renderSenseRows() {
    var box = $('dict-senses');
    clear(box);
    drafts.forEach(function (d, i) {
      var sel = h('select', { 'aria-label': (i + 1) + '번째 의미의 요소' }, [h('option', { value: '', text: '요소 선택' })]);
      (PC.ELEMENTS || []).forEach(function (e) {
        var o = h('option', { value: e.id, text: e.ko });
        if (e.id === d.element) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () { d.element = sel.value; });

      var ko = h('input', { type: 'text', maxlength: String(U.MAX_KO), 'aria-label': (i + 1) + '번째 의미의 설명', placeholder: '짧은 한국어 설명' });
      ko.value = d.ko;
      ko.disabled = !d.verified;
      ko.addEventListener('input', function () { d.ko = ko.value; });

      var verify = h('input', { type: 'checkbox' });
      verify.checked = !d.verified;
      verify.addEventListener('change', function () {
        d.verified = !verify.checked;
        ko.disabled = !d.verified;
      });

      var del = h('button', {
        type: 'button', class: 'btn small', text: '의미 삭제',
        onclick: function () { drafts.splice(i, 1); renderSenseRows(); }
      });
      if (drafts.length === 1) del.disabled = true;

      box.appendChild(h('div', { class: 'sense-edit' }, [
        h('div', { class: 'sense-edit-head', text: (i + 1) + '번째 의미' }),
        h('div', { class: 'sense-edit-fields' }, [
          h('label', { class: 'field' }, [h('span', { class: 'field-label', text: '요소' }), sel]),
          h('label', { class: 'field grow' }, [h('span', { class: 'field-label', text: '설명' }), ko]),
          h('label', { class: 'check-inline' }, [verify, ' 검증 필요 표시']),
          del
        ])
      ]));
    });
    $('dict-add-sense').disabled = drafts.length >= U.MAX_SENSES;
  }

  // ---- 폼 상태 ----

  function setFormMode() {
    var editingUser = !!editing.original;
    $('dict-form-title').textContent = editingUser ? '용어 수정' : (editing.copyOfDefault ? '용어 추가 (기본 용어를 복사해 수정)' : '용어 추가');
    $('dict-save').textContent = editingUser ? '수정 저장' : '추가';
    $('dict-cancel').hidden = !(editingUser || editing.copyOfDefault);
  }

  function resetForm() {
    editing = { original: null, copyOfDefault: false };
    $('dict-term').value = '';
    drafts = [blankSense()];
    clear($('dict-errors'));
    setFormMode();
    renderSenseRows();
  }

  function notice(text, cls) {
    var box = $('dict-notice');
    clear(box);
    if (text) box.appendChild(h('p', { class: 'notice-box' + (cls ? ' ' + cls : ''), text: text }));
  }

  function draftsFromSenses(senses) {
    return senses.map(function (s) {
      var unverified = s.verified === false;
      return { element: s.element, ko: unverified ? '' : s.ko, verified: !unverified };
    });
  }

  function focusForm(selector) {
    var card = $('dict-form-card');
    if (card && card.scrollIntoView) card.scrollIntoView({ block: 'start' });
    var f = selector && card.querySelector(selector);
    if (f) f.focus();
  }

  function startEdit(row) {
    notice('');
    if (row.source === 'user') editing = { original: row.term, copyOfDefault: false };
    else editing = { original: null, copyOfDefault: true };
    $('dict-term').value = row.term;
    drafts = draftsFromSenses(row.senses);
    clear($('dict-errors'));
    setFormMode();
    renderSenseRows();
    focusForm('#dict-term');
  }

  // 해부 화면의 "사전에 추가"에서 온다. 이미 내 사전에 있으면 그 항목을 수정으로 연다.
  function openWithTerm(term) {
    var clean = U.normalizeTerm(term);
    var mine = opts.getUserTerms().filter(function (t) { return U.keyOf(t.term) === U.keyOf(clean); })[0];
    if (mine) { startEdit({ source: 'user', term: mine.term, senses: mine.senses }); return; }
    resetForm();
    $('dict-term').value = clean;
    notice('');
    focusForm('#dict-senses select');
  }

  function submit(ev) {
    ev.preventDefault();
    var userTerms = opts.getUserTerms();
    var entry = { term: $('dict-term').value, senses: drafts.map(function (d) { return { element: d.element, ko: d.ko, verified: d.verified }; }) };
    var res = U.validate(entry, { userTerms: userTerms, originalTerm: editing.original, elementIds: elementIds });
    var errBox = $('dict-errors');
    clear(errBox);
    if (res.errors.length) {
      res.errors.forEach(function (m) { errBox.appendChild(h('li', { text: m })); });
      return;
    }
    var overrides = PC.DEFAULT_TERMS.some(function (t) { return U.keyOf(t.term) === U.keyOf(res.entry.term); });
    var wasEdit = !!editing.original;
    var saved = opts.setUserTerms(U.upsert(userTerms, res.entry, editing.original));
    var msg = "'" + res.entry.term + "'을(를) " + (wasEdit ? '수정' : '추가') + '했습니다.' +
      (overrides ? ' 기본 사전의 같은 용어를 덮어씁니다.' : '');
    if (!saved) msg += ' 다만 브라우저 저장에 실패해서 이 페이지를 닫으면 사라집니다.';
    resetForm();
    notice(msg, saved ? '' : 'bad');
    refreshList();
    opts.onChange();
  }

  function removeUserTerm(row) {
    var overrides = PC.DEFAULT_TERMS.some(function (t) { return U.keyOf(t.term) === U.keyOf(row.term); });
    var ask = "'" + row.term + "'을(를) 내 사전에서 삭제할까요?" + (overrides ? ' 같은 이름의 기본 용어가 다시 쓰입니다.' : '');
    if (!window.confirm(ask)) return;
    if (editing.original && U.keyOf(editing.original) === U.keyOf(row.term)) resetForm();
    var saved = opts.setUserTerms(U.remove(opts.getUserTerms(), row.term));
    notice("'" + row.term + "'을(를) 삭제했습니다." + (saved ? '' : ' 다만 브라우저 저장에 실패했습니다.'), saved ? '' : 'bad');
    refreshList();
    opts.onChange();
  }

  // ---- 목록 ----

  function senseLine(s) {
    var kids = [elementChip(s.element)];
    if (s.verified === false) kids.push(h('span', { class: 'badge', text: '설명 검증 필요' }));
    else kids.push(h('span', { text: ' ' + s.ko }));
    return h('p', { class: 'term-sense' }, kids);
  }

  function buildRows() {
    var user = opts.getUserTerms();
    var userKeys = {};
    user.forEach(function (t) { userKeys[U.keyOf(t.term)] = true; });
    var rows = [];
    PC.DEFAULT_TERMS.forEach(function (t) {
      rows.push({ source: 'default', term: t.term, senses: t.senses, overridden: !!userKeys[U.keyOf(t.term)] });
    });
    user.forEach(function (t) { rows.push({ source: 'user', term: t.term, senses: t.senses, overridden: false }); });
    return rows;
  }

  function refreshList() {
    var q = $('dict-search').value.trim().toLowerCase();
    var el = $('dict-element').value;
    var onlyUser = $('dict-only-user').checked;
    var all = buildRows();
    var rows = all.filter(function (r) {
      if (onlyUser && r.source !== 'user') return false;
      if (el && !r.senses.some(function (s) { return s.element === el; })) return false;
      if (q && r.term.toLowerCase().indexOf(q) === -1 &&
          !r.senses.some(function (s) { return String(s.ko).toLowerCase().indexOf(q) !== -1; })) return false;
      return true;
    });
    rows.sort(function (a, b) { return a.term.localeCompare(b.term, 'en') || (a.source === 'user' ? -1 : 1); });

    var userCount = opts.getUserTerms().length;
    $('dict-count').textContent = '기본 용어 ' + PC.DEFAULT_TERMS.length + '개 · 내가 추가한 용어 ' + userCount + '개 · 표시 중 ' + rows.length + '개';

    var list = $('dict-list');
    clear(list);
    if (!rows.length) {
      list.appendChild(h('li', { class: 'none', text: '조건에 맞는 용어가 없습니다.' }));
      return;
    }
    rows.forEach(function (r) {
      var badges = [h('span', { class: 'badge' + (r.source === 'user' ? ' mine' : ''), text: r.source === 'user' ? '내 사전' : '기본' })];
      if (r.overridden) badges.push(h('span', { class: 'badge', text: '내 사전이 덮어씀' }));
      var actions = [];
      if (r.source === 'user') {
        actions.push(h('button', { type: 'button', class: 'btn small', text: '수정', onclick: function () { startEdit(r); } }));
        actions.push(h('button', { type: 'button', class: 'btn small', text: '삭제', onclick: function () { removeUserTerm(r); } }));
      } else if (!r.overridden) {
        actions.push(h('button', { type: 'button', class: 'btn small', text: '수정(내 사전에 복사)', onclick: function () { startEdit(r); } }));
      }
      list.appendChild(h('li', { class: 'dict-row' + (r.overridden ? ' overridden' : '') }, [
        h('div', { class: 'term-name' }, [h('strong', { text: r.term })].concat(badges)),
        h('div', null, r.senses.map(senseLine)),
        h('div', { class: 'row-actions' }, actions)
      ]));
    });
  }

  function init(options) {
    opts = options;
    var sel = $('dict-element');
    clear(sel);
    sel.appendChild(h('option', { value: '', text: '전체 요소' }));
    (PC.ELEMENTS || []).forEach(function (e) { sel.appendChild(h('option', { value: e.id, text: e.ko })); });

    $('dict-form').addEventListener('submit', submit);
    $('dict-add-sense').addEventListener('click', function () {
      if (drafts.length < U.MAX_SENSES) { drafts.push(blankSense()); renderSenseRows(); }
    });
    $('dict-cancel').addEventListener('click', function () { notice(''); resetForm(); });
    $('dict-search').addEventListener('input', refreshList);
    sel.addEventListener('change', refreshList);
    $('dict-only-user').addEventListener('change', refreshList);

    resetForm();
    if (options.initialNotice) notice(options.initialNotice, 'bad');
    refreshList();
  }

  PC.dictPage = { init: init, refresh: refreshList, openWithTerm: openWithTerm };
})();
