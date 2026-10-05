// 기본 용어 사전. 일반 스크립트(모듈 아님)라 file:// 로 열어도 동작한다.
// term: 소문자·단수형으로 적는다(대소문자 무시, 복수형 자동 처리와 맞추기 위함).
// verified: false 인 항목은 ko 를 "검증 필요"로 둔다. 확실하지 않은 설명은 쓰지 않는다.
(function () {
  var PC = (window.PromptCheck = window.PromptCheck || {});

  // appliesTo: 이 요소를 분석하는 프롬프트 카테고리
  PC.ELEMENTS = [
    { id: 'subject',        ko: '주제',          appliesTo: ['image', 'video'] },
    { id: 'setting',        ko: '배경/장소',     appliesTo: ['image', 'video'] },
    { id: 'style',          ko: '스타일',        appliesTo: ['image', 'video'] },
    { id: 'lighting',       ko: '조명',          appliesTo: ['image', 'video'] },
    { id: 'camera',         ko: '카메라',        appliesTo: ['image', 'video'] },
    { id: 'composition',    ko: '구도',          appliesTo: ['image', 'video'] },
    { id: 'color',          ko: '색',            appliesTo: ['image', 'video'] },
    { id: 'quality',        ko: '품질/해상도',   appliesTo: ['image', 'video'] },
    { id: 'intensity',      ko: '가중치/수식어', appliesTo: ['image', 'video'] },
    { id: 'camera_motion',  ko: '카메라 움직임', appliesTo: ['video'] },
    { id: 'subject_motion', ko: '피사체 움직임', appliesTo: ['video'] }
  ];

  var UNVERIFIED = '검증 필요';

  // 용어 하나는 의미(senses) 목록을 가진다. 의미마다 요소 하나 + 설명 하나.
  // 한 단어가 여러 요소로 쓰이면(다의어) 의미를 여러 개 둔다.
  function sense(element, ko) {
    return { element: element, ko: ko, verified: true };
  }
  // 의미 1개짜리 용어
  function t(term, element, ko) {
    return { term: term, senses: [sense(element, ko)] };
  }
  // 설명이 확실하지 않은 의미 1개짜리 용어
  function u(term, element) {
    return { term: term, senses: [{ element: element, ko: UNVERIFIED, verified: false }] };
  }
  // 다의어: pairs = [[element, ko], ...]
  function m(term, pairs) {
    return { term: term, senses: pairs.map(function (p) { return sense(p[0], p[1]); }) };
  }

  PC.DEFAULT_TERMS = [
    // 주제
    m('portrait', [
      ['subject', '인물의 얼굴·상반신을 담은 사진/그림'],
      ['composition', '세로로 긴 화면 방향(세로형 구도)']
    ]),
    m('landscape', [
      ['subject', '자연 풍경'],
      ['composition', '가로로 긴 화면 방향(가로형 구도)']
    ]),
    t('still life', 'subject', '정물(사물을 배치해 그린 장면)'),
    t('character', 'subject', '캐릭터'),
    t('creature', 'subject', '생물, 괴물 등 가상의 존재'),
    t('robot', 'subject', '로봇'),

    // 배경/장소
    t('forest', 'setting', '숲'),
    t('beach', 'setting', '해변'),
    t('city street', 'setting', '도시의 거리'),
    t('studio', 'setting', '스튜디오 배경'),
    t('indoor', 'setting', '실내'),
    t('outdoor', 'setting', '야외'),

    // 스타일
    t('photorealistic', 'style', '사진처럼 사실적인 표현'),
    t('watercolor', 'style', '수채화풍'),
    t('oil painting', 'style', '유화풍'),
    t('anime', 'style', '일본 애니메이션풍'),
    t('cyberpunk', 'style', '사이버펑크(어두운 미래 도시, 네온 분위기)'),
    t('cinematic', 'style', '영화 같은 분위기(의미가 넓고 모호할 수 있음)'),
    t('minimalist', 'style', '요소를 최소화한 단순한 스타일'),
    t('3d render', 'style', '3D 렌더링 느낌'),
    t('pixel art', 'style', '픽셀 아트'),

    // 조명
    t('golden hour', 'lighting', '해 뜬 직후·지기 직전의 따뜻한 빛'),
    t('soft light', 'lighting', '그림자가 부드러운 조명'),
    t('rim light', 'lighting', '피사체 윤곽을 따라 비추는 조명'),
    t('backlight', 'lighting', '피사체 뒤에서 비추는 역광'),
    t('studio lighting', 'lighting', '스튜디오에서 쓰는 인공 조명'),
    t('volumetric light', 'lighting', '공기 중에 빛줄기가 보이는 효과'),
    t('neon light', 'lighting', '네온 불빛'),
    t('natural light', 'lighting', '자연광'),
    t('dramatic lighting', 'lighting', '명암 대비가 강한 조명'),

    // 카메라
    t('35mm', 'camera', '35mm 초점거리(약간 넓은 화각)'),
    t('85mm', 'camera', '85mm 초점거리(인물 촬영에 흔한 화각)'),
    t('wide angle', 'camera', '광각(넓게 담김)'),
    t('telephoto', 'camera', '망원(멀리 있는 대상을 당겨 담음)'),
    t('macro', 'camera', '접사(아주 가까이서 확대 촬영)'),
    t('shallow depth of field', 'camera', '얕은 심도(초점 밖 배경이 흐려짐)'),
    t('bokeh', 'camera', '초점 밖 빛이 둥글게 흐려진 효과'),
    t('fisheye', 'camera', '어안렌즈(왜곡된 초광각)'),

    // 구도
    t('close-up', 'composition', '대상을 가까이 크게 담은 구도'),
    t('wide shot', 'composition', '대상과 주변을 넓게 담은 구도'),
    t('medium shot', 'composition', '인물의 상반신 정도를 담은 구도'),
    t('rule of thirds', 'composition', '화면을 3등분한 선·교차점에 대상을 두는 구도'),
    t('symmetrical', 'composition', '좌우 대칭 구도'),
    t('centered', 'composition', '대상을 화면 중앙에 두는 구도'),
    t('low angle', 'composition', '아래에서 올려다보는 시점'),
    t("bird's-eye view", 'composition', '높은 곳에서 내려다보는 시점'),

    // 색
    t('pastel', 'color', '파스텔 톤(연하고 부드러운 색)'),
    t('monochrome', 'color', '한 가지 색 계열'),
    t('vibrant', 'color', '선명하고 채도 높은 색'),
    t('muted', 'color', '채도가 낮고 차분한 색'),
    t('warm tone', 'color', '따뜻한 색조'),
    t('cool tone', 'color', '차가운 색조'),
    t('black and white', 'color', '흑백'),
    t('high contrast', 'color', '밝고 어두운 차이가 큼'),
    m('salmon', [
      ['subject', '연어(물고기)'],
      ['color', '연어살 같은 분홍빛 주황색']
    ]),

    // 품질/해상도
    t('4k', 'quality', '4K 해상도'),
    t('8k', 'quality', '8K 해상도'),
    t('high resolution', 'quality', '고해상도'),
    t('highly detailed', 'quality', '세부 묘사가 많음'),
    t('detailed', 'quality', '세부가 자세히 표현됨'),
    t('sharp focus', 'quality', '초점이 선명함'),
    t('hdr', 'quality', '하이 다이내믹 레인지(밝고 어두운 부분을 폭넓게 표현)'),
    t('masterpiece', 'quality', '걸작 수준을 요구하는 품질 강화 표현'),
    t('award-winning', 'quality', '수상작 수준을 요구하는 품질 강화 표현'),
    t('trending on artstation', 'quality', 'ArtStation 인기작 수준을 요구하는 품질 강화 표현'),

    // 가중치/수식어 (뒤따르는 말의 정도를 조절)
    t('very', 'intensity', '매우'),
    t('extremely', 'intensity', '극도로'),
    t('ultra', 'intensity', '극도의, 초(超)-'),
    t('highly', 'intensity', '매우, 고도로'),
    t('super', 'intensity', '매우, 초(超)-'),
    t('hyper', 'intensity', '과도한, 초(超)-'),
    t('slightly', 'intensity', '약간'),
    t('subtle', 'intensity', '은은한, 미묘한'),
    t('heavily', 'intensity', '심하게, 많이'),
    t('somewhat', 'intensity', '다소'),
    t('moderately', 'intensity', '적당히'),
    t('fairly', 'intensity', '꽤'),
    t('quite', 'intensity', '꽤, 상당히'),
    t('really', 'intensity', '정말로'),
    t('incredibly', 'intensity', '믿기 어려울 만큼 매우'),
    t('exceptionally', 'intensity', '유난히, 매우'),
    t('intensely', 'intensity', '강렬하게'),
    t('strongly', 'intensity', '강하게'),
    t('mildly', 'intensity', '약하게, 순하게'),
    t('overly', 'intensity', '지나치게'),

    // 카메라 움직임 (영상용)
    t('pan', 'camera_motion', '카메라를 좌우로 회전'),
    t('tilt', 'camera_motion', '카메라를 위아래로 회전'),
    t('zoom in', 'camera_motion', '확대(대상에 다가가는 효과)'),
    t('zoom out', 'camera_motion', '축소(대상에서 멀어지는 효과)'),
    t('dolly in', 'camera_motion', '카메라가 대상 쪽으로 이동'),
    t('tracking shot', 'camera_motion', '움직이는 대상을 따라가며 촬영'),
    t('handheld', 'camera_motion', '손으로 든 듯한 흔들림'),
    t('static shot', 'camera_motion', '카메라가 고정된 화면'),
    m('drone shot', [
      ['camera_motion', '드론이 날면서 촬영하는 카메라 이동'],
      ['composition', '드론으로 높이 올라 내려다보는 시점(항공 구도)']
    ]),
    t('orbit', 'camera_motion', '대상 주위를 도는 카메라'),

    // 피사체 움직임 (영상용)
    t('walking', 'subject_motion', '걷는 동작'),
    t('running', 'subject_motion', '달리는 동작'),
    t('dancing', 'subject_motion', '춤추는 동작'),
    t('flying', 'subject_motion', '날아가는 동작'),
    t('jumping', 'subject_motion', '뛰어오르는 동작'),
    t('spinning', 'subject_motion', '회전하는 동작'),
    t('floating', 'subject_motion', '떠 있거나 떠다니는 동작')
  ];
})();
