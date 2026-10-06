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
    t('sketch', 'style', '연필·펜으로 빠르게 그린 듯한 선 위주의 스케치 느낌'),

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

  // ---- 주제: 영어가 낯선 사람이 모를 만한 단어 위주 ----
  // 주제 = 화면에 그려지는 대상. 흔한 단어(cat, car 등)는 일부러 넣지 않는다.
  // 사전·패턴에서 분류되지 않은 내용어는 주제/배경 후보로 본다(분석 단계에서 처리).
  // 고유명사(유명인·브랜드·작품 속 캐릭터)와 화가 이름은 넣지 않는다.
  function subjects(pairs) {
    return pairs.map(function (p) { return t(p[0], 'subject', p[1]); });
  }

  var SUBJECT_TERMS = [].concat(
    // 동물
    subjects([
      ['hedgehog', '고슴도치'], ['hippopotamus', '하마'], ['rhinoceros', '코뿔소'],
      ['flamingo', '홍학'], ['peacock', '공작'], ['cheetah', '치타'], ['leopard', '표범'],
      ['jellyfish', '해파리'], ['seahorse', '해마'], ['dragonfly', '잠자리'],
      ['ladybug', '무당벌레'], ['squirrel', '다람쥐'], ['hawk', '매'], ['lobster', '바닷가재']
    ]),
    // 가상·판타지
    subjects([
      ['griffin', '그리핀(독수리 머리와 사자 몸을 가진 전설의 생물)'],
      ['centaur', '켄타우로스(반인반마)'], ['golem', '골렘(흙·돌로 만든 인조 거인)'],
      ['ogre', '오거(식인 거인)'], ['troll', '트롤'], ['goblin', '고블린'],
      ['phoenix', '불사조'], ['dwarf', '드워프'], ['elf', '엘프'], ['werewolf', '늑대인간'],
      ['unicorn', '유니콘'], ['cyborg', '사이보그'], ['android', '안드로이드(인간형 로봇)']
    ]),
    // 사람
    subjects([
      ['samurai', '사무라이'], ['knight', '기사'], ['astronaut', '우주비행사'],
      ['detective', '탐정'], ['firefighter', '소방관'], ['teenager', '십대 청소년'],
      ['elderly person', '노인'], ['crowd', '군중']
    ]),
    // 탈것
    subjects([
      ['locomotive', '기관차'], ['carriage', '마차'], ['tram', '트램, 노면전차'],
      ['tractor', '트랙터'], ['canoe', '카누'], ['yacht', '요트'], ['submarine', '잠수함'],
      ['hot air balloon', '열기구']
    ]),
    // 사물
    subjects([
      ['chandelier', '샹들리에'], ['lantern', '등불'], ['teapot', '찻주전자'],
      ['telescope', '망원경'], ['vase', '꽃병'], ['suitcase', '여행 가방'],
      ['statue', '조각상'], ['violin', '바이올린']
    ]),
    // 의류·소품
    subjects([
      ['armor', '갑옷'], ['shield', '방패'], ['helmet', '헬멧'], ['scarf', '스카프, 목도리'],
      ['glove', '장갑'], ['crown', '왕관'], ['necklace', '목걸이']
    ]),
    // 식물·꽃
    subjects([
      ['cactus', '선인장'], ['bonsai', '분재'], ['fern', '양치식물(고사리류)'],
      ['lotus', '연꽃'], ['bouquet', '꽃다발'], ['daisy', '데이지'], ['tulip', '튤립'],
      ['sunflower', '해바라기']
    ]),
    // 위 단어 중 불규칙 복수형(자동 복수형 처리로는 찾지 못하는 것)
    subjects([
      ['elves', '엘프들(elf의 복수)'], ['dwarves', '드워프들(dwarf의 복수)'],
      ['werewolves', '늑대인간들(werewolf의 복수)']
    ])
  );

  // 다의어: 사물·식물과 색 이름이 겹치는 단어 (주제 + 색). 이 단어들은 패턴 색 목록에서 제외되어 있다.
  var COLOR_OVERLAP_TERMS = [
    m('orange', [['subject', '오렌지(과일)'], ['color', '주황색']]),
    m('plum', [['subject', '자두'], ['color', '자두 같은 짙은 보라색']]),
    m('peach', [['subject', '복숭아'], ['color', '복숭아색(연한 분홍빛 주황색)']]),
    m('lime', [['subject', '라임(과일)'], ['color', '라임색(밝은 연두색)']]),
    m('tomato', [['subject', '토마토'], ['color', '토마토 같은 붉은색']]),
    m('chocolate', [['subject', '초콜릿'], ['color', '초콜릿색(짙은 갈색)']]),
    m('mint', [['subject', '민트(허브)'], ['color', '민트색(연한 청록색)']]),
    m('olive', [['subject', '올리브(열매)'], ['color', '올리브색(탁한 녹색)']]),
    m('rose', [['subject', '장미'], ['color', '장미색(붉은 분홍색)']]),
    m('orchid', [['subject', '난초'], ['color', '난초색(연한 보라색)']]),
    m('violet', [['subject', '제비꽃'], ['color', '제비꽃색(보라색)']]),
    m('lilac', [['subject', '라일락'], ['color', '라일락색(연한 보라색)']]),
    m('lavender', [['subject', '라벤더(식물)'], ['color', '라벤더색(연한 보라색)']]),
    m('coral', [['subject', '산호'], ['color', '산호색(분홍빛 주황색)']]),
    m('amber', [['subject', '호박(나무 수지가 굳은 보석)'], ['color', '호박색(노르스름한 주황색)']])
  ];

  PC.DEFAULT_TERMS = PC.DEFAULT_TERMS.concat(SUBJECT_TERMS, COLOR_OVERLAP_TERMS);
})();
