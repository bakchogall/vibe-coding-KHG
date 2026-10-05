// 패턴 규칙(2층)에 쓰는 목록. 일반 스크립트(모듈 아님)이며, 사전에 없는 표현을 모양으로 분류한다.
// 사전 일치가 항상 우선하고, 패턴은 사전 일치가 없는 위치에서만 쓰인다(js/analyzer.js 참고).
// 패턴 결과는 source: 'pattern' 으로 표시되어 화면에서 "추정"으로 보여줄 수 있다.
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  PC.PATTERNS = {
    // 단어 하나의 모양으로 분류하는 규칙(소문자로 정규화된 단어에 적용)
    regex: [
      { id: 'P1', element: 'camera',  re: /^\d{1,3}mm$/,
        ko: 'mm 단위 초점거리 표기' },
      { id: 'P2', element: 'quality', re: /^\d{3,4}p$/,
        ko: 'p 단위 해상도 표기' },
      { id: 'P2', element: 'quality', re: /^\d{1,2}k$/,
        ko: 'k 단위 해상도 표기' },
      { id: 'P2', element: 'quality', re: /^\d{3,5}x\d{3,5}$/,
        ko: '가로x세로 해상도 표기' },
      { id: 'P3', element: 'color',   re: /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/,
        ko: '16진수 색상 코드' }
    ],

    // P4: (수식어 0~1개) + 기본 색 이름.
    // 사물·음식·재료와 뜻이 겹치는 이름(orange, plum, orchid, violet, coral, salmon, tomato,
    // chocolate, snow, peach, mint, rose, lilac, gold, silver, lime, olive, lavender, amber 등)은
    // 일부러 뺀다. 이런 이름은 사전에 다의어(주제+색)로 등록한다.
    color: {
      id: 'P4',
      element: 'color',
      modifiers: ['light', 'dark', 'pale', 'deep', 'bright', 'vivid', 'muted', 'pastel',
                  'neon', 'warm', 'cool'],
      names: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'black', 'white',
              'gray', 'grey', 'cyan', 'magenta', 'teal', 'navy', 'maroon', 'beige', 'ivory',
              'crimson', 'scarlet', 'turquoise', 'indigo', 'aqua', 'aquamarine', 'azure',
              'burgundy', 'khaki', 'sienna', 'mauve', 'fuchsia', 'tan']
    },

    // P5~P8: (수식어 min~3개) + 머리말 단어. 머리말 단어는 복수형도 인정한다.
    // min: 필요한 최소 수식어 수. 0이면 머리말 단어만 있어도 분류한다.
    heads: [
      { id: 'P5', element: 'lighting', head: 'light',        min: 1 },
      { id: 'P5', element: 'lighting', head: 'lighting',     min: 0 },
      { id: 'P6', element: 'style',    head: 'style',        min: 1 },
      { id: 'P6', element: 'camera',   head: 'lens',         min: 0 },
      { id: 'P6', element: 'style',    head: 'render',       min: 1 },
      { id: 'P6', element: 'style',    head: 'illustration', min: 0 },
      { id: 'P6', element: 'style',    head: 'photography',  min: 0 },
      { id: 'P7', element: 'setting',  head: 'background',   min: 1 },
      { id: 'P8', element: 'color',    head: 'tone',         min: 1 },
      { id: 'P8', element: 'color',    head: 'palette',      min: 1 },
      { id: 'P8', element: 'color',    head: 'color',        min: 1 }
    ],
    maxModifiers: 3
  };
})();
