// 두 화면이 함께 쓰는 작은 화면 도우미. 사용자 입력은 textContent 로만 넣는다(innerHTML 사용 금지).
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

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

  PC.ui = { $: $, h: h, clear: clear, elVar: elVar, elementChip: elementChip, elementKo: elementKo };
})();
