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

  /*__EXPANSION_BLOCKS__*/

  PC.DEFAULT_TERMS = PC.DEFAULT_TERMS.concat(SUBJECT_TERMS, COLOR_OVERLAP_TERMS, EFFECT_TERMS, NEGATED_MOTION_TERMS, STATIC_CAMERA_TERMS, LIGHTS_TERMS, CAMERA_WORD_TERMS, CAMERA_MOTION_TERMS, TRANSITION_TERMS, EXPANSION_TERMS);
})();
