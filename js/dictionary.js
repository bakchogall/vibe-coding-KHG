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
    { id: 'subject_motion', ko: '피사체 움직임', appliesTo: ['video'] },
    { id: 'transition',     ko: '전환/편집',     appliesTo: ['video'] }
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
    t('cityscape', 'setting', '도시의 전경. 건물과 스카이라인이 보이는 도시 풍경'),

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
    t('golden hour', 'lighting', '해 뜬 직후·지기 직전의 따뜻한 금빛 광선. 포근하고 낭만적인 분위기'),
    t('soft light', 'lighting', '그림자 경계가 흐리고 대비가 낮은 조명. 부드럽고 편안한 느낌'),
    t('rim light', 'lighting', '피사체 가장자리를 따라 비추는 조명. 윤곽이 빛나 배경에서 분리되어 보임'),
    t('backlight', 'lighting', '피사체 뒤에서 비추는 역광. 윤곽이 빛나고 앞면은 어두워지기 쉬움'),
    t('studio lighting', 'lighting', '스튜디오처럼 통제된 인공 조명. 깔끔하고 고른 상업 사진 느낌'),
    t('volumetric light', 'lighting', '안개·먼지 속에서 빛줄기가 보이는 효과. 깊이감과 신비로운 분위기'),
    t('neon light', 'lighting', '네온사인 같은 선명한 색 조명. 밤거리·사이버펑크 분위기'),
    t('natural light', 'lighting', '햇빛·창가 빛 같은 자연광. 꾸밈없고 사실적인 느낌'),
    t('dramatic lighting', 'lighting', '명암 대비가 강한 조명. 긴장감 있고 극적인 분위기'),

    // 카메라
    t('35mm', 'camera', '35mm 초점거리. 약간 넓은 화각으로 스냅·거리 사진 같은 현장감'),
    t('85mm', 'camera', '85mm 초점거리. 인물을 자연스럽게 담고 배경이 부드럽게 흐려짐'),
    t('wide angle', 'camera', '넓은 화각. 한 화면에 더 많은 공간이 담기고 원근감이 과장됨'),
    t('telephoto', 'camera', '망원. 멀리 있는 대상을 당겨 담고 배경이 압축돼 보임'),
    t('macro', 'camera', '접사. 아주 가까이서 작은 대상의 세부를 크게 담음'),
    t('shallow depth of field', 'camera', '얕은 심도. 초점 맞은 부분만 선명하고 배경이 흐려져 대상이 돋보임'),
    t('bokeh', 'camera', '초점 밖 빛이 둥글게 번져 부드럽게 보이는 효과'),
    t('fisheye', 'camera', '어안렌즈. 극단적으로 넓고 둥글게 휘어 보이는 왜곡'),

    // 구도
    t('close-up', 'composition', '대상을 가까이 크게 담음. 표정·세부가 강조됨'),
    t('wide shot', 'composition', '대상과 주변 환경을 넓게 담음. 장소와 규모감이 보임'),
    t('medium shot', 'composition', '인물의 허리 위쯤을 담음. 표정과 몸짓이 함께 보임'),
    t('rule of thirds', 'composition', '화면을 가로세로 3등분한 선·교차점에 대상을 둠. 안정적이고 자연스러운 균형'),
    t('symmetrical', 'composition', '좌우 대칭 구도. 안정적이고 정돈된 느낌'),
    t('centered', 'composition', '대상을 화면 중앙에 둠. 시선이 집중되고 정면적인 느낌'),
    t('low angle', 'composition', '아래에서 올려다보는 시점. 대상이 크고 강해 보임'),
    t("bird's-eye view", 'composition', '높은 곳에서 내려다보는 시점. 전체 배치가 한눈에 보이고 대상이 작아 보임'),

    // 색
    t('pastel', 'color', '연하고 부드러운 파스텔 톤. 차분하고 몽환적인 느낌'),
    t('monochrome', 'color', '한 가지 색 계열만 사용. 통일감이 강하고 단정함'),
    t('vibrant', 'color', '선명하고 채도 높은 색. 활기차고 눈에 잘 띔'),
    t('muted', 'color', '채도가 낮은 차분한 색. 가라앉은 분위기'),
    t('warm tone', 'color', '붉은·주황 계열의 따뜻한 색조. 포근하고 아늑한 느낌'),
    t('cool tone', 'color', '파란·청록 계열의 차가운 색조. 시원하고 차분하거나 쓸쓸한 느낌'),
    t('black and white', 'color', '흑백. 색 대신 명암과 질감이 강조됨'),
    t('high contrast', 'color', '밝고 어두운 차이가 커서 강렬한 느낌'),
    m('salmon', [
      ['subject', '연어(물고기)'],
      ['color', '연어살 같은 분홍빛 주황색']
    ]),

    // 품질/해상도
    t('4k', 'quality', '4K 해상도 표현. 선명한 화질을 요구할 때 자주 씀'),
    t('8k', 'quality', '8K 해상도 표현. 더 높은 화질을 요구할 때 자주 씀'),
    t('high resolution', 'quality', '고해상도를 요구하는 표현'),
    t('highly detailed', 'quality', '세부 묘사를 많이 요구함. 질감과 디테일이 풍부해짐'),
    t('detailed', 'quality', '세부가 자세히 표현되길 요구함'),
    t('sharp focus', 'quality', '초점이 선명하게 맞은 상태를 요구함'),
    t('hdr', 'quality', '하이 다이내믹 레인지. 밝은 곳과 어두운 곳의 디테일을 모두 살려 표현'),
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

  function effects(element, pairs) {
    return pairs.map(function (p) { return t(p[0], element, p[1]); });
  }

  // ---- 핵심 효과 설명 보강: 조명·카메라·구도·색·품질 (번역이 아니라 결과물에 미치는 효과 중심) ----
  var EFFECT_TERMS = [].concat(
    // lighting
    effects('lighting', [
      ['hard light', '그림자가 선명하고 대비가 강한 직접 조명. 질감과 윤곽이 날카롭게 보임'],
      ['ambient light', '장면 전체를 은은하게 채우는 주변광. 그림자가 약하고 분위기가 고름'],
      ['low key', '어두운 톤 위주에 강한 명암 대비. 무겁고 극적인 분위기'],
      ['high key', '밝은 톤 위주에 그림자가 적음. 밝고 가벼운 느낌'],
      ['cinematic lighting', '영화처럼 연출된 조명. 대비와 색감이 강조됨'],
      ['moonlight', '달빛. 푸르스름하고 차분한 밤 분위기'],
      ['candlelight', '촛불. 따뜻하고 약한 빛이 아늑한 분위기를 만듦'],
      ['overcast', '흐린 하늘 아래의 고르고 부드러운 빛. 그림자가 거의 없음'],
      ['blue hour', '해 뜨기 전·해 진 직후 하늘이 푸르게 물드는 시간대의 차분한 푸른빛'],
      ['spotlight', '한 곳에 집중된 빛. 주인공이 돋보임'],
      ['diffused light', '부드럽게 퍼진 빛. 그림자가 흐릿하고 고른 느낌'],
      ['chiaroscuro', '밝음과 어둠의 강한 대비로 입체감을 만드는 명암 기법']
    ]),
    // camera
    effects('camera', [
      ['depth of field', '심도. 초점이 맞는 범위로, 얕으면 배경이 흐려지고 깊으면 전체가 선명함'],
      ['long exposure', '장노출. 움직이는 것이 흐르듯 번지고 빛이 선으로 남음'],
      ['tilt shift', '틸트시프트. 실제 풍경이 미니어처처럼 보이는 효과'],
      ['lens flare', '강한 빛이 렌즈에 반사돼 생기는 번짐과 빛무리'],
      ['film grain', '필름 사진 같은 거친 입자감'],
      ['anamorphic', '아나모픽. 영화 같은 와이드 화면과 가로로 길게 번지는 빛 효과'],
      ['vignette', '비네팅. 화면 가장자리가 어두워져 시선이 중앙에 모임'],
      ['motion blur', '모션 블러. 움직임이 흐려져 속도감이 생김']
    ]),
    // composition
    effects('composition', [
      ['dutch angle', '카메라를 기울여 수평선이 비스듬한 화면. 불안하고 긴장된 느낌'],
      ['over the shoulder', '인물의 어깨 너머로 대상을 보는 시점. 대화·관찰하는 느낌'],
      ['extreme close-up', '눈이나 입처럼 아주 작은 부분을 화면 가득 담음. 감정과 디테일이 크게 강조됨'],
      ['full body', '머리부터 발끝까지 전신을 담은 구도'],
      ['leading lines', '길·선이 시선을 대상으로 이끄는 구도'],
      ['negative space', '대상 주변을 비워 두는 구도. 대상이 돋보이고 여유로운 느낌'],
      ['high angle', '위에서 내려다보는 시점. 대상이 작고 약해 보임'],
      ['eye level', '대상의 눈높이에서 촬영. 자연스럽고 중립적인 느낌'],
      ['golden ratio', '황금비율에 맞춰 배치한 구도. 안정적이고 균형 잡힌 느낌'],
      ['establishing shot', '장면의 장소와 상황을 한눈에 보여 주는 넓은 컷']
    ]),
    // color
    effects('color', [
      ['sepia', '갈색빛으로 바랜 옛 사진 같은 색조'],
      ['saturated', '채도가 높아 색이 진하고 강함'],
      ['desaturated', '채도를 낮춰 색이 빠진 듯한 차분한 느낌'],
      ['complementary colors', '보색(서로 반대편 색) 조합. 강한 색 대비로 눈에 띔'],
      ['analogous colors', '색상환에서 이웃한 색의 조합. 조화롭고 편안함'],
      ['iridescent', '보는 각도에 따라 무지갯빛으로 변하는 광택'],
      ['gradient', '한 색에서 다른 색으로 자연스럽게 이어지는 변화'],
      ['duotone', '두 가지 색만으로 이루어진 화면'],
      ['teal and orange', '청록과 주황의 조합. 영화 색보정에서 흔한 대비'],
      ['earth tones', '흙·나무 같은 갈색·황토 계열의 차분한 색']
    ]),
    // quality
    effects('quality', [
      ['intricate details', '정교하고 복잡한 세부 묘사를 요구함'],
      ['high quality', '높은 화질을 요구하는 막연한 표현. 구체적인 효과는 모델 해석에 따름'],
      ['fine details', '섬세한 세부 묘사를 요구함'],
      ['ultra hd', '초고화질(UHD)을 요구하는 표현']
    ])
  );

  // ---- 부정형 움직임 지시 (영상용) ----
  // "No camera movement"처럼 no 가 붙어야 움직임 요소로서 뜻이 생기는 표현.
  // camera movement 단독은 뜻이 애매해 넣지 않고, no 가 붙은 형태만 등록한다.
  // 카메라인지 대상인지 문맥에 따라 갈리는 일반형(no movement, no motion)은 두 의미를 모두 둔다.
  var NO_CAMERA = '카메라가 움직이지 않는 고정된 화면을 요구함';
  var NEGATED_MOTION_TERMS = [
    t('no camera movement', 'camera_motion', NO_CAMERA),
    t('no camera motion', 'camera_motion', NO_CAMERA),
    t('no camera shake', 'camera_motion', '카메라 흔들림 없이 안정된 화면을 요구함'),
    t('no camera zoom', 'camera_motion', '확대·축소 없이 같은 화각을 유지하도록 요구함'),
    t('no camera pan', 'camera_motion', '카메라가 좌우로 돌지 않도록 요구함'),
    t('no zoom', 'camera_motion', '확대·축소 없이 같은 화각을 유지하도록 요구함'),
    t('no pan', 'camera_motion', '카메라가 좌우로 돌지 않도록 요구함'),
    t('no panning', 'camera_motion', '카메라가 좌우로 돌지 않도록 요구함'),
    t('no tilt', 'camera_motion', '카메라가 위아래로 꺾이지 않도록 요구함'),
    t('no character movement', 'subject_motion', '캐릭터가 움직이지 않도록 요구함'),
    t('no subject movement', 'subject_motion', '대상이 움직이지 않도록 요구함'),
    t('no object movement', 'subject_motion', '사물이 움직이지 않도록 요구함'),
    m('no movement', [
      ['camera_motion', '카메라 움직임 없음을 요구하는 표현'],
      ['subject_motion', '대상의 움직임 없음을 요구하는 표현']
    ]),
    m('no motion', [
      ['camera_motion', '카메라 움직임 없음을 요구하는 표현'],
      ['subject_motion', '대상의 움직임 없음을 요구하는 표현']
    ])
  ];

  // ---- 고정 카메라 표현 (영상용) ----
  // static 단독은 static noise 처럼 다른 뜻이 있어 등록하지 않고, camera 와 함께 쓰인 형태만 등록한다.
  var STATIC_CAMERA = '카메라가 고정되어 움직이지 않는 화면을 요구함';
  var STATIC_CAMERA_TERMS = [
    t('static camera', 'camera_motion', STATIC_CAMERA),
    t('fixed camera', 'camera_motion', STATIC_CAMERA),
    t('locked camera', 'camera_motion', STATIC_CAMERA),
    t('locked-off camera', 'camera_motion', '삼각대 등에 고정해 전혀 움직이지 않는 카메라. 안정적인 고정 화면'),
    t('stationary camera', 'camera_motion', STATIC_CAMERA),
    t('tripod shot', 'camera_motion', '삼각대에 고정해 찍은 안정된 화면'),
    t('camera is static', 'camera_motion', STATIC_CAMERA),
    t('camera is fixed', 'camera_motion', STATIC_CAMERA),
    t('camera remains static', 'camera_motion', STATIC_CAMERA),
    t('camera remains completely static', 'camera_motion', STATIC_CAMERA),
    t('camera remains still', 'camera_motion', STATIC_CAMERA),
    t('camera remains fixed', 'camera_motion', STATIC_CAMERA),
    t('camera stays static', 'camera_motion', STATIC_CAMERA),
    t('camera stays completely static', 'camera_motion', STATIC_CAMERA),
    t('camera stays still', 'camera_motion', STATIC_CAMERA),
    t('camera does not move', 'camera_motion', '카메라가 움직이지 않도록 요구함'),
    t("camera doesn't move", 'camera_motion', '카메라가 움직이지 않도록 요구함')
  ];

  // ---- lights: 조명(빛)일 수도, 전등·표시등 같은 사물일 수도 있는 다의어 ----
  // 앞에 수식어가 붙은 형태(indicator lights 등)는 패턴 규칙 P5가 같은 두 의미로 처리한다.
  var LIGHTS_TERMS = [
    m('lights', [
      ['lighting', '장면을 비추는 빛(조명)'],
      ['subject', '전등·표시등 같은 조명 기구(사물)']
    ])
  ];

  // ---- camera, shot: 촬영의 핵심 단어 (다의어) ----
  // camera: 촬영 장비·촬영 방식을 가리키는 말이면서, 화면에 등장하는 사물일 수도 있다.
  // shot: 한 장면을 담는 단위로 구도(wide shot 등)와 촬영 방식(끊지 않고 이어 찍기 등) 양쪽에 쓰인다.
  var CONTINUOUS_SHOT = '컷 없이 끊지 않고 이어 찍은 장면. 카메라가 쉬지 않고 이어서 움직이는 연출';
  var CAMERA_WORD_TERMS = [
    m('camera', [
      ['camera', '카메라(촬영 장비). 화면이 어떻게 찍히는지를 가리키는 말과 함께 쓰임'],
      ['subject', '화면에 등장하는 카메라라는 사물 자체']
    ]),
    m('shot', [
      ['composition', '한 장면을 담는 단위(샷). wide shot·close-up처럼 담는 범위를 나타내는 말과 함께 쓰임'],
      ['camera_motion', '촬영 방식(컷·테이크). 끊지 않고 이어 찍는지 등 카메라 움직임과 관련된 표현에 붙어 쓰임']
    ]),
    t('continuous shot', 'camera_motion', CONTINUOUS_SHOT),
    t('one continuous shot', 'camera_motion', CONTINUOUS_SHOT),
    t('single continuous shot', 'camera_motion', CONTINUOUS_SHOT),
    t('one single continuous shot', 'camera_motion', CONTINUOUS_SHOT),
    t('unbroken shot', 'camera_motion', CONTINUOUS_SHOT),
    t('one take', 'camera_motion', '한 번의 테이크로 끊지 않고 이어 찍음'),
    t('single take', 'camera_motion', '한 번의 테이크로 끊지 않고 이어 찍음'),
    t('long take', 'camera_motion', '컷 없이 오래 이어 찍는 긴 테이크')
  ];

  // ---- 카메라 움직임 확장 (영상용) ----
  // 촬영 용어집 기준으로 체계적으로 채운다. 설명은 번역이 아니라 화면에 미치는 효과 중심.
  function cm(pairs) {
    return pairs.map(function (p) { return t(p[0], 'camera_motion', p[1]); });
  }
  var CAMERA_MOTION_TERMS = [].concat(
    // 팬·틸트
    cm([
      ['pan left', '카메라를 왼쪽으로 돌려 장면을 훑음'],
      ['pan right', '카메라를 오른쪽으로 돌려 장면을 훑음'],
      ['panning', '카메라를 좌우로 돌리는 움직임'],
      ['panning shot', '카메라를 좌우로 돌리며 찍은 장면. 넓은 공간을 훑어보는 느낌'],
      ['pan shot', '카메라를 좌우로 돌리며 찍은 장면. 넓은 공간을 훑어보는 느낌'],
      ['slow pan', '천천히 좌우로 도는 카메라. 장면을 차분히 훑어보는 느낌'],
      ['whip pan', '카메라를 아주 빠르게 휙 돌려 화면이 흐려지는 효과. 장면 전환이나 급한 시선 이동에 쓰임'],
      ['swish pan', '카메라를 아주 빠르게 휙 돌려 화면이 흐려지는 효과. 장면 전환이나 급한 시선 이동에 쓰임'],
      ['tilt up', '카메라를 위로 꺾어 아래에서 위로 훑음. 높은 대상을 드러내는 느낌'],
      ['tilt down', '카메라를 아래로 꺾어 위에서 아래로 훑음'],
      ['whip tilt', '카메라를 위아래로 아주 빠르게 휙 꺾는 움직임'],
      ['pan and tilt', '카메라를 좌우와 위아래로 함께 돌림'],
      ['pan and zoom', '카메라를 좌우로 돌리면서 확대·축소함']
    ]),
    // 줌·푸시·풀·달리
    cm([
      ['slow zoom', '천천히 확대하거나 축소해 시선을 서서히 모음'],
      ['slow zoom in', '천천히 확대. 대상에 서서히 집중시키는 느낌'],
      ['slow zoom out', '천천히 축소. 주변 환경이 서서히 드러남'],
      ['zooming in', '확대하는 중. 대상이 점점 크게 보임'],
      ['zooming out', '축소하는 중. 대상이 점점 작아지며 주변이 넓어짐'],
      ['crash zoom', '순식간에 확 확대. 충격이나 강조 효과'],
      ['snap zoom', '순식간에 확 확대. 충격이나 강조 효과'],
      ['whip zoom', '아주 빠르게 확대하거나 축소하는 효과'],
      ['dolly zoom', '카메라는 다가가면서 화각은 넓히는(또는 반대) 기법. 대상 크기는 그대로인데 배경이 늘어나거나 줄어들어 어지러운 느낌'],
      ['vertigo effect', '카메라는 다가가면서 화각은 넓히는(또는 반대) 기법. 대상 크기는 그대로인데 배경이 늘어나거나 줄어들어 어지러운 느낌'],
      ['push in', '카메라가 대상 쪽으로 밀고 들어감. 긴장과 집중이 커짐'],
      ['pull out', '카메라가 대상에서 멀어지며 물러남. 주변 환경이 드러남'],
      ['pull back', '카메라가 대상에서 뒤로 물러남. 주변 환경이 드러남'],
      ['dolly out', '카메라가 레일 등으로 뒤로 물러나며 찍음'],
      ['dolly back', '카메라가 레일 등으로 뒤로 물러나며 찍음'],
      ['dolly forward', '카메라가 레일 등으로 앞으로 다가가며 찍음'],
      ['dolly shot', '레일이나 수레 위에서 부드럽게 이동하며 찍은 장면']
    ]),
    // 트럭·크레인·상하 이동
    cm([
      ['truck left', '카메라를 왼쪽 옆으로 평행하게 이동'],
      ['truck right', '카메라를 오른쪽 옆으로 평행하게 이동'],
      ['trucking shot', '카메라가 옆으로 평행하게 이동하며 찍은 장면'],
      ['lateral tracking shot', '대상과 나란히 옆으로 이동하며 찍은 장면'],
      ['pedestal up', '카메라를 수직으로 높임'],
      ['pedestal down', '카메라를 수직으로 낮춤'],
      ['crane up', '크레인으로 카메라를 위로 올림. 장면이 넓게 펼쳐지는 느낌'],
      ['crane down', '크레인으로 카메라를 아래로 내림. 대상에 가까워지는 느낌'],
      ['crane shot', '크레인으로 높이와 방향을 부드럽게 바꾸며 찍은 장면'],
      ['jib shot', '긴 팔(지브)에 카메라를 달아 부드럽게 오르내리거나 휘돌며 찍은 장면'],
      ['boom up', '붐 팔로 카메라를 위로 올림'],
      ['boom down', '붐 팔로 카메라를 아래로 내림'],
      ['rising shot', '카메라가 위로 상승하며 찍은 장면'],
      ['descending shot', '카메라가 아래로 하강하며 찍은 장면']
    ]),
    // 트래킹·따라가기·흔들림
    cm([
      ['track in', '카메라가 대상 쪽으로 다가가며 따라 찍음'],
      ['track out', '카메라가 대상에서 멀어지며 찍음'],
      ['tracking in', '카메라가 대상 쪽으로 다가가며 따라 찍음'],
      ['tracking out', '카메라가 대상에서 멀어지며 찍음'],
      ['forward tracking shot', '카메라가 앞으로 나아가며 찍은 장면'],
      ['backward tracking shot', '카메라가 뒤로 물러나며 찍은 장면'],
      ['reverse tracking shot', '카메라가 뒤로 물러나며 찍은 장면'],
      ['overhead tracking shot', '대상 위에서 내려다보며 따라가는 장면'],
      ['side tracking shot', '대상 옆에서 나란히 따라가며 찍은 장면'],
      ['follow shot', '움직이는 대상을 뒤따라가며 찍은 장면'],
      ['following shot', '움직이는 대상을 뒤따라가며 찍은 장면'],
      ['follow cam', '움직이는 대상을 뒤따라가며 찍는 카메라'],
      ['steadicam', '흔들림을 잡아 주는 장비. 부드럽게 따라가며 찍은 느낌'],
      ['steadicam shot', '흔들림을 잡아 주는 장비로 부드럽게 따라가며 찍은 장면'],
      ['gimbal shot', '짐벌로 흔들림 없이 부드럽게 이동하며 찍은 장면'],
      ['shaky cam', '카메라가 흔들리는 효과. 긴박하고 현장감 있는 느낌'],
      ['shaky camera', '카메라가 흔들리는 효과. 긴박하고 현장감 있는 느낌'],
      ['handheld camera', '손으로 든 듯 조금 흔들리는 카메라. 다큐멘터리 같은 현장감'],
      ['camera shake', '카메라가 흔들리는 현상이나 효과']
    ]),
    // 궤도·회전
    cm([
      ['orbiting shot', '카메라가 대상 주위를 돌며 찍은 장면. 입체감과 극적인 느낌'],
      ['orbital shot', '카메라가 대상 주위를 돌며 찍은 장면. 입체감과 극적인 느낌'],
      ['arc shot', '카메라가 대상 주위를 호를 그리며 도는 장면'],
      ['arc around', '카메라가 대상 주위를 호를 그리며 돎'],
      ['orbit around', '카메라가 대상 주위를 돎'],
      ['360 orbit', '카메라가 대상 주위를 한 바퀴(360도) 돎'],
      ['360 degree orbit', '카메라가 대상 주위를 한 바퀴(360도) 돎'],
      ['circle around', '카메라가 대상 주위를 빙 돎'],
      ['revolve around', '카메라가 대상 주위를 빙 돎'],
      ['camera roll', '카메라가 렌즈 방향을 축으로 돌아 화면이 기울어지며 도는 움직임'],
      ['barrel roll', '카메라나 비행체가 앞뒤 축으로 한 바퀴 구르는 움직임'],
      ['rotating camera', '카메라가 도는 장면'],
      ['camera rotation', '카메라의 회전']
    ]),
    // 항공·비행 (aerial shot, helicopter shot 은 아래에서 다의어로 등록)
    cm([
      ['drone flyover', '드론이 위를 날아 지나가는 항공 장면'],
      ['flyover', '위를 날아 지나가는 항공 장면'],
      ['fly through', '공간 속을 뚫고 날아가듯 지나가는 장면'],
      ['flythrough', '공간 속을 뚫고 날아가듯 지나가는 장면'],
      ['fpv drone shot', '1인칭 시점 드론의 빠르고 역동적인 비행 장면'],
      ['fpv shot', '1인칭 시점 드론의 빠르고 역동적인 비행 장면'],
      ['aerial tracking shot', '공중에서 대상을 따라가며 찍은 장면'],
      ['sweeping aerial shot', '넓은 공간을 크게 훑는 항공 장면']
    ]),
    // "camera + 동사" 문장형 표현
    cm([
      ['camera pans', '카메라가 좌우로 돌아 장면을 훑음'],
      ['camera pans left', '카메라가 왼쪽으로 돌아 장면을 훑음'],
      ['camera pans right', '카메라가 오른쪽으로 돌아 장면을 훑음'],
      ['camera tilts', '카메라가 위아래로 꺾임'],
      ['camera tilts up', '카메라가 위로 꺾여 올려다봄'],
      ['camera tilts down', '카메라가 아래로 꺾여 내려다봄'],
      ['camera zooms in', '카메라가 확대하며 대상에 다가감'],
      ['camera zooms out', '카메라가 축소하며 주변이 넓어짐'],
      ['camera pushes in', '카메라가 대상 쪽으로 밀고 들어감'],
      ['camera pulls back', '카메라가 뒤로 물러남. 주변 환경이 드러남'],
      ['camera pulls out', '카메라가 뒤로 물러남. 주변 환경이 드러남'],
      ['camera rises', '카메라가 위로 올라감'],
      ['camera descends', '카메라가 아래로 내려감'],
      ['camera orbits', '카메라가 대상 주위를 돎'],
      ['camera circles', '카메라가 대상 주위를 빙 돎'],
      ['camera rotates', '카메라가 돎'],
      ['camera follows', '카메라가 대상을 뒤따라감'],
      ['camera tracks', '카메라가 대상을 따라 이동함'],
      ['camera glides', '카메라가 미끄러지듯 부드럽게 이동함'],
      ['camera sweeps', '카메라가 넓게 휩쓸듯 이동함'],
      ['camera drifts', '카메라가 천천히 떠가듯 이동함'],
      ['camera floats', '카메라가 떠 있듯 부드럽게 이동함'],
      ['camera swoops', '카메라가 급히 날아 내려오거나 휘감듯 이동함'],
      ['camera dives', '카메라가 아래로 급강하함'],
      ['camera moves forward', '카메라가 앞으로 나아감'],
      ['camera moves backward', '카메라가 뒤로 물러남'],
      ['camera moves closer', '카메라가 대상에 가까이 다가감'],
      ['camera moves away', '카메라가 대상에서 멀어짐'],
      ['camera moves left', '카메라가 왼쪽으로 이동함'],
      ['camera moves right', '카메라가 오른쪽으로 이동함'],
      ['camera moves up', '카메라가 위로 이동함'],
      ['camera moves down', '카메라가 아래로 이동함']
    ]),
    // 그 밖의 촬영 움직임·효과
    cm([
      ['parallax', '카메라가 움직일 때 가까운 것은 빨리, 먼 것은 느리게 지나가 깊이감이 생기는 효과'],
      ['parallax effect', '카메라가 움직일 때 가까운 것은 빨리, 먼 것은 느리게 지나가 깊이감이 생기는 효과'],
      ['reveal shot', '카메라 움직임으로 대상이나 장소를 서서히 드러내는 장면'],
      ['slow reveal', '카메라 움직임으로 대상이나 장소를 천천히 드러냄'],
      ['steady camera', '흔들림 없이 안정된 카메라'],
      ['stable camera', '흔들림 없이 안정된 카메라'],
      ['locked-off shot', '삼각대 등에 고정해 움직이지 않는 장면'],
      ['fixed shot', '카메라가 고정되어 움직이지 않는 장면'],
      ['motion control shot', '컴퓨터로 제어해 같은 움직임을 정확히 반복하는 카메라 장면'],
      ['slider shot', '슬라이더 위에서 짧고 부드럽게 이동하며 찍은 장면'],
      ['cable cam', '케이블에 매달려 이동하며 찍은 장면'],
      ['moving camera', '계속 움직이는 카메라'],
      ['moving shot', '카메라가 움직이며 찍은 장면'],
      ['gliding shot', '미끄러지듯 부드럽게 이동하며 찍은 장면']
    ]),
    // 구도(시점)와 움직임 두 뜻을 가진 항공 촬영
    [
      m('aerial shot', [
        ['composition', '높은 곳에서 넓게 내려다본 항공 시점'],
        ['camera_motion', '공중에서 움직이며 찍은 장면']
      ]),
      m('helicopter shot', [
        ['composition', '헬리콥터에서 내려다본 높은 시점'],
        ['camera_motion', '헬리콥터를 타고 공중에서 이동하며 찍은 장면']
      ])
    ]
  );

  // ---- 전환/편집 (영상용) ----
  // 컷·장면 전환·합성·속도 조절 같은 편집 효과. 카메라 움직임이 아니라 편집으로 만드는 효과를 담는다.
  // "no ..." 부정형은 no 가 붙어야 지시가 되므로 따로 등록한다(등록된 표현 안의 no 에는 부정 안내가 나오지 않는다).
  function tr(pairs) {
    return pairs.map(function (p) { return t(p[0], 'transition', p[1]); });
  }
  var TRANSITION_TERMS = [].concat(
    // 컷
    tr([
      ['hard cut', '장면을 이어 붙이지 않고 곧바로 다른 장면으로 끊어 넘어감'],
      ['jump cut', '같은 장면의 시간을 건너뛰듯 끊어 붙여 화면이 툭 튀는 느낌'],
      ['match cut', '모양이나 움직임이 비슷한 두 장면을 이어 붙여 자연스럽게 넘어가는 컷'],
      ['smash cut', '조용한 장면에서 갑자기 강한 장면으로 확 끊어 넘어가는 컷'],
      ['cross cut', '서로 다른 장소의 장면을 번갈아 보여 주는 컷'],
      ['quick cut', '짧은 컷을 빠르게 이어 붙여 속도감을 주는 편집'],
      ['cutaway', '주된 장면 사이에 다른 장면을 끼워 넣는 컷']
    ]),
    // 장면 전환
    tr([
      ['dissolve', '한 장면이 서서히 사라지며 다음 장면이 겹쳐 나타나는 전환'],
      ['cross dissolve', '한 장면이 서서히 사라지며 다음 장면이 겹쳐 나타나는 전환'],
      ['cross fade', '앞 장면이 옅어지며 다음 장면이 겹쳐 나타나는 전환'],
      ['fade in', '어두운 화면에서 서서히 밝아지며 장면이 나타남'],
      ['fade out', '장면이 서서히 어두워지며 사라짐'],
      ['fade to black', '장면이 서서히 검은 화면으로 사라짐'],
      ['fade to white', '장면이 서서히 흰 화면으로 사라짐'],
      ['wipe', '새 장면이 한쪽에서 밀고 들어오며 이전 장면을 지우는 전환'],
      ['whip transition', '카메라를 휙 돌려 흐려진 화면을 이용해 다음 장면으로 넘어가는 전환'],
      ['smooth transition', '장면이 부드럽게 이어지는 전환'],
      ['seamless transition', '이음매 없이 자연스럽게 이어지는 전환']
    ]),
    // 합성·변형
    tr([
      ['double exposure', '두 장면을 겹쳐 한 화면에 비치게 합성한 효과'],
      ['split screen', '화면을 나눠 여러 장면을 동시에 보여 줌'],
      ['morph', '한 모양이나 장면이 다른 모양이나 장면으로 매끄럽게 변하는 효과'],
      ['morphing', '한 모양이나 장면이 다른 모양이나 장면으로 매끄럽게 변하는 효과']
    ]),
    // 속도·시간 효과
    tr([
      ['slow motion', '동작을 느리게 보여 주는 효과. 순간의 디테일이 강조됨'],
      ['slow-mo', '동작을 느리게 보여 주는 효과. 순간의 디테일이 강조됨'],
      ['fast motion', '동작을 빠르게 보여 주는 효과'],
      ['speed ramp', '재생 속도를 중간에 빠르게 하거나 느리게 바꾸는 효과'],
      ['time lapse', '오랜 시간을 짧게 압축해 빠르게 보여 주는 효과(구름·해의 이동 등)'],
      ['timelapse', '오랜 시간을 짧게 압축해 빠르게 보여 주는 효과(구름·해의 이동 등)'],
      ['hyperlapse', '카메라가 이동하며 찍은 타임랩스. 빠르게 지나가는 이동감'],
      ['reverse motion', '영상을 거꾸로 재생하는 효과'],
      ['freeze frame', '한 장면에서 화면을 멈춤']
    ]),
    // 부정형: 이런 편집 효과를 쓰지 말라는 지시 (no cuts → 'no cut' 으로 복수형 처리)
    tr([
      ['no cut', '컷 없이 장면이 끊기지 않고 이어지길 요구함'],
      ['no jump cut', '화면이 튀는 점프 컷 없이 이어지길 요구함'],
      ['no dissolve', '장면이 겹쳐 사라지는 전환을 쓰지 말라고 요구함'],
      ['no cross fade', '앞 장면이 옅어지며 겹치는 전환을 쓰지 말라고 요구함'],
      ['no fade', '서서히 밝아지거나 어두워지는 페이드를 쓰지 말라고 요구함'],
      ['no fade transition', '서서히 밝아지거나 어두워지는 페이드 전환을 쓰지 말라고 요구함'],
      ['no transition', '장면 전환 없이 한 장면으로 이어지길 요구함'],
      ['no double exposure', '두 장면을 겹쳐 합성하지 말라고 요구함'],
      ['no morph', '모양이 변하며 이어지는 합성 효과를 쓰지 말라고 요구함'],
      ['no morphing', '모양이 변하며 이어지는 합성 효과를 쓰지 말라고 요구함']
    ])
  );

  // ================= 사전 확장 묶음 (요소별) =================
  // 촬영·영상 용어집 기준으로 체계적으로 채운다. 설명은 번역이 아니라 결과물에 미치는 효과 중심이고,
  // 확신이 없는 설명은 쓰지 않는다. 같은 용어가 두 요소에 걸치면 m()으로 다의어로 둔다.
  function bulk(element, pairs) {
    return pairs.map(function (p) { return t(p[0], element, p[1]); });
  }
  var EXPANSION_TERMS = [];

  // ---- 카메라: 렌즈·초점·노출·촬영 장비·광학 효과 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 초점거리
    bulk('camera', [
      ['14mm', '14mm 초광각. 아주 넓게 담기고 가장자리가 휘어 보이며 공간이 과장됨'],
      ['16mm', '16mm 초광각. 넓은 공간을 담고 원근감이 과장됨'],
      ['24mm', '24mm 광각. 풍경·실내를 넓게 담고 원근감이 살아남'],
      ['28mm', '28mm 광각. 거리·다큐 사진에 흔한 약간 넓은 화각'],
      ['50mm', '50mm 표준 화각. 사람 눈에 가까운 자연스러운 원근감'],
      ['100mm', '100mm 중망원. 인물·접사에 쓰이며 배경이 부드럽게 흐려지고 압축됨'],
      ['135mm', '135mm 망원. 인물을 멀리서 담아 배경이 크게 흐려지고 압축됨'],
      ['200mm', '200mm 망원. 멀리 있는 대상을 당겨 담고 배경이 강하게 압축됨']
    ]),
    // 렌즈 종류
    bulk('camera', [
      ['wide angle lens', '광각 렌즈. 넓은 범위를 담고 원근감이 과장됨'],
      ['ultra wide angle', '초광각. 아주 넓게 담기고 가장자리가 휘어 보일 수 있음'],
      ['ultra wide', '초광각. 아주 넓게 담기고 가장자리가 휘어 보일 수 있음'],
      ['telephoto lens', '망원 렌즈. 멀리 있는 대상을 당겨 담고 배경이 압축됨'],
      ['prime lens', '단렌즈(초점거리 고정). 선명하고 배경 흐림이 좋은 사진 느낌'],
      ['zoom lens', '줌 렌즈. 초점거리를 바꿔 화각을 조절함'],
      ['macro lens', '접사 렌즈. 아주 가까이서 작은 대상의 세부를 크게 담음'],
      ['portrait lens', '인물용 렌즈. 얼굴이 자연스럽고 배경이 부드럽게 흐려짐'],
      ['standard lens', '표준 렌즈. 사람 눈에 가까운 자연스러운 화각'],
      ['fisheye lens', '어안 렌즈. 아주 넓고 둥글게 휘어 보이는 화각'],
      ['tilt shift lens', '틸트시프트 렌즈. 초점 범위를 기울여 미니어처처럼 보이게 함'],
      ['anamorphic lens', '아나모픽 렌즈. 와이드 화면과 가로로 길게 번지는 빛 효과'],
      ['vintage lens', '오래된 렌즈 같은 부드럽고 번지는 화질과 독특한 빛 번짐'],
      ['cinema lens', '영화 촬영용 렌즈. 부드러운 질감과 자연스러운 배경 흐림']
    ]),
    // 초점·조리개
    bulk('camera', [
      ['deep focus', '화면 앞뒤 전체가 선명하게 초점이 맞은 상태'],
      ['shallow focus', '초점 맞은 부분만 선명하고 앞뒤가 흐려짐'],
      ['soft focus', '초점을 일부러 부드럽게 해 몽환적으로 번져 보이는 효과'],
      ['selective focus', '일부 대상에만 초점을 맞추고 나머지는 흐리게 함'],
      ['out of focus', '초점이 맞지 않아 흐릿하게 보임'],
      ['in focus', '초점이 맞아 또렷하게 보임'],
      ['rack focus', '초점을 한 대상에서 다른 대상으로 옮겨 시선을 이끎'],
      ['focus pull', '촬영 중 초점을 앞뒤로 옮겨 시선을 이끎'],
      ['follow focus', '움직이는 대상에 맞춰 초점을 계속 따라가며 유지함'],
      ['tack sharp', '아주 또렷하게 초점이 맞은 선명함'],
      ['creamy bokeh', '배경의 빛망울이 부드럽고 매끄럽게 흐려지는 보케'],
      ['background blur', '배경이 흐려져 대상이 돋보임'],
      ['defocused', '초점을 벗어나 흐려진 상태'],
      ['focus stacking', '초점이 다른 여러 사진을 합쳐 전체를 선명하게 만든 효과'],
      ['wide aperture', '조리개를 크게 열어 배경이 흐려지고 빛이 많이 들어옴'],
      ['narrow aperture', '조리개를 좁혀 앞뒤가 모두 선명해지고 빛이 적게 들어옴'],
      ['aperture', '조리개. 빛의 양과 배경 흐림 정도를 조절함']
    ]),
    // 노출·셔터·ISO
    bulk('camera', [
      ['exposure', '노출. 사진이 얼마나 밝게 찍히는지의 정도'],
      ['overexposed', '노출 과다. 화면이 너무 밝아 밝은 부분의 디테일이 날아감'],
      ['underexposed', '노출 부족. 화면이 어두워 어두운 부분의 디테일이 묻힘'],
      ['shutter speed', '셔터 속도. 움직임을 멈춰 보이게 할지 흐르게 할지 정함'],
      ['fast shutter speed', '빠른 셔터. 움직임이 얼어붙은 듯 또렷하게 찍힘'],
      ['slow shutter speed', '느린 셔터. 움직임이 흐르듯 번지고 빛이 많이 들어옴'],
      ['high iso', '높은 ISO. 어두운 곳에서 밝게 찍히지만 거친 노이즈가 생김'],
      ['low iso', '낮은 ISO. 노이즈가 적고 깨끗한 화질'],
      ['light trails', '긴 노출로 움직이는 빛이 선으로 남는 효과(차량 불빛 등)'],
      ['star trails', '긴 노출로 별이 움직인 궤적이 선으로 남는 효과'],
      ['light painting', '긴 노출 중 빛을 움직여 허공에 그림을 그리는 효과'],
      ['high speed photography', '아주 빠른 셔터로 순간(물방울 튐 등)을 멈춘 듯 찍는 사진']
    ]),
    // 카메라·필름 종류
    bulk('camera', [
      ['dslr', 'DSLR 카메라로 찍은 듯한 선명한 사진 느낌'],
      ['mirrorless camera', '미러리스 카메라로 찍은 듯한 선명한 사진 느낌'],
      ['film camera', '필름 카메라로 찍은 듯한 입자감과 색감'],
      ['35mm film', '35mm 필름 사진 같은 입자감과 색감'],
      ['16mm film', '16mm 필름 같은 거친 입자와 옛 영화 느낌'],
      ['8mm film', '8mm 필름 같은 거칠고 흔들리는 옛 홈비디오 느낌'],
      ['super 8', 'Super 8 필름 같은 거칠고 따뜻한 옛 홈비디오 느낌'],
      ['medium format', '중형 필름·센서 같은 풍부한 디테일과 부드러운 계조'],
      ['large format', '대형 카메라 같은 매우 높은 디테일과 얕은 초점'],
      ['polaroid', '즉석사진 같은 바랜 색감과 흰 테두리'],
      ['instant camera', '즉석카메라로 찍은 듯한 부드럽고 바랜 색감'],
      ['disposable camera', '일회용 카메라 같은 거친 플래시와 거친 화질'],
      ['pinhole camera', '바늘구멍 카메라 같은 부드럽고 흐릿한 상과 긴 노출 느낌'],
      ['camcorder', '캠코더로 찍은 듯한 옛 홈비디오 느낌'],
      ['vhs', 'VHS 비디오테이프 같은 거친 화질, 색 번짐, 줄무늬'],
      ['cctv', '감시카메라 같은 낮은 화질과 고정된 높은 시점'],
      ['security camera', '보안 카메라 같은 낮은 화질과 고정된 높은 시점'],
      ['webcam', '웹캠으로 찍은 듯한 낮은 화질과 정면 시점'],
      ['action camera', '액션캠으로 찍은 듯한 광각과 역동적인 현장감'],
      ['smartphone camera', '스마트폰 카메라로 찍은 듯한 일상적인 사진 느낌'],
      ['phone camera', '휴대폰 카메라로 찍은 듯한 일상적인 사진 느낌'],
      ['point and shoot', '컴팩트 카메라로 찍은 듯한 가벼운 스냅 사진 느낌'],
      ['cinema camera', '영화용 카메라로 찍은 듯한 풍부한 색과 영화 같은 질감'],
      ['imax', 'IMAX 같은 큰 화면에 맞춘 고해상도와 웅장한 화면']
    ]),
    // 광학 효과·노이즈
    bulk('camera', [
      ['lens distortion', '렌즈 때문에 직선이 휘어 보이는 왜곡'],
      ['barrel distortion', '화면 가운데가 볼록하게 부풀어 보이는 광각 왜곡'],
      ['chromatic aberration', '색수차. 밝은 경계에 붉은·푸른 색 번짐이 생김'],
      ['anamorphic flare', '아나모픽 렌즈의 가로로 길게 번지는 푸른 빛 효과'],
      ['light leak', '필름에 빛이 새어 들어 주황·붉은 번짐이 생기는 효과'],
      ['halation', '밝은 빛 주변에 붉거나 주황빛 번짐이 생기는 필름 효과'],
      ['bloom', '밝은 부분의 빛이 주변으로 번지며 퍼지는 효과'],
      ['soft glow', '밝은 부분이 부드럽게 빛나듯 번지는 효과'],
      ['diffusion filter', '확산 필터. 빛을 부드럽게 퍼뜨려 몽환적이고 부드러운 화면'],
      ['nd filter', 'ND 필터. 빛을 줄여 밝은 곳에서도 느린 셔터나 얕은 초점을 가능하게 함'],
      ['polarizing filter', '편광 필터. 반사를 줄이고 하늘 색과 대비를 진하게 함'],
      ['sunstar', '강한 빛 둘레에 별 모양 빛줄기가 생기는 효과'],
      ['starburst', '밝은 광원에서 별처럼 사방으로 뻗는 빛줄기 효과'],
      ['lens dirt', '렌즈에 낀 얼룩이나 먼지 때문에 생기는 번짐'],
      ['water droplets on lens', '렌즈에 물방울이 맺혀 일그러지고 흐려 보이는 효과'],
      ['grainy', '입자가 거칠게 보이는 질감'],
      ['digital noise', '디지털 노이즈. 어두운 곳에서 생기는 알갱이 같은 잡음'],
      ['rolling shutter', '롤링 셔터. 빠른 움직임이 기울거나 휘어 보이는 현상'],
      ['lens blur', '렌즈 때문에 흐려지는 효과'],
      ['zoom blur', '줌 하는 동안 가운데에서 바깥으로 퍼지는 방사형 흐림']
    ]),
    // 원근 효과
    bulk('camera', [
      ['telephoto compression', '망원으로 앞뒤 거리가 눌려 대상과 배경이 가까워 보이는 효과'],
      ['perspective distortion', '원근 왜곡. 가까운 것이 커지고 먼 것이 작아져 비례가 일그러져 보임'],
      ['miniature effect', '실제 풍경이 장난감 미니어처처럼 보이는 효과'],
      ['wide angle distortion', '광각에서 가장자리 대상이 늘어나거나 휘어 보이는 왜곡']
    ]),
    // 필름·특수 촬영 느낌
    bulk('camera', [
      ['film look', '영화 필름 같은 색감과 질감'],
      ['analog film', '필름 사진 같은 입자감과 색감'],
      ['expired film', '유통기한이 지난 필름처럼 색이 바래고 변색된 느낌'],
      ['cross processing', '교차 현상. 색이 강하게 틀어지고 대비가 높아지는 필름 효과'],
      ['night vision', '야간투시 화면처럼 녹색으로 밝게 보이는 거친 화면'],
      ['thermal camera', '열화상 카메라처럼 온도를 색으로 보여 주는 화면'],
      ['infrared photography', '적외선 사진. 식물이 희게 보이고 하늘이 어두워지는 비현실적 색'],
      ['astrophotography', '별·은하를 긴 노출로 찍은 천체 사진'],
      ['macro photography', '아주 가까이서 작은 대상을 크게 찍은 접사 사진']
    ]),
    // 화면 형식
    bulk('camera', [
      ['widescreen', '가로로 넓은 화면비. 영화 같은 넓은 화면'],
      ['cinemascope', '아주 가로로 긴 영화용 와이드 화면'],
      ['letterbox', '위아래에 검은 띠가 있는 영화 같은 화면'],
      ['vertical video', '세로로 긴 영상(스마트폰 세로 화면)'],
      ['square format', '정사각형 화면'],
      ['aspect ratio', '화면의 가로세로 비율'],
      ['cinematic aspect ratio', '영화처럼 가로로 긴 화면 비율']
    ]),
    // 영상 출처 느낌
    bulk('camera', [
      ['found footage', '우연히 발견된 영상처럼 흔들리고 거친 현장감'],
      ['surveillance footage', '감시 카메라 영상 같은 낮은 화질과 고정된 시점'],
      ['body cam', '몸에 단 카메라로 찍은 듯한 1인칭 시점과 흔들림'],
      ['dash cam', '차량 블랙박스 영상 같은 광각과 낮은 화질'],
      ['home video', '가정용 캠코더 영상 같은 일상적이고 거친 느낌'],
      ['camcorder footage', '캠코더 영상 같은 옛 홈비디오 느낌'],
      ['vhs footage', 'VHS 테이프 영상 같은 거친 화질과 색 번짐'],
      ['security footage', '보안 카메라 영상 같은 낮은 화질과 고정된 시점']
    ])
  ));

  // ---- 구도: 샷 크기·시점·프레이밍·원근 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 샷 크기
    bulk('composition', [
      ['extreme wide shot', '대상이 아주 작게 보이도록 장소를 아주 넓게 담음. 규모감과 고립감'],
      ['extreme long shot', '대상이 아주 작게 보이도록 장소를 아주 넓게 담음. 규모감과 고립감'],
      ['long shot', '대상 전체와 주변 환경이 함께 보이는 먼 거리 샷'],
      ['full shot', '머리부터 발끝까지 전신이 화면에 담김'],
      ['cowboy shot', '허벅지 중간부터 위를 담은 샷. 인물의 자세와 몸짓이 보임'],
      ['american shot', '무릎 위쯤을 담은 샷(서부극에서 유래)'],
      ['medium close-up', '가슴 위쪽을 담은 샷. 표정과 상체가 함께 보임'],
      ['medium long shot', '인물을 무릎 위쯤부터 담고 주변도 조금 보이는 샷'],
      ['medium wide shot', '인물과 주변 환경을 함께 담는 중간 정도로 넓은 샷'],
      ['close shot', '대상을 가까이 담은 샷'],
      ['tight shot', '대상이 화면을 꽉 채우는 가까운 샷'],
      ['headshot', '얼굴과 어깨 정도를 담은 증명사진 같은 샷'],
      ['head and shoulders', '머리와 어깨를 담은 구도'],
      ['waist up', '허리 위를 담은 구도'],
      ['bust shot', '가슴 위를 담은 구도']
    ]),
    // 샷 종류
    bulk('composition', [
      ['insert shot', '장면 중간에 끼워 넣는 사물·세부 클로즈업'],
      ['reaction shot', '다른 인물의 말이나 사건에 반응하는 표정을 담은 샷'],
      ['master shot', '장면 전체를 한 번에 보여 주는 기준 샷'],
      ['reverse shot', '반대편에서 대상을 비추는 샷. 대화 장면에서 번갈아 씀'],
      ['over the shoulder shot', '인물의 어깨 너머로 상대를 보는 샷. 대화하는 느낌'],
      ['detail shot', '작은 부분이나 세부를 가까이 담은 샷'],
      ['macro shot', '아주 가까이서 작은 대상을 크게 담은 샷'],
      ['full body shot', '전신이 보이는 샷'],
      ['full length shot', '전신이 보이는 샷'],
      ['half body shot', '상반신이 보이는 샷'],
      ['upper body shot', '상반신이 보이는 샷'],
      ['close up shot', '대상을 가까이 크게 담은 샷'],
      ['wide angle shot', '광각으로 넓게 담은 샷'],
      ['portrait shot', '인물 사진처럼 얼굴과 상체 중심으로 담은 샷'],
      ['two shot', '두 사람을 한 화면에 담은 샷'],
      ['three shot', '세 사람을 한 화면에 담은 샷'],
      ['group shot', '여러 사람을 한 화면에 담은 샷'],
      ['crowd shot', '많은 사람이 보이는 넓은 샷']
    ]),
    // 각도·시점
    bulk('composition', [
      ["worm's-eye view", '땅바닥 가까이에서 위로 올려다보는 시점. 대상이 거대하고 위압적으로 보임'],
      ['top down view', '바로 위에서 수직으로 내려다보는 시점. 배치와 패턴이 평면처럼 보임'],
      ['top down shot', '바로 위에서 수직으로 내려다보는 시점. 배치와 패턴이 평면처럼 보임'],
      ['overhead shot', '바로 위에서 수직으로 내려다보는 시점. 배치와 패턴이 평면처럼 보임'],
      ['overhead view', '바로 위에서 수직으로 내려다보는 시점. 배치와 패턴이 평면처럼 보임'],
      ['high angle shot', '위에서 내려다본 샷. 대상이 작고 약해 보임'],
      ['low angle shot', '아래에서 올려다본 샷. 대상이 크고 강해 보임'],
      ['eye level shot', '대상의 눈높이에서 찍은 샷. 자연스럽고 중립적인 느낌'],
      ['ground level shot', '땅 높이에서 찍은 샷. 바닥의 질감과 대상이 크게 보임'],
      ['canted angle', '카메라를 기울여 수평선이 비스듬한 화면. 불안하고 긴장된 느낌'],
      ['tilted angle', '카메라가 기울어져 수평선이 비스듬한 화면'],
      ['oblique angle', '대상을 정면이 아닌 비스듬한 각도에서 담음'],
      ['point of view', '등장인물의 눈으로 보는 1인칭 시점'],
      ['pov', '등장인물의 눈으로 보는 1인칭 시점'],
      ['pov shot', '등장인물의 눈으로 보는 1인칭 시점의 샷'],
      ['first person view', '등장인물의 눈으로 보는 1인칭 시점'],
      ['first person perspective', '등장인물의 눈으로 보는 1인칭 시점'],
      ['third person view', '인물 뒤나 옆에서 인물과 주변을 함께 보는 시점'],
      ['third person perspective', '인물 뒤나 옆에서 인물과 주변을 함께 보는 시점'],
      ['side view', '대상의 옆면이 보이는 시점'],
      ['side profile', '얼굴이나 몸의 옆모습이 보이는 구도'],
      ['profile view', '얼굴이나 몸의 옆모습이 보이는 구도'],
      ['front view', '대상의 정면이 보이는 시점'],
      ['frontal view', '대상의 정면이 보이는 시점'],
      ['rear view', '대상의 뒷모습이 보이는 시점'],
      ['back view', '대상의 뒷모습이 보이는 시점'],
      ['three quarter view', '정면과 옆면의 중간(약 45도)에서 본 입체감 있는 시점'],
      ['isometric view', '위에서 비스듬히 내려다보며 원근 없이 입체로 보이는 시점'],
      ['isometric perspective', '위에서 비스듬히 내려다보며 원근 없이 입체로 보이는 시점'],
      ['orthographic view', '원근 없이 평행하게 투영한 시점. 설계도 같은 느낌'],
      ['aerial view', '높은 곳에서 넓게 내려다본 시점'],
      ['drone view', '드론이 찍은 듯 높은 곳에서 내려다본 시점'],
      ['satellite view', '위성에서 내려다본 듯한 아주 높은 시점'],
      ['selfie', '팔을 뻗어 찍은 듯한 가까운 셀프 촬영 구도'],
      ['mirror selfie', '거울에 비친 모습을 찍은 셀프 촬영 구도'],
      ['cross section view', '내부가 보이도록 단면을 잘라 보여 주는 시점'],
      ['cutaway view', '겉을 잘라 내부 구조를 드러내 보여 주는 시점'],
      ['exploded view', '부품을 펼쳐 분해해 보여 주는 시점']
    ]),
    // 프레이밍·배치
    bulk('composition', [
      ['tight framing', '대상이 화면을 꽉 채우도록 가까이 담음. 답답하거나 긴장된 느낌'],
      ['loose framing', '대상 주변에 여유 공간을 넉넉히 둠. 여유롭고 환경이 보임'],
      ['centered composition', '대상을 화면 중앙에 두는 구도'],
      ['off center', '대상을 중앙에서 벗어나게 둠. 역동적이거나 긴장감 있는 느낌'],
      ['off-center composition', '대상을 중앙에서 벗어나게 둠. 역동적이거나 긴장감 있는 느낌'],
      ['asymmetrical', '좌우가 대칭이 아닌 구도. 자연스럽고 역동적인 균형'],
      ['asymmetrical composition', '좌우가 대칭이 아닌 구도. 자연스럽고 역동적인 균형'],
      ['symmetrical composition', '좌우 대칭 구도. 안정적이고 정돈된 느낌'],
      ['diagonal composition', '대각선을 따라 대상을 배치해 역동적인 느낌'],
      ['diagonal lines', '화면을 가로지르는 대각선으로 움직임과 긴장감을 줌'],
      ['triangular composition', '삼각형 모양으로 배치해 안정감과 시선 흐름을 만듦'],
      ['golden spiral', '황금 나선을 따라 시선이 흐르도록 배치한 구도'],
      ['fibonacci spiral', '황금 나선을 따라 시선이 흐르도록 배치한 구도'],
      ['frame within a frame', '문·창 같은 틀로 대상을 한 번 더 감싸 시선을 모음'],
      ['framing', '화면 안에 대상을 담는 방식'],
      ['foreground framing', '앞쪽 사물로 대상을 둘러싸 틀을 만들어 깊이감을 줌'],
      ['natural framing', '나뭇가지·문틀 같은 자연스러운 틀로 대상을 감쌈'],
      ['layered composition', '앞·중간·뒤를 겹겹이 배치해 깊이감을 줌'],
      ['foreground element', '앞쪽에 둔 사물. 깊이감과 거리감을 줌'],
      ['balanced composition', '무게가 한쪽으로 쏠리지 않고 균형 잡힌 구도'],
      ['dynamic composition', '대각선·기울임 등으로 움직임이 느껴지는 구도'],
      ['minimal composition', '요소를 최소로 줄인 단순한 구도'],
      ['fill the frame', '대상이 화면을 가득 채움'],
      ['breathing room', '대상 주변의 여백. 답답하지 않고 여유로운 느낌'],
      ['headroom', '인물 머리 위의 여백'],
      ['lead room', '대상이 향하는 방향 앞쪽의 여백. 시선과 움직임에 여유를 줌'],
      ['copy space', '글자를 넣을 수 있게 비워 둔 여백'],
      ['left of frame', '대상이 화면 왼쪽에 놓임'],
      ['right of frame', '대상이 화면 오른쪽에 놓임'],
      ['center of frame', '대상이 화면 가운데에 놓임'],
      ['foreground', '화면 앞쪽(가까운 곳) 영역'],
      ['midground', '화면 중간 영역']
    ]),
    // 원근
    bulk('composition', [
      ['one point perspective', '소실점이 하나라 길이 화면 안쪽으로 모이는 깊이 있는 구도'],
      ['two point perspective', '소실점이 둘이라 건물 모서리가 입체적으로 보이는 구도'],
      ['three point perspective', '소실점이 셋이라 위나 아래로 극단적으로 치솟아 보이는 구도'],
      ['forced perspective', '거리를 이용해 크기를 착각하게 만드는 구도'],
      ['vanishing point', '선들이 모이는 소실점. 시선을 안쪽으로 이끎'],
      ['atmospheric perspective', '멀수록 흐리고 푸르게 보여 깊이감을 주는 표현'],
      ['foreshortening', '대상이 카메라를 향해 뻗어 짧고 크게 보이는 원근 표현'],
      ['flat perspective', '깊이감이 적은 평평한 화면'],
      ['deep perspective', '앞뒤 깊이가 강하게 느껴지는 화면']
    ]),
    // 화면 방향
    bulk('composition', [
      ['portrait orientation', '세로로 긴 화면 방향'],
      ['landscape orientation', '가로로 긴 화면 방향'],
      ['vertical composition', '세로 방향으로 구성한 구도'],
      ['horizontal composition', '가로 방향으로 구성한 구도'],
      ['panorama', '아주 넓게 이어진 파노라마 화면'],
      ['panoramic view', '아주 넓게 이어진 파노라마 화면']
    ])
  ));

  // ---- 조명: 자연광·인공 광원·방향·인물 조명·그림자·분위기 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 햇빛·하늘·시간대
    bulk('lighting', [
      ['sunlight', '햇빛. 밝고 자연스러운 빛과 뚜렷한 그림자'],
      ['direct sunlight', '직사광선. 강하고 그림자가 선명함'],
      ['harsh sunlight', '강하고 거친 햇빛. 그림자가 짙고 대비가 큼'],
      ['soft sunlight', '부드럽게 퍼진 햇빛. 그림자가 흐리고 편안한 느낌'],
      ['warm sunlight', '따뜻한 색의 햇빛. 포근하고 아늑한 느낌'],
      ['god rays', '구름·나뭇잎 사이로 빛줄기가 내리꽂히는 효과. 신비롭고 극적임'],
      ['crepuscular rays', '해 질 녘 구름 사이로 퍼지는 빛줄기'],
      ['sun rays', '해에서 뻗어 나오는 빛줄기'],
      ['sunbeams', '틈으로 들어오는 빛줄기'],
      ['dappled light', '나뭇잎 사이로 얼룩덜룩 비치는 빛과 그늘'],
      ['dappled sunlight', '나뭇잎 사이로 얼룩덜룩 비치는 햇빛과 그늘'],
      ['morning light', '아침의 맑고 부드러운 빛. 상쾌하고 차분한 느낌'],
      ['morning sun', '아침의 맑고 부드러운 햇빛'],
      ['midday sun', '한낮의 강한 빛. 그림자가 짧고 대비가 강함'],
      ['high noon', '정오의 강한 직사광. 그림자가 짧음'],
      ['afternoon light', '오후의 따뜻하고 기울어진 빛'],
      ['late afternoon light', '늦은 오후의 길고 따뜻한 빛'],
      ['evening light', '저녁의 부드럽고 따뜻한 빛'],
      ['twilight', '해가 진 직후 하늘에 남은 은은한 빛. 푸르고 차분함'],
      ['dawn light', '새벽녘의 옅고 푸르스름한 빛'],
      ['sunrise light', '해 뜰 무렵의 따뜻하고 낮게 비치는 빛'],
      ['sunset light', '해 질 무렵의 붉고 따뜻한 빛'],
      ['golden light', '금빛으로 따뜻하게 비치는 빛'],
      ['cloudy light', '흐린 날의 고르고 부드러운 빛'],
      ['window light', '창으로 들어오는 부드러운 빛. 방향이 있고 자연스러움'],
      ['light through trees', '나뭇잎 사이로 비치는 빛'],
      ['overhead sun', '머리 위에서 내리쬐는 해. 그림자가 짧고 강함'],
      ['moonlit', '달빛이 비치는 상태. 푸르스름하고 고요한 밤 분위기'],
      ['starlight', '별빛만 비치는 어둡고 고요한 밤 분위기']
    ]),
    // 빛의 색 온도
    bulk('lighting', [
      ['warm light', '따뜻한 색(주황·노랑 계열)의 빛. 포근하고 아늑한 느낌'],
      ['warm lighting', '따뜻한 색(주황·노랑 계열)의 조명. 포근하고 아늑한 느낌'],
      ['cool light', '차가운 색(푸른 계열)의 빛. 차분하거나 쓸쓸한 느낌'],
      ['cool lighting', '차가운 색(푸른 계열)의 조명. 차분하거나 쓸쓸한 느낌'],
      ['cold light', '차갑고 푸른빛이 도는 빛. 싸늘한 느낌'],
      ['tungsten light', '텅스텐 전구의 따뜻한 주황빛'],
      ['fluorescent light', '형광등의 차갑고 평평한 빛'],
      ['led light', 'LED 조명의 선명하고 차가운 빛'],
      ['colorful lighting', '여러 색이 섞인 조명'],
      ['colored lights', '여러 색의 조명'],
      ['gel lighting', '색 필름을 씌워 만든 색 조명']
    ]),
    // 불·인공 광원
    bulk('lighting', [
      ['firelight', '불꽃이 내는 따뜻하고 일렁이는 빛'],
      ['campfire light', '모닥불의 따뜻하고 일렁이는 빛'],
      ['candle light', '촛불의 따뜻하고 약한 빛'],
      ['lantern light', '등불의 은은하고 따뜻한 빛'],
      ['lamplight', '램프의 따뜻하고 아늑한 빛'],
      ['street light', '가로등 불빛. 밤거리 분위기'],
      ['flashlight', '손전등의 좁고 강한 빛'],
      ['torchlight', '횃불의 일렁이는 주황빛'],
      ['neon glow', '네온의 선명한 색으로 번지는 빛'],
      ['neon lighting', '네온 같은 선명한 색 조명'],
      ['string lights', '줄에 매단 작은 전구들이 은은하게 빛나는 장식 조명'],
      ['fairy lights', '줄에 매단 작은 전구들이 은은하게 빛나는 장식 조명'],
      ['stage lighting', '무대 조명. 강렬한 색과 빛줄기'],
      ['concert lighting', '공연장의 화려한 색 조명과 빛줄기'],
      ['laser lights', '레이저의 가늘고 선명한 빛줄기'],
      ['strobe light', '번쩍이는 섬광 조명. 순간이 멈춘 듯한 효과'],
      ['direct flash', '정면에서 터뜨린 플래시. 평평하고 강한 빛과 뒤쪽의 짙은 그림자'],
      ['on camera flash', '카메라 위에서 터뜨린 플래시. 평평하고 강한 정면 빛'],
      ['screen glow', '화면에서 나오는 푸르스름한 빛'],
      ['monitor glow', '모니터에서 나오는 푸르스름한 빛'],
      ['projector light', '영사기에서 나오는 빛줄기'],
      ['bioluminescence', '생물이 스스로 내는 푸르거나 초록빛의 은은한 빛'],
      ['glow', '은은하게 번져 빛나는 빛'],
      ['glowing', '빛을 내며 은은하게 빛나는 상태']
    ]),
    // 빛의 방향
    bulk('lighting', [
      ['backlit', '뒤에서 빛을 받아 윤곽이 빛나는 상태'],
      ['sidelit', '옆에서 빛을 받아 한쪽이 밝고 다른 쪽이 어두운 상태'],
      ['back lighting', '뒤에서 비추는 조명. 윤곽이 빛나고 앞면은 어두워지기 쉬움'],
      ['side lighting', '옆에서 비추는 조명. 질감과 입체감이 강조됨'],
      ['front lighting', '정면에서 비추는 조명. 평평하고 그림자가 적음'],
      ['top lighting', '위에서 내리비추는 조명. 눈두덩에 그늘이 생겨 극적임'],
      ['under lighting', '아래에서 올려 비추는 조명. 섬뜩하고 괴기한 느낌'],
      ['bottom lighting', '아래에서 올려 비추는 조명. 섬뜩하고 괴기한 느낌'],
      ['lit from behind', '뒤에서 빛을 받아 윤곽이 빛남'],
      ['lit from above', '위에서 빛을 받아 아래쪽에 그림자가 짐'],
      ['lit from below', '아래에서 빛을 받아 섬뜩한 느낌']
    ]),
    // 조명 구성·인물 조명
    bulk('lighting', [
      ['three point lighting', '주광·보조광·역광 3개로 입체감을 만드는 기본 조명'],
      ['key light', '주된 조명. 대상의 밝기와 방향을 정함'],
      ['fill light', '그림자를 부드럽게 채워 주는 보조 조명'],
      ['hair light', '머리카락 윤곽을 비추어 배경과 분리해 주는 보조 조명'],
      ['butterfly lighting', '얼굴 위 정면에서 비춰 코 아래에 나비 모양 그림자가 생기는 인물 조명'],
      ['rembrandt lighting', '한쪽 뺨에 삼각형 빛이 남는 고전적인 명암 인물 조명'],
      ['split lighting', '얼굴을 반으로 나눠 한쪽만 밝히는 극적인 조명'],
      ['loop lighting', '코 옆에 작은 고리 모양 그림자가 생기는 자연스러운 인물 조명'],
      ['clamshell lighting', '위아래에서 부드럽게 비춰 그림자가 거의 없는 뷰티 조명'],
      ['beauty lighting', '피부가 매끄럽게 보이도록 부드럽게 비추는 인물 조명'],
      ['softbox lighting', '소프트박스로 만든 부드럽고 고른 빛'],
      ['ring light', '링 라이트. 눈에 둥근 반사광이 생기고 그림자가 적음']
    ]),
    // 대비·그림자
    bulk('lighting', [
      ['high contrast lighting', '밝고 어두운 차이가 큰 조명'],
      ['low contrast lighting', '밝고 어두운 차이가 작은 부드러운 조명'],
      ['flat lighting', '그림자가 거의 없는 평평한 조명'],
      ['even lighting', '고르게 퍼진 조명'],
      ['soft shadows', '경계가 흐린 부드러운 그림자'],
      ['hard shadows', '경계가 선명한 짙은 그림자'],
      ['long shadows', '길게 늘어진 그림자(해가 낮을 때)'],
      ['deep shadows', '짙고 깊은 그림자'],
      ['dramatic shadows', '대비가 강한 극적인 그림자'],
      ['shadows', '그림자. 입체감과 분위기를 만듦'],
      ['silhouette', '역광으로 대상이 검은 윤곽으로만 보이는 효과'],
      ['light and shadow', '빛과 그림자의 대비'],
      ['chiaroscuro lighting', '빛과 어둠의 강한 대비로 입체감을 만드는 조명']
    ]),
    // 빛줄기·대기
    bulk('lighting', [
      ['light rays', '공기 중에 보이는 빛줄기'],
      ['light shafts', '틈으로 들어와 공기 중에 보이는 굵은 빛줄기'],
      ['volumetric lighting', '안개·먼지 속에서 빛줄기가 보이는 조명. 깊이감과 분위기'],
      ['volumetric fog', '빛을 받아 빛줄기가 보이는 안개'],
      ['atmospheric lighting', '공기와 안개 때문에 분위기가 느껴지는 조명']
    ]),
    // 분위기 조명·밝기 표현
    bulk('lighting', [
      ['moody lighting', '어둡고 감정적인 분위기를 만드는 조명'],
      ['film noir lighting', '느와르 영화 같은 강한 명암과 날카로운 그림자'],
      ['noir lighting', '느와르 영화 같은 강한 명암과 날카로운 그림자'],
      ['horror lighting', '어둡고 섬뜩한 분위기를 만드는 조명'],
      ['romantic lighting', '따뜻하고 은은한 분위기를 만드는 조명'],
      ['dim light', '어둑한 약한 빛'],
      ['dim lighting', '어둑한 약한 조명'],
      ['low light', '빛이 적은 어두운 환경'],
      ['bright light', '밝고 강한 빛'],
      ['bright lighting', '밝고 환한 조명'],
      ['harsh lighting', '거칠고 강한 조명. 짙은 그림자'],
      ['soft lighting', '부드러운 조명. 그림자가 흐림'],
      ['rim lighting', '피사체 가장자리를 따라 비추는 조명'],
      ['ambient lighting', '주변을 은은하게 채우는 조명'],
      ['natural lighting', '햇빛·창가 빛 같은 자연광'],
      ['studio light', '스튜디오에서 쓰는 인공 조명'],
      ['dramatic light', '명암 대비가 강한 극적인 빛'],
      ['well lit', '밝고 고르게 비춰진 상태'],
      ['dimly lit', '어둑하게 비춰진 상태'],
      ['brightly lit', '밝게 비춰진 상태'],
      ['softly lit', '부드럽게 비춰진 상태'],
      ['warmly lit', '따뜻한 빛으로 비춰진 상태']
    ])
  ));

  // ---- 피사체 움직임: 이동·동작·스포츠·낙하·자연 현상·변형 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 이동
    bulk('subject_motion', [
      ['jogging', '가볍게 뛰어감'],
      ['sprinting', '전속력으로 달림'],
      ['strolling', '천천히 거닐며 걸음'],
      ['wandering', '목적 없이 돌아다님'],
      ['marching', '발맞춰 행진함'],
      ['crawling', '바닥을 기어감'],
      ['climbing', '위로 기어오름'],
      ['climbing up', '위로 기어오름'],
      ['climbing down', '아래로 기어 내려옴'],
      ['swimming', '헤엄침'],
      ['diving', '물속이나 아래로 뛰어듦'],
      ['skipping', '깡충깡충 뛰며 감'],
      ['hopping', '폴짝폴짝 뜀'],
      ['leaping', '크게 도약함'],
      ['dashing', '쏜살같이 달림'],
      ['racing', '빠르게 질주함'],
      ['charging', '앞으로 돌진함'],
      ['chasing', '뒤쫓음'],
      ['fleeing', '도망침'],
      ['cycling', '자전거를 탐'],
      ['riding', '탈것이나 동물을 타고 이동함'],
      ['rowing', '노를 저음'],
      ['surfing', '파도를 타고 미끄러짐']
    ]),
    // 몸짓·표정·일상 동작
    bulk('subject_motion', [
      ['waving', '손을 흔듦'],
      ['pointing', '손가락으로 가리킴'],
      ['nodding', '고개를 끄덕임'],
      ['shaking head', '고개를 저음'],
      ['clapping', '박수를 침'],
      ['hugging', '서로 껴안음'],
      ['smiling', '미소 지음'],
      ['laughing', '소리 내어 웃음'],
      ['crying', '울고 있음'],
      ['blinking', '눈을 깜빡임'],
      ['stretching', '몸을 쭉 늘임'],
      ['sitting down', '자리에 앉음'],
      ['standing up', '자리에서 일어섬'],
      ['turning around', '몸을 돌려 뒤돌아봄'],
      ['looking back', '뒤를 돌아봄'],
      ['staring', '뚫어지게 쳐다봄'],
      ['reaching', '손을 뻗음'],
      ['throwing', '던짐'],
      ['pushing', '밀어냄'],
      ['pulling', '잡아당김'],
      ['lifting', '들어 올림'],
      ['pouring', '액체를 따름'],
      ['cooking', '요리함'],
      ['drinking', '마시고 있음'],
      ['reading', '책이나 글을 읽음']
    ]),
    // 스포츠·곡예
    bulk('subject_motion', [
      ['flipping', '공중에서 뒤집힘'],
      ['somersault', '공중제비. 몸을 둥글게 말아 한 바퀴 돎'],
      ['backflip', '뒤로 한 바퀴 도는 공중제비'],
      ['cartwheel', '옆으로 손을 짚고 도는 재주넘기'],
      ['kicking', '발로 참'],
      ['punching', '주먹으로 침'],
      ['fighting', '서로 싸움'],
      ['boxing', '권투를 함'],
      ['wrestling', '맞붙어 씨름하거나 레슬링을 함'],
      ['swinging', '그네처럼 앞뒤로 흔들림'],
      ['twirling', '빙글빙글 돎'],
      ['tumbling', '구르며 넘어짐']
    ]),
    // 비행·낙하·부유
    bulk('subject_motion', [
      ['soaring', '높이 날아오름'],
      ['gliding', '미끄러지듯 날거나 이동함'],
      ['hovering', '공중에 멈춘 듯 떠 있음'],
      ['falling', '아래로 떨어짐'],
      ['plunging', '곤두박질치듯 떨어짐'],
      ['sinking', '아래로 가라앉음'],
      ['rising', '위로 떠오름'],
      ['ascending', '위로 올라감'],
      ['drifting', '천천히 떠다님'],
      ['bouncing', '튀어 오르내림'],
      ['rolling', '굴러감'],
      ['sliding', '미끄러져 움직임'],
      ['swaying', '좌우로 살랑살랑 흔들림'],
      ['rocking', '앞뒤로 흔들림']
    ]),
    // 떨림·깜빡임·물결
    bulk('subject_motion', [
      ['vibrating', '빠르게 떨림'],
      ['shaking', '흔들림'],
      ['trembling', '가늘게 떨림'],
      ['pulsing', '규칙적으로 커졌다 작아졌다 하며 빛남'],
      ['flickering', '불빛이 깜빡거림'],
      ['flashing', '번쩍번쩍 빛남'],
      ['twinkling', '별처럼 반짝거림'],
      ['sparkling', '반짝반짝 빛남'],
      ['shimmering', '희미하게 일렁이며 빛남'],
      ['rippling', '물결처럼 일렁임'],
      ['flowing', '부드럽게 흘러감'],
      ['splashing', '물이 튐'],
      ['dripping', '방울져 떨어짐'],
      ['swirling', '소용돌이치며 돎'],
      ['billowing', '부풀어 오르며 일렁임'],
      ['fluttering', '가볍게 파닥이거나 펄럭임'],
      ['flapping', '펄럭이거나 퍼덕임'],
      ['blowing in the wind', '바람에 날림'],
      ['swaying in the wind', '바람에 흔들림']
    ]),
    // 자연 현상·사물의 움직임
    bulk('subject_motion', [
      ['falling rain', '비가 내림'],
      ['falling snow', '눈이 내림'],
      ['falling leaves', '나뭇잎이 떨어짐'],
      ['drifting clouds', '구름이 천천히 흘러감'],
      ['moving clouds', '구름이 움직임'],
      ['rolling waves', '파도가 밀려옴'],
      ['crashing waves', '파도가 부서짐'],
      ['flowing water', '물이 흐름'],
      ['rippling water', '물결이 일렁임'],
      ['swaying grass', '풀이 흔들림'],
      ['swaying trees', '나무가 흔들림'],
      ['blowing hair', '머리카락이 바람에 날림'],
      ['flowing hair', '머리카락이 부드럽게 흩날림'],
      ['flowing dress', '드레스 자락이 부드럽게 흩날림'],
      ['fluttering fabric', '천이 펄럭임'],
      ['billowing smoke', '연기가 피어오르며 퍼짐'],
      ['rising smoke', '연기가 위로 피어오름'],
      ['drifting smoke', '연기가 천천히 떠다님'],
      ['floating particles', '입자가 공중에 떠다님'],
      ['floating dust', '먼지가 공중에 떠다님'],
      ['embers rising', '불씨가 위로 날아오름'],
      ['flickering flames', '불꽃이 일렁이며 깜빡임'],
      ['sparkling particles', '반짝이는 입자들이 흩날림'],
      ['flying debris', '파편이 날아다님']
    ]),
    // 기계적 움직임·변형
    bulk('subject_motion', [
      ['spinning wheels', '바퀴가 빙글빙글 돎'],
      ['turning gears', '톱니바퀴가 맞물려 돎'],
      ['rolling wheels', '바퀴가 굴러감'],
      ['unfolding', '접힌 것이 펼쳐짐'],
      ['transforming', '다른 모습으로 변하는 중'],
      ['expanding', '점점 커짐'],
      ['shrinking', '점점 작아짐'],
      ['growing', '점점 자라남'],
      ['blooming', '꽃이 피어남'],
      ['melting', '녹아내림'],
      ['burning', '불에 타오름'],
      ['shattering', '산산이 부서짐'],
      ['pulsating', '규칙적으로 커졌다 작아졌다 함']
    ]),
    // 신체 부위·움직임의 성격
    bulk('subject_motion', [
      ['body movement', '몸 전체의 움직임'],
      ['facial movement', '얼굴 근육과 표정의 움직임'],
      ['hand movement', '손의 움직임'],
      ['eye movement', '눈동자의 움직임'],
      ['head movement', '머리의 움직임'],
      ['breathing', '숨 쉬며 몸이 미세하게 오르내림'],
      ['idle animation', '가만히 있을 때의 작은 움직임(숨 쉬기, 몸 흔들림 등)'],
      ['walk cycle', '걷는 동작이 반복되는 움직임'],
      ['run cycle', '달리는 동작이 반복되는 움직임'],
      ['mechanical motion', '기계처럼 일정하고 딱딱한 움직임'],
      ['robotic movement', '로봇처럼 끊어지고 정확한 움직임'],
      ['jerky movement', '뚝뚝 끊기는 어색한 움직임'],
      ['graceful movement', '우아하고 부드러운 움직임'],
      ['fluid movement', '막힘 없이 매끄럽게 이어지는 움직임']
    ])
  ));

  // ---- 색: 색 이름·팔레트·색보정 느낌 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 색 이름(패턴 규칙 P4가 다루지 않는 이름과 합성 색 이름)
    bulk('color', [
      ['gold', '금색'],
      ['silver', '은색'],
      ['bronze', '청동색(붉은빛 도는 갈색)'],
      ['copper', '구리색(붉은빛 도는 주황 갈색)'],
      ['cream', '크림색(옅은 노란빛 흰색)'],
      ['taupe', '회색빛 도는 갈색'],
      ['charcoal', '짙은 회색'],
      ['slate', '푸른빛 도는 회색'],
      ['navy blue', '남색(짙은 파랑)'],
      ['royal blue', '선명하고 진한 파랑'],
      ['sky blue', '하늘색'],
      ['baby blue', '연한 하늘색'],
      ['cobalt blue', '선명한 코발트 파랑'],
      ['emerald green', '에메랄드빛 녹색'],
      ['forest green', '숲처럼 짙은 녹색'],
      ['sage green', '회색빛 도는 옅은 녹색'],
      ['mint green', '연한 청록빛 녹색'],
      ['lime green', '밝은 연두색'],
      ['neon green', '형광빛 연두색'],
      ['hot pink', '진하고 선명한 분홍'],
      ['baby pink', '연한 분홍'],
      ['blush pink', '살짝 붉은 기가 도는 연분홍'],
      ['ruby red', '짙고 선명한 보석 같은 붉은색'],
      ['blood red', '피 같은 짙은 붉은색'],
      ['cherry red', '체리처럼 선명한 붉은색'],
      ['brick red', '벽돌 같은 붉은 갈색'],
      ['rust', '녹슨 쇠 같은 붉은 갈색'],
      ['terracotta', '붉은 갈색 점토색'],
      ['mustard yellow', '탁한 겨자색 노랑'],
      ['lemon yellow', '밝고 산뜻한 레몬 노랑'],
      ['golden yellow', '금빛이 도는 노랑'],
      ['burnt orange', '탄 듯한 짙은 주황'],
      ['apricot', '살구색'],
      ['caramel', '캐러멜 같은 갈색'],
      ['coffee brown', '커피색 갈색'],
      ['chestnut brown', '밤색'],
      ['jet black', '윤기 나는 새까만색'],
      ['pure white', '순백색'],
      ['off white', '살짝 누런 기가 도는 흰색'],
      ['neon pink', '형광빛 분홍'],
      ['neon blue', '형광빛 파랑']
    ]),
    // 팔레트·배색
    bulk('color', [
      ['color palette', '화면에 쓰인 색의 조합'],
      ['color scheme', '색의 조합(배색)'],
      ['color grading', '후반 작업으로 색감을 다듬은 느낌'],
      ['color grade', '후반 작업으로 색감을 다듬음'],
      ['color correction', '촬영된 색을 바로잡는 보정'],
      ['color harmony', '색들이 조화롭게 어울림'],
      ['monochromatic', '한 색의 밝기와 채도만 달리한 구성'],
      ['monochromatic palette', '한 색의 밝기와 채도만 달리한 팔레트'],
      ['triadic colors', '색상환에서 삼각형으로 떨어진 세 색의 조합'],
      ['split complementary', '보색 양옆의 색을 섞은 조합'],
      ['analogous palette', '색상환에서 이웃한 색으로 이룬 팔레트'],
      ['complementary palette', '보색 조합으로 이룬 팔레트'],
      ['warm palette', '따뜻한 색 위주의 팔레트'],
      ['cool palette', '차가운 색 위주의 팔레트'],
      ['pastel palette', '연하고 부드러운 파스텔 색 팔레트'],
      ['earthy palette', '흙·나무 같은 자연색 팔레트'],
      ['neutral colors', '회색·베이지처럼 채도 낮은 중립색'],
      ['neutral tones', '회색·베이지처럼 채도 낮은 중립색'],
      ['muted colors', '채도 낮은 차분한 색들'],
      ['muted palette', '채도 낮은 차분한 색 팔레트'],
      ['vibrant colors', '선명하고 채도 높은 색들'],
      ['vivid colors', '선명하고 생생한 색들'],
      ['bold colors', '강렬하고 대담한 색'],
      ['bright colors', '밝고 환한 색'],
      ['dark colors', '어둡고 깊은 색'],
      ['light colors', '밝고 옅은 색'],
      ['soft colors', '부드럽고 옅은 색'],
      ['warm colors', '따뜻한 계열(빨강·주황·노랑)의 색들'],
      ['cool colors', '차가운 계열(파랑·청록·보라)의 색들'],
      ['natural colors', '꾸미지 않은 자연스러운 색'],
      ['realistic colors', '현실과 가까운 색'],
      ['limited palette', '색 수를 제한한 팔레트']
    ]),
    // 색보정·분위기 색
    bulk('color', [
      ['orange and teal', '주황과 청록의 대비 조합(영화 색보정에서 흔함)'],
      ['bleach bypass', '채도가 낮고 대비가 높은 거친 영화 색보정'],
      ['faded colors', '색이 바래 옅어진 느낌'],
      ['washed out colors', '색이 빠져 흐릿해진 느낌'],
      ['washed out', '색이 빠져 흐릿해진 상태'],
      ['oversaturated', '채도가 지나치게 높은 상태'],
      ['high saturation', '채도가 높아 색이 진함'],
      ['low saturation', '채도가 낮아 색이 옅음'],
      ['crushed blacks', '어두운 부분이 뭉개져 검게 보임'],
      ['lifted blacks', '검정이 떠올라 흐릿한 필름 느낌'],
      ['blown highlights', '밝은 부분이 하얗게 날아감'],
      ['deep blacks', '깊고 진한 검정'],
      ['bright whites', '밝고 선명한 흰색'],
      ['cinematic color grading', '영화 같은 색감 보정'],
      ['moody colors', '어둡고 감정적인 분위기의 색'],
      ['golden tones', '금빛 색조'],
      ['blue tones', '푸른 색조'],
      ['orange tones', '주황빛 색조'],
      ['sepia tones', '갈색빛으로 바랜 옛 사진 색조'],
      ['neon colors', '형광처럼 선명한 색'],
      ['neon palette', '네온 색 위주의 팔레트'],
      ['cyberpunk colors', '분홍·청록 네온이 어우러진 색'],
      ['synthwave colors', '보라·분홍·청록 네온의 레트로 색'],
      ['vaporwave colors', '파스텔 분홍·청록의 몽환적인 레트로 색'],
      ['holographic', '무지갯빛으로 반짝이는 홀로그램 색'],
      ['pearlescent', '진주처럼 은은히 번지는 광택 색'],
      ['jewel tones', '보석처럼 짙고 선명한 색'],
      ['earthy colors', '흙·나무 같은 자연의 색'],
      ['autumn colors', '가을 단풍의 주황·갈색 계열'],
      ['winter colors', '차가운 푸른빛과 흰색 계열'],
      ['sunset colors', '노을빛 주황·분홍·보라'],
      ['ocean colors', '바다의 푸른·청록 계열'],
      ['forest colors', '숲의 짙은 초록·갈색 계열']
    ])
  ));

  // ---- 품질/해상도: 해상도·선명도·품질 관용 표현·렌더링 용어·부정형 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    bulk('quality', [
      ['hd', 'HD(고화질). 선명한 화질을 요구'],
      ['full hd', '풀HD(1920×1080) 해상도'],
      ['1080p', '1080p 해상도(풀HD). 선명한 화질을 요구'],
      ['1440p', '1440p 해상도(QHD)'],
      ['2k', '2K 해상도(가로 약 2000픽셀)'],
      ['16k', '16K 해상도. 매우 높은 화질을 요구(실제 출력은 도구에 따라 다름)'],
      ['4k resolution', '4K 해상도를 요구함'],
      ['8k resolution', '8K 해상도를 요구함'],
      ['uhd', 'UHD(초고화질). 4K 이상의 선명한 화질'],
      ['ultra high resolution', '아주 높은 해상도를 요구함'],
      ['high definition', '고화질(HD)'],
      ['low resolution', '낮은 해상도. 뭉개지고 거친 화질'],
      ['low res', '낮은 해상도. 뭉개지고 거친 화질']
    ]),
    // 화질 결함 표현
    bulk('quality', [
      ['pixelated', '픽셀이 깨져 네모난 알갱이가 보이는 화질'],
      ['blurry', '흐릿하게 뭉개진 화질'],
      ['jpeg artifacts', '압축 때문에 생기는 네모난 얼룩과 깨짐'],
      ['artifacts', '생성이나 압축 과정에서 생기는 이상한 흔적']
    ]),
    // 세부·선명도
    bulk('quality', [
      ['intricate', '정교하고 복잡하게 세부가 얽힌'],
      ['fine detail', '섬세한 세부 묘사'],
      ['crisp details', '또렷하고 깔끔한 세부'],
      ['crisp', '또렷하고 깔끔한 선명함'],
      ['sharp details', '또렷한 세부 묘사'],
      ['clarity', '맑고 또렷한 선명도'],
      ['crystal clear', '아주 맑고 또렷한 화질'],
      ['razor sharp', '면도날처럼 아주 또렷하게 선명함'],
      ['high detail', '세부가 풍부함'],
      ['detailed textures', '질감 표현이 세밀함']
    ]),
    // 품질 관용 표현(구체적 효과는 모델 해석에 따름)
    bulk('quality', [
      ['best quality', '가장 높은 품질을 요구하는 관용 표현. 구체적인 효과는 모델 해석에 따름'],
      ['top quality', '가장 높은 품질을 요구하는 관용 표현. 구체적인 효과는 모델 해석에 따름'],
      ['highest quality', '가장 높은 품질을 요구하는 관용 표현. 구체적인 효과는 모델 해석에 따름'],
      ['premium quality', '고급스러운 품질을 요구하는 표현'],
      ['professional quality', '전문가 수준의 품질을 요구하는 표현'],
      ['studio quality', '스튜디오에서 찍은 듯한 깔끔한 품질'],
      ['cinematic quality', '영화 같은 완성도를 요구하는 표현'],
      ['film quality', '필름 영화 같은 질감과 완성도'],
      ['flawless', '흠 없이 완벽하게 매끈함'],
      ['polished', '다듬어져 매끈하고 완성도 높음']
    ]),
    // 렌더링 기법
    bulk('quality', [
      ['ray tracing', '빛의 반사와 그림자를 정확히 계산한 사실적인 렌더링'],
      ['path tracing', '빛의 경로를 정밀하게 계산한 사실적인 렌더링'],
      ['global illumination', '빛이 주변에 반사되어 퍼지는 간접광을 반영한 렌더링'],
      ['subsurface scattering', '피부·왁스처럼 빛이 안으로 스며 퍼지는 반투명한 질감 표현'],
      ['ambient occlusion', '맞닿은 틈이나 구석에 생기는 은은한 그림자 표현'],
      ['physically based rendering', '실제 물질의 빛 반응을 따른 사실적인 질감 렌더링']
    ]),
    // 영상 품질
    bulk('quality', [
      ['high frame rate', '프레임이 많아 움직임이 아주 부드러움'],
      ['temporal consistency', '시간이 지나도 모습이 흔들리지 않고 일관되게 유지됨'],
      ['flicker free', '깜빡임 없이 안정된 화면']
    ]),
    // 부정형 품질 지시
    bulk('quality', [
      ['no blur', '흐림 없이 선명하길 요구함'],
      ['no noise', '노이즈 없이 깨끗하길 요구함'],
      ['no artifacts', '이상한 흔적 없이 깨끗하길 요구함'],
      ['no distortion', '모양이 일그러지지 않길 요구함'],
      ['no deformation', '모양이 변형되지 않고 유지되길 요구함'],
      ['no warping', '모양이 휘거나 뒤틀리지 않길 요구함'],
      ['no flicker', '깜빡임 없이 안정되길 요구함'],
      ['no watermark', '워터마크가 없길 요구함'],
      ['no text overlay', '화면 위에 덧씌운 글자가 없길 요구함'],
      ['no logo', '로고가 없길 요구함']
    ]),
    // blurry 가 사전 용어가 되면서 갈라지는 배경 흐림 표현(카메라 효과)
    bulk('camera', [
      ['blurry background', '배경이 흐려져 대상이 돋보임'],
      ['blurred background', '배경이 흐려져 대상이 돋보임']
    ])
  ));

  // ---- 가중치/수식어: 강도·정도·수량 표현 (뒤따르는 말의 정도를 조절) ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 강하게
    bulk('intensity', [
      ['insanely', '말도 안 될 만큼 매우'],
      ['absurdly', '터무니없을 만큼 매우'],
      ['immensely', '엄청나게'],
      ['enormously', '거대하게, 엄청나게'],
      ['tremendously', '굉장히'],
      ['deeply', '깊이, 매우'],
      ['utterly', '완전히'],
      ['completely', '완전히'],
      ['totally', '전적으로'],
      ['perfectly', '완벽하게'],
      ['truly', '정말로'],
      ['especially', '특히'],
      ['particularly', '특히'],
      ['extraordinarily', '비범할 만큼'],
      ['extra', '더, 한층'],
      ['intense', '강렬한'],
      ['dramatic', '극적으로 강한'],
      ['more', '더'],
      ['much more', '훨씬 더']
    ]),
    // 약하게
    bulk('intensity', [
      ['barely', '거의 ~하지 않을 만큼'],
      ['faintly', '희미하게'],
      ['gently', '부드럽게, 약하게'],
      ['lightly', '가볍게, 약하게'],
      ['a little', '조금'],
      ['a bit', '약간'],
      ['a little bit', '조금'],
      ['subtly', '은은하게'],
      ['delicately', '섬세하게, 연하게'],
      ['a hint of', '살짝 느껴질 정도의'],
      ['a touch of', '아주 조금 가미한'],
      ['mild', '약한, 순한'],
      ['less', '덜']
    ]),
    // 수량·밀도
    bulk('intensity', [
      ['many', '많은'],
      ['lots of', '많은'],
      ['a lot of', '많은'],
      ['countless', '셀 수 없이 많은'],
      ['numerous', '수많은'],
      ['several', '여러 개의'],
      ['a few', '몇 개의'],
      ['dense', '빽빽하고 조밀한'],
      ['sparse', '듬성듬성한']
    ])
  ));

  // ---- 배경/장소: 자연·도시·실내·SF/판타지·무대 배경·날씨와 시간 ----
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 자연
    bulk('setting', [
      ['mountain', '산'],
      ['mountain range', '산맥. 겹겹이 이어진 산줄기'],
      ['snowy mountain', '눈 덮인 산'],
      ['valley', '산 사이의 골짜기'],
      ['canyon', '깊게 파인 협곡'],
      ['desert', '사막. 건조하고 광활한 모래땅'],
      ['sand dune', '바람이 만든 모래 언덕'],
      ['savanna', '사바나. 드문드문 나무가 선 넓은 초원'],
      ['jungle', '정글. 울창하고 습한 밀림'],
      ['rainforest', '열대우림. 키 큰 나무가 빽빽한 습한 숲'],
      ['meadow', '풀과 꽃이 우거진 초원'],
      ['field', '탁 트인 들판'],
      ['grassland', '풀로 덮인 넓은 초원'],
      ['glacier', '빙하. 얼음이 천천히 흐르는 거대한 얼음 지형'],
      ['volcano', '화산'],
      ['cave', '동굴'],
      ['waterfall', '폭포'],
      ['river', '강'],
      ['lake', '호수'],
      ['pond', '연못'],
      ['ocean', '넓은 바다(대양)'],
      ['sea', '바다'],
      ['coast', '해안'],
      ['cliff', '절벽'],
      ['island', '섬'],
      ['tropical island', '야자수와 맑은 바다가 있는 열대 섬'],
      ['swamp', '늪. 물이 고인 습한 땅'],
      ['hillside', '언덕이나 산의 비탈면'],
      ['hill', '낮은 언덕'],
      ['seaside', '바닷가'],
      ['forest path', '숲속으로 난 길'],
      ['bamboo forest', '대나무 숲'],
      ['autumn forest', '단풍 든 가을 숲'],
      ['enchanted forest', '신비로운 마법의 숲'],
      ['misty forest', '안개가 낀 숲'],
      ['dense forest', '나무가 빽빽한 숲'],
      ['flower field', '꽃이 가득 핀 꽃밭'],
      ['rice field', '논. 물이 찬 푸른 논'],
      ['garden', '정원'],
      ['park', '공원'],
      ['countryside', '시골 풍경. 들판과 마을이 이어진 곳'],
      ['sky', '하늘']
    ]),
    // 도시·야외 시설
    bulk('setting', [
      ['city', '도시'],
      ['downtown', '건물이 모여 있는 도심'],
      ['skyline', '건물 윤곽이 하늘과 맞닿은 도시 전경'],
      ['skyscraper', '하늘로 치솟은 고층 빌딩'],
      ['alley', '건물 사이의 좁은 골목'],
      ['street', '거리'],
      ['highway', '고속도로'],
      ['bridge', '다리'],
      ['subway station', '지하철역'],
      ['train station', '기차역'],
      ['airport', '공항'],
      ['harbor', '배가 정박한 항구'],
      ['port', '화물선이 드나드는 항만'],
      ['market', '시장. 사람과 물건이 북적이는 곳'],
      ['plaza', '넓은 광장'],
      ['rooftop', '건물 옥상'],
      ['neighborhood', '주택가 동네'],
      ['village', '작은 마을'],
      ['small town', '작은 도시'],
      ['factory', '공장'],
      ['warehouse', '넓은 창고'],
      ['country road', '시골길'],
      ['dirt road', '비포장 흙길']
    ]),
    // 실내·건물
    bulk('setting', [
      ['living room', '거실'],
      ['bedroom', '침실'],
      ['kitchen', '부엌'],
      ['bathroom', '욕실'],
      ['office', '사무실'],
      ['classroom', '교실'],
      ['library', '책이 가득한 도서관'],
      ['hospital', '병원'],
      ['laboratory', '실험실'],
      ['museum', '박물관'],
      ['theater', '극장'],
      ['cinema', '영화관'],
      ['stage', '공연 무대'],
      ['gym', '체육관'],
      ['church', '교회'],
      ['cathedral', '웅장한 대성당'],
      ['temple', '사원이나 절'],
      ['castle', '성'],
      ['palace', '궁전'],
      ['cabin', '숲속의 통나무집'],
      ['lighthouse', '등대'],
      ['tower', '높은 탑'],
      ['ruins', '무너진 건물의 폐허'],
      ['cafe', '카페'],
      ['restaurant', '식당']
    ]),
    // SF·판타지·특수 환경
    bulk('setting', [
      ['spaceship interior', '우주선 내부'],
      ['space station', '우주 정거장'],
      ['alien planet', '낯선 외계 행성'],
      ['moon surface', '달 표면'],
      ['outer space', '별이 떠 있는 우주 공간'],
      ['galaxy', '수많은 별이 모인 은하'],
      ['wasteland', '황무지'],
      ['medieval village', '중세 마을'],
      ['dungeon', '어둡고 축축한 던전(지하 감옥)'],
      ['underwater', '물속'],
      ['coral reef', '산호초'],
      ['deep sea', '빛이 닿지 않는 깊은 바다'],
      ['floating islands', '하늘에 떠 있는 섬들']
    ]),
    // 무대 배경
    bulk('setting', [
      ['white background', '흰색 배경. 대상이 깔끔하게 돋보임'],
      ['black background', '검은색 배경. 대상이 극적으로 돋보임'],
      ['gradient background', '색이 서서히 변하는 배경'],
      ['studio backdrop', '스튜디오 배경천'],
      ['green screen', '크로마키용 초록색 배경'],
      ['transparent background', '배경이 투명한 상태'],
      ['seamless backdrop', '이음매 없이 이어진 단색 배경']
    ]),
    // 날씨·시간·하늘
    bulk('setting', [
      ['rainy day', '비 오는 날'],
      ['rain', '비. 젖은 바닥과 우울하거나 차분한 분위기'],
      ['snowy', '눈이 내리거나 쌓인'],
      ['foggy', '안개가 낀'],
      ['misty', '옅은 안개가 낀'],
      ['stormy', '폭풍우가 치는'],
      ['thunderstorm', '천둥 번개가 치는 폭풍'],
      ['rainbow', '무지개'],
      ['night sky', '밤하늘'],
      ['starry sky', '별이 가득한 하늘'],
      ['milky way', '은하수'],
      ['aurora', '밤하늘에 일렁이는 오로라'],
      ['northern lights', '북극광(오로라)'],
      ['blue sky', '맑은 파란 하늘'],
      ['cloudy sky', '구름 낀 하늘'],
      ['sunset sky', '노을 진 하늘'],
      ['dramatic sky', '구름이 극적으로 펼쳐진 하늘'],
      ['dusk', '해가 진 직후의 어스름한 때'],
      ['dawn', '날이 밝아 오는 새벽'],
      ['sunset', '해 질 녘'],
      ['sunrise', '해 뜰 녘'],
      ['winter', '겨울. 춥고 쓸쓸하거나 고요한 계절'],
      ['autumn', '가을. 단풍과 쌀쌀한 공기']
    ]),
    [
      m('snow', [
        ['setting', '눈이 내리거나 쌓인 환경'],
        ['color', '눈처럼 하얀 색']
      ]),
      // 장소 이름이면서 분위기(스타일)를 가리키는 표현은 두 의미를 모두 둔다.
      m('futuristic city', [
        ['setting', '미래적인 도시'],
        ['style', '미래적인 분위기']
      ]),
      m('cyberpunk city', [
        ['setting', '네온과 고층 빌딩이 빽빽한 도시'],
        ['style', '어두운 미래 도시와 네온의 사이버펑크 분위기']
      ]),
      m('post apocalyptic', [
        ['setting', '종말 이후의 황폐한 세계'],
        ['style', '문명이 무너진 뒤의 거칠고 황량한 분위기']
      ])
    ]
  ));

  // ---- 스타일: 매체·미술 사조·사진/영화 장르·렌더링 느낌 ----
  // 화가 이름·브랜드·특정 작품 이름은 넣지 않는다. "~style" 로 끝나는 표현을 묶는 규칙은 나중에 따로 정한다.
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 매체·기법·그림체
    bulk('style', [
      ['acrylic painting', '아크릴 물감 그림. 선명하고 불투명한 색과 매끈한 면'],
      ['gouache', '과슈. 불투명한 물감으로 칠한 평평하고 선명한 그림'],
      ['ink drawing', '잉크로 그린 선 중심의 그림'],
      ['pen and ink', '펜과 잉크로 그린 정교한 선 그림'],
      ['charcoal drawing', '목탄으로 그린 거칠고 짙은 명암의 그림'],
      ['pencil drawing', '연필로 그린 부드러운 선과 명암'],
      ['colored pencil', '색연필로 그린 부드러운 결의 그림'],
      ['pastel drawing', '파스텔로 그린 부드럽고 분필 같은 질감'],
      ['crayon drawing', '크레용으로 그린 아이 그림 같은 거친 질감'],
      ['digital painting', '디지털로 그린 그림. 매끈하고 풍부한 색'],
      ['digital art', '컴퓨터로 만든 그림이나 이미지'],
      ['concept art', '영화·게임의 분위기를 보여 주는 설정 일러스트'],
      ['matte painting', '영화 배경으로 그린 사실적이고 웅장한 풍경화'],
      ['airbrush', '에어브러시로 분사한 듯 매끄럽게 번지는 색'],
      ['stained glass', '색유리 조각을 이어 붙인 듯한 선명하고 투명한 색'],
      ['collage', '여러 조각을 오려 붙인 듯한 구성'],
      ['papercut', '종이를 오려 겹친 듯한 입체적인 평면'],
      ['claymation', '점토 인형을 한 컷씩 움직여 만든 느낌'],
      ['stop motion', '한 컷씩 조금씩 움직여 찍어 약간 끊기는 독특한 움직임'],
      ['low poly', '적은 수의 면으로 이루어진 각진 3D 느낌'],
      ['voxel art', '작은 정육면체를 쌓아 만든 3D 느낌'],
      ['vector art', '선명한 경계와 평평한 색면의 벡터 그래픽'],
      ['flat design', '입체감 없이 단순한 도형과 색면으로 이루어진 디자인'],
      ['line art', '선만으로 그린 단순한 그림'],
      ['comic book', '만화책 같은 굵은 윤곽선과 선명한 색'],
      ['manga', '일본 만화 같은 선과 흑백 톤'],
      ['webtoon', '웹툰 같은 만화 그림체'],
      ['cartoon', '단순하고 과장된 만화 그림체'],
      ['storybook illustration', '동화책 삽화 같은 따뜻하고 부드러운 그림'],
      ['graphic novel', '진지한 분위기의 만화 소설 그림체'],
      ['illustration', '삽화·일러스트 같은 그림'],
      ['hand drawn', '손으로 그린 듯한 선과 질감'],
      ['hand painted', '손으로 칠한 듯한 붓 자국과 색'],
      ['ink wash painting', '먹물의 번짐과 농담으로 그린 동양화 느낌'],
      ['sumi e', '먹으로 그린 일본식 수묵화'],
      ['impasto', '물감을 두껍게 발라 붓 자국이 도드라지는 질감'],
      ['pointillism', '작은 점을 찍어 색을 쌓는 점묘화']
    ]),
    // 미술 사조·미학
    bulk('style', [
      ['impressionism', '빛과 순간의 인상을 거친 붓터치로 담은 인상주의'],
      ['expressionism', '감정을 강하게 왜곡해 표현한 표현주의'],
      ['surrealism', '꿈처럼 비현실적인 조합을 그린 초현실주의'],
      ['cubism', '대상을 여러 각도의 도형으로 쪼갠 입체주의'],
      ['pop art', '대중문화 이미지를 선명한 색으로 쓴 팝아트'],
      ['art deco', '기하학적 무늬와 금속 장식이 화려한 아르 데코'],
      ['art nouveau', '식물 곡선이 흐르는 장식적인 아르 누보'],
      ['baroque', '강한 명암과 화려한 장식의 바로크'],
      ['renaissance', '균형 잡힌 구도와 사실적인 묘사의 르네상스'],
      ['romanticism', '감정과 자연의 웅장함을 강조한 낭만주의'],
      ['abstract expressionism', '형태 없이 감정을 색과 붓질로 표현한 추상표현주의'],
      ['minimalism', '요소를 극도로 줄인 미니멀리즘'],
      ['ukiyo e', '일본 목판화 우키요에'],
      ['gothic', '어둡고 뾰족한 건축과 음산한 분위기의 고딕'],
      ['vaporwave', '몽환적인 분홍·청록과 90년대 인터넷 감성의 레트로 미학'],
      ['synthwave', '80년대 네온과 격자 지평선의 레트로 미래 미학'],
      ['retrowave', '80년대 네온과 격자 지평선의 레트로 미래 미학'],
      ['steampunk', '증기기관과 황동 톱니가 있는 빅토리아풍 SF'],
      ['dieselpunk', '1920~40년대 기계·디젤 엔진풍 SF'],
      ['solarpunk', '식물과 재생 에너지가 어우러진 밝은 미래'],
      ['dark fantasy', '어둡고 음산한 판타지'],
      ['high fantasy', '마법과 왕국이 있는 웅장한 판타지'],
      ['fantasy art', '판타지 세계를 그린 일러스트'],
      ['sci fi', 'SF(과학 소설) 분위기'],
      ['science fiction', 'SF(과학 소설) 분위기'],
      ['futuristic', '미래적인 느낌'],
      ['dystopian', '암울한 미래 사회의 분위기'],
      ['vintage', '오래된 옛날 느낌'],
      ['retro', '지난 시대(주로 70~90년대)를 되살린 느낌'],
      ['whimsical', '엉뚱하고 장난스러운 느낌'],
      ['dreamy', '꿈속 같은 몽환적인 느낌'],
      ['ethereal', '현실 같지 않게 가볍고 신비로운 느낌'],
      ['surreal', '현실에서 벗어난 기묘한 느낌'],
      ['industrial', '금속·콘크리트로 이루어진 공장 같은 느낌']
    ]),
    // 사진·영화 장르
    bulk('style', [
      ['documentary', '현실을 있는 그대로 기록한 듯한 사실적인 스타일'],
      ['street photography', '거리의 사람과 일상을 우연히 포착한 듯한 사진'],
      ['portrait photography', '인물의 표정과 분위기를 담은 인물 사진'],
      ['fashion photography', '옷과 스타일을 세련되게 보여 주는 패션 사진'],
      ['editorial photography', '잡지 기사용처럼 연출된 사진'],
      ['product photography', '제품이 깔끔하게 돋보이는 제품 사진'],
      ['food photography', '음식이 먹음직스럽게 보이는 사진'],
      ['landscape photography', '풍경을 담은 사진'],
      ['wildlife photography', '야생동물을 담은 사진'],
      ['architectural photography', '건축물의 직선과 구조를 강조한 사진'],
      ['black and white photography', '흑백으로 찍은 사진'],
      ['film noir', '강한 명암과 어두운 도시 분위기의 느와르 영화'],
      ['noir', '어둡고 냉소적인 느와르 분위기'],
      ['horror film', '공포 영화 같은 어둡고 긴장된 분위기'],
      ['western', '황야와 카우보이가 나오는 서부극 분위기'],
      ['movie still', '영화의 한 장면을 캡처한 듯한 느낌'],
      ['film still', '영화의 한 장면을 캡처한 듯한 느낌'],
      ['cinematic still', '영화 장면 같은 한 컷'],
      ['vintage photo', '오래된 사진 같은 바랜 색과 입자감'],
      ['old photograph', '오래된 사진 같은 바랜 느낌'],
      ['stock photo', '광고용 스톡 사진처럼 깔끔하고 일반적인 사진'],
      ['magazine cover', '잡지 표지 같은 구성과 글자 자리'],
      ['poster design', '포스터처럼 구성된 디자인'],
      ['album cover', '앨범 표지 같은 구성']
    ]),
    // 렌더링·사실성·레트로 게임
    bulk('style', [
      ['3d animation', '3D로 만든 애니메이션 느낌'],
      ['cgi', '컴퓨터 그래픽으로 만든 영상이나 이미지'],
      ['cel shading', '만화처럼 평평한 색 면과 뚜렷한 윤곽의 3D 표현'],
      ['toon shading', '만화처럼 평평한 색 면과 뚜렷한 윤곽의 3D 표현'],
      ['clay render', '점토로 빚은 듯한 매끈한 3D 렌더'],
      ['hyperrealistic', '실제보다 더 사실적인 극사실 표현'],
      ['ultra realistic', '아주 사실적인 표현'],
      ['realistic', '현실과 비슷한 사실적인 표현'],
      ['photoreal', '사진처럼 사실적인 표현'],
      ['8 bit', '8비트 게임 같은 거친 픽셀과 적은 색'],
      ['16 bit', '16비트 게임 같은 픽셀 그림과 더 풍부한 색'],
      ['retro game', '옛날 게임 같은 픽셀 그래픽'],
      ['lo fi', '일부러 거칠고 편안하게 만든 로파이 분위기'],
      ['grunge', '낡고 거칠고 지저분한 질감'],
      ['isometric art', '위에서 비스듬히 본 등각 그림']
    ])
  ));

  // ---- 전환/편집: 컷·전환·합성·속도·자막 (영상 전용) ----
  // speed up, real time 처럼 대상의 움직임으로도 쓰이는 말은 오분류 위험이 있어 넣지 않았다.
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 편집 리듬·구성
    bulk('transition', [
      ['cut to black', '장면이 갑자기 검은 화면으로 끊김'],
      ['montage', '여러 짧은 장면을 이어 붙여 시간이나 감정을 압축해 보여 줌'],
      ['rapid cuts', '아주 빠르게 이어지는 컷. 긴박하고 속도감 있는 편집'],
      ['fast cuts', '아주 빠르게 이어지는 컷. 긴박하고 속도감 있는 편집'],
      ['fast paced editing', '컷이 빠르게 이어지는 빠른 호흡의 편집'],
      ['slow paced editing', '컷이 길고 천천히 이어지는 느린 호흡의 편집'],
      ['invisible cut', '관객이 눈치채기 어렵게 자연스럽게 이어지는 컷'],
      ['crosscut', '서로 다른 장소의 장면을 번갈아 보여 주는 컷'],
      ['cross cutting', '서로 다른 장소의 장면을 번갈아 보여 주는 편집'],
      ['parallel editing', '동시에 벌어지는 일들을 번갈아 보여 주는 편집'],
      ['multi shot', '한 영상 안에 여러 샷이 이어지는 구성'],
      ['scene change', '장면이 다른 장면으로 바뀜'],
      ['time jump', '시간이 건너뛰어 다음 장면으로 넘어감'],
      ['flashback', '과거의 장면으로 돌아감'],
      ['flash forward', '미래의 장면을 미리 보여 줌'],
      ['cinemagraph', '대부분 멈춰 있고 일부만 반복해 움직이는 짧은 영상'],
      ['seamless loop', '처음과 끝이 끊김 없이 이어져 반복되는 영상'],
      ['looping video', '끊김 없이 반복되는 영상'],
      ['boomerang', '앞으로 갔다 거꾸로 돌아오기를 반복하는 영상']
    ]),
    // 장면 전환
    bulk('transition', [
      ['transition', '장면과 장면 사이를 이어 주는 전환'],
      ['scene transition', '장면과 장면 사이를 이어 주는 전환'],
      ['fade transition', '서서히 밝아지거나 어두워지며 넘어가는 전환'],
      ['crossfade', '앞 장면이 옅어지며 다음 장면이 겹쳐 나타나는 전환'],
      ['dip to black', '검은 화면을 거쳐 다음 장면으로 넘어가는 전환'],
      ['dip to white', '흰 화면을 거쳐 다음 장면으로 넘어가는 전환'],
      ['flash transition', '번쩍이는 섬광으로 장면이 바뀌는 전환'],
      ['flash cut', '순간 번쩍이는 화면을 끼워 넣는 컷'],
      ['iris wipe', '원형으로 열리거나 닫히며 장면이 바뀌는 전환'],
      ['wipe transition', '새 장면이 한쪽에서 밀고 들어오며 이전 장면을 지우는 전환'],
      ['push transition', '새 장면이 이전 장면을 밀어내며 들어오는 전환'],
      ['zoom transition', '확대하며 다음 장면으로 넘어가는 전환'],
      ['spin transition', '화면이 회전하며 다음 장면으로 넘어가는 전환'],
      ['glitch transition', '화면이 깨지며 다음 장면으로 넘어가는 전환'],
      ['morph transition', '모양이 변하며 다음 장면으로 이어지는 전환'],
      ['match dissolve', '비슷한 모양의 장면이 서서히 겹쳐 이어지는 전환'],
      ['light leak transition', '빛 번짐 효과를 타고 넘어가는 전환'],
      ['whip pan transition', '카메라를 휙 돌려 흐려진 화면으로 장면을 바꾸는 전환'],
      ['blur transition', '화면이 흐려지며 다음 장면으로 넘어가는 전환'],
      ['invisible transition', '전환이 눈에 띄지 않게 자연스럽게 이어짐']
    ]),
    // 합성·속도 효과
    bulk('transition', [
      ['picture in picture', '작은 화면을 큰 화면 위에 띄워 함께 보여 줌'],
      ['multiple exposure', '여러 장면을 겹쳐 한 화면에 합성한 효과'],
      ['ghosting', '지나간 움직임의 잔상이 겹쳐 보이는 효과'],
      ['motion trail', '움직임의 궤적이 잔상으로 남는 효과'],
      ['bullet time', '움직임을 느리게 하면서 카메라가 대상 주위를 도는 효과'],
      ['rewind', '영상을 되감는 효과'],
      ['played backwards', '영상을 거꾸로 재생함'],
      ['slowed down', '재생 속도가 느려짐'],
      ['ultra slow motion', '아주 느린 슬로모션. 순간의 디테일이 극대화됨'],
      ['super slow motion', '아주 느린 슬로모션. 순간의 디테일이 극대화됨'],
      ['variable speed', '재생 속도가 중간에 변함'],
      ['speed ramping', '재생 속도를 빠르게 했다 느리게 했다 바꾸는 효과'],
      ['frame by frame', '한 프레임씩 끊어서 움직이는 느낌']
    ]),
    // 화면 위 글자·표시
    bulk('transition', [
      ['text overlay', '화면 위에 겹쳐 표시한 글자'],
      ['subtitles', '화면 아래에 표시되는 자막'],
      ['captions', '화면에 표시되는 자막'],
      ['title card', '제목이 적힌 화면'],
      ['end credits', '영상 끝에 올라가는 제작진 명단'],
      ['lower third', '화면 아래쪽에 인물이나 정보를 표시하는 자막'],
      ['watermark', '화면에 겹쳐 찍힌 워터마크'],
      ['logo overlay', '로고를 화면 위에 겹쳐 표시함']
    ])
  ));

  // ---- 주제: 프롬프트에 자주 나오는 흔한 대상 (사람·동물·식물·탈것·사물·음식·판타지) ----
  // 위키피디아 조회가 기대만큼 매끄럽지 않아 흔한 대상도 사전에 둔다(사용자 결정). 고유명사는 넣지 않는다.
  EXPANSION_TERMS.push.apply(EXPANSION_TERMS, [].concat(
    // 사람
    bulk('subject', [
      ['man', '남자'], ['men', '남자들(man의 복수)'],
      ['woman', '여자'], ['women', '여자들(woman의 복수)'],
      ['boy', '소년'], ['girl', '소녀'],
      ['child', '어린이'], ['children', '어린이들(child의 복수)'],
      ['baby', '아기'], ['person', '사람'], ['people', '사람들(person의 복수)'],
      ['couple', '커플, 부부'], ['family', '가족'],
      ['soldier', '군인'], ['doctor', '의사'], ['chef', '요리사'], ['student', '학생'],
      ['musician', '음악가'], ['dancer', '무용수'], ['athlete', '운동선수'],
      ['king', '왕'], ['queen', '여왕'], ['princess', '공주']
    ]),
    // 동물
    bulk('subject', [
      ['cat', '고양이'], ['dog', '개'], ['puppy', '강아지'], ['kitten', '새끼 고양이'],
      ['horse', '말'], ['cow', '소'], ['sheep', '양'], ['rabbit', '토끼'], ['deer', '사슴'],
      ['fox', '여우'], ['wolf', '늑대'], ['wolves', '늑대들(wolf의 복수)'], ['bear', '곰'],
      ['lion', '사자'], ['tiger', '호랑이'], ['elephant', '코끼리'], ['monkey', '원숭이'],
      ['panda', '판다'], ['owl', '올빼미, 부엉이'], ['eagle', '독수리'], ['whale', '고래'],
      ['dolphin', '돌고래'], ['shark', '상어'], ['butterfly', '나비'], ['fish', '물고기'], ['bird', '새']
    ]),
    // 식물
    bulk('subject', [
      ['flower', '꽃'], ['tree', '나무'], ['leaf', '잎'], ['leaves', '잎들(leaf의 복수)'],
      ['palm tree', '야자나무'], ['pine tree', '소나무'], ['cherry blossom', '벚꽃'], ['mushroom', '버섯']
    ]),
    // 탈것
    bulk('subject', [
      ['car', '자동차'], ['sports car', '스포츠카'], ['truck', '트럭'], ['bus', '버스'], ['taxi', '택시'],
      ['motorcycle', '오토바이'], ['bicycle', '자전거'], ['train', '기차'], ['airplane', '비행기'],
      ['boat', '보트'], ['ship', '배'], ['spaceship', '우주선']
    ]),
    // 사물
    bulk('subject', [
      ['chair', '의자'], ['table', '탁자'], ['desk', '책상'], ['bed', '침대'], ['sofa', '소파'],
      ['lamp', '램프, 조명 기구'], ['mirror', '거울'], ['window', '창문'], ['door', '문'], ['clock', '시계'],
      ['book', '책'], ['phone', '전화기'], ['laptop', '노트북 컴퓨터'], ['guitar', '기타'], ['piano', '피아노'],
      ['bottle', '병'], ['sword', '검'], ['knife', '칼']
    ]),
    // 음식
    bulk('subject', [
      ['coffee', '커피'], ['tea', '차'], ['bread', '빵'], ['cake', '케이크'], ['pizza', '피자'],
      ['burger', '햄버거'], ['sushi', '초밥'], ['apple', '사과'], ['strawberry', '딸기'], ['ice cream', '아이스크림']
    ]),
    // 판타지·가상 존재
    bulk('subject', [
      ['dragon', '용'], ['wizard', '마법사'], ['witch', '마녀'], ['fairy', '요정'], ['mermaid', '인어'],
      ['vampire', '뱀파이어'], ['ghost', '유령'], ['angel', '천사'], ['monster', '괴물'], ['alien', '외계인']
    ])
  ));

  /*__EXPANSION_BLOCKS__*/

  PC.DEFAULT_TERMS = PC.DEFAULT_TERMS.concat(SUBJECT_TERMS, COLOR_OVERLAP_TERMS, EFFECT_TERMS, NEGATED_MOTION_TERMS, STATIC_CAMERA_TERMS, LIGHTS_TERMS, CAMERA_WORD_TERMS, CAMERA_MOTION_TERMS, TRANSITION_TERMS, EXPANSION_TERMS);
})();
