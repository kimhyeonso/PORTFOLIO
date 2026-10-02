/*
 * PROFILE 페이지(RPG 상태창)의 모든 글 · 수치 · 연출 값.
 * 글이나 능력치 숫자는 여기만 고치면 화면(HTML 패널)과 3D(스킬 오브 색 · 능력치 기둥 높이)에 같이 반영된다.
 */

export const hero = {
  name: 'KIM HYEONSU',
  nameKo: '김현수',
  title: 'Designer × Frontend Developer',
  // 인트로에서는 두 줄 인용문, 이후 왼쪽 위에서는 한 줄로 이어진다
  copyLines: ['디자인만 하려고 했습니다,', '근데 제가 팀장이고 코딩까지 하고 있죠?'],
  // 처음 진입 인트로(가운데 정렬)가 자동으로 넘어가기까지 시간(ms). 클릭 · 키 · 휠로 바로 넘길 수 있다
  introHold: 3600,
}

// key는 STAGING · 패널 · 3D 이펙트 key와 같다
export const menus = [
  { key: 'profile', label: 'Profile', ko: '프로필' },
  { key: 'skill', label: 'Skill', ko: '스킬' },
  { key: 'equipment', label: 'Equipment', ko: '장비' },
  { key: 'stats', label: 'Stats', ko: '능력' },
  // 대외활동 + 연락처 패널 (key는 내부용이라 contact 그대로)
  { key: 'contact', label: 'Record', ko: '기록' },
]

export const ui = {
  windowLabel: 'STATUS',
  menuLabel: '상태창 메뉴',
  keyHint: { keys: ['←', '→'], or: 'OR', range: '1–5', label: 'KEY TO MOVE' },
  equippedLabel: 'EQUIPPED',
  levelLabel: 'LV',
  photoAlt: '김현수 프로필 사진',
  equipNav: { label: '장비 카테고리', prev: '이전 장비 카테고리', next: '다음 장비 카테고리' },
}

/*
 * PROFILE · CONTACT 패널 행. lines의 각 줄은
 *   'A · B' 문자열        → A(진하게) + B(금빛 태그)
 *   { label, value }     → 항목(흐리게) — 값(진하게)
 *   { label, birth }     → birth('YYYY-MM-DD')를 'YYYY년 M월 D일(만 N세)'로 (만 나이는 오늘 기준)
 * dense: true면 그 행만 글씨를 조금 작게 (내용이 많을 때)
 */
export const profile = {
  rows: [
    {
      key: 'Info', ko: '정보',
      lines: [{ label: '생년월일', birth: '2001-10-26' }, { label: '거주지', value: '경기도 화성시' }],
    },
    { key: 'Major', ko: '전공', lines: ['상지대학교 시각영상 디자인학과 졸업 · 2024'] },
    { key: 'Career', ko: '경력', lines: ['(주)리코타 · 2025.4 ~ 2026.3', '(유)콘센트릭스 코리아 · 2023.10 ~ 2024.04'] },
  ],
  goal: { key: 'Goal', ko: '목표', from: 'Design', to: 'Frontend Developer' },
}

// color는 3D 스킬 오브 색과 같다
export const skills = [
  { no: '01', title: 'UI DESIGN', color: '#6CC285', tools: ['Figma', 'Photoshop', 'Illustrator'], uses: 'Web UI / Detail Page / Advertising Design' },
  { no: '02', title: 'FRONTEND', color: '#5FB4EA', tools: ['HTML', 'CSS', 'JavaScript', 'React', 'SCSS'], uses: 'Responsive Web / Component Development' },
  { no: '03', title: 'INTERACTION', color: '#EE9A4E', tools: ['GSAP', 'ScrollTrigger', 'Three.js'], uses: 'Scroll Animation / Interactive Web / 3D Visual' },
  { no: '04', title: 'VISUAL COMMUNICATION', color: '#D9AE3E', tools: ['Proposal Design', 'Information Design', 'Campaign Visual'], uses: 'Presentation / Advertising / SNS Content' },
]

/*
 * 장비. 카테고리 color는 페이지 표시 · 3D 장비 슬롯 보석 색, 장비 color는 아이콘 대표색(숙련도 막대 · LV 배지 · 태그).
 * level은 숙련도(0–100, 임시값). 아이콘은 name이 skillIcons.js에 있으면 그 이미지, 없으면 tag 글자(팔각)로 보여준다.
 */
export const equipment = [
  {
    en: 'DESIGN GEAR', ko: '디자인 장비', color: '#5FB4EA',
    items: [{ tag: 'Fg', name: 'Figma', level: 90, color: '#A259FF' }, { tag: 'Ps', name: 'Photoshop', level: 88, color: '#31A8FF' }, { tag: 'Ai', name: 'Illustrator', level: 82, color: '#FF9A00' }, { tag: 'Id', name: 'InDesign', level: 75, color: '#FF3366' }, { tag: 'Xd', name: 'XD', level: 78, color: '#FF61F6' }],
  },
  {
    en: 'VIDEO GEAR', ko: '영상 장비', color: '#EE9A4E',
    items: [{ tag: 'Pr', name: 'Premiere Pro', level: 85, color: '#9999FF' }, { tag: 'Ae', name: 'After Effects', level: 80, color: '#B57BFF' }, { tag: 'C4', name: 'Cinema 4D', level: 65, color: '#2E6BD6' }],
  },
  {
    en: 'DEV GEAR', ko: '개발 장비', color: '#6CC285',
    items: [{ tag: 'VS', name: 'VS Code', level: 85, color: '#23A8F2' }, { tag: 'GH', name: 'GitHub', level: 72, color: '#5A6270' }, { tag: 'Re', name: 'React', level: 75, color: '#4FC8E8' }, { tag: 'Vc', name: 'Vercel', level: 70, color: '#5B5B5B' }],
  },
  {
    en: 'AI GEAR', ko: 'AI 장비', color: '#9D8FE3',
    items: [{ tag: 'GP', name: 'ChatGPT', level: 85, color: '#10A37F' }, { tag: 'Cx', name: 'Codex', level: 78, color: '#6C7BFF' }, { tag: 'Cl', name: 'Claude', level: 80, color: '#D97757' }, { tag: 'Gm', name: 'Gemini', level: 72, color: '#4E86F7' }],
  },
]

// value는 임시값 (0–100)
export const stats = [
  { abbr: 'PER', en: 'Persistence', ko: '끈기', value: 95, note: '막히는 문제도 끝까지 붙잡고 해결합니다.' },
  { abbr: 'RES', en: 'Responsibility', ko: '책임감', value: 92, note: '맡은 일은 마감과 완성도까지 챙깁니다.' },
  { abbr: 'LRN', en: 'Learning Ability', ko: '학습력', value: 90, note: '디자인에서 코드로, 필요한 건 직접 배워 씁니다.' },
  { abbr: 'COL', en: 'Collaboration', ko: '협업', value: 86, note: '아이디어 회의와 팀 프로젝트로 다진 소통력.' },
  { abbr: 'CMP', en: 'Completion', ko: '완성도', value: 93, note: '픽셀 단위 디테일까지 끝까지 다듬습니다.' },
  { abbr: 'SOL', en: 'Problem Solving', ko: '문제 해결', value: 87, note: '보이는 문제를 구조로 나눠 풀어냅니다.' },
]

// CONTACT 패널: 대외활동 + 연락처 (연락처 값은 아직 자리표시 — 실제 값으로 바꿔 주세요)
export const contact = {
  rows: [
    {
      key: 'Activity', ko: '대외활동', dense: true,
      lines: [
        '상지대학교 총학생회 비상대책위원회 마케팅 부장 활동 · 2021',
        '제28회 커뮤니케이션국제디자인 공모전 미래엔 교과서 표지 디자인 부문 특선 · 2022',
        'LFD(Life For Design) 팀 프로젝트 참여 · 2022',
        '제29회 커뮤니케이션국제디자인 공모전 자유주제 부문 (입선, 특선) · 2023',
      ],
    },
    {
      key: 'Contact', ko: '연락처',
      lines: [{ label: 'Email', value: '이메일을 입력해 주세요' }, { label: 'Phone', value: '전화번호를 입력해 주세요' }],
    },
  ],
}

/*
 * 메뉴별 3D 연출. rot 양수 = 오른쪽 정보 패널 쪽으로 몸을 돌림.
 * 모바일은 cam z +0.6, rot · cam x 50%.
 */
export const STAGING = {
  profile: { pos: [0, 0, 0.3], rot: 0, cam: [0, 1.9, 8.0], look: [0, 1.45, 0.2], accent: '#F6C964' },
  skill: { pos: [-0.5, 0, 0], rot: -0.25, spin: true, cam: [-1.0, 2.0, 9.2], look: [-0.4, 1.45, 0], accent: '#7FD3A6' },
  equipment: { pos: [0.15, 0, 0], rot: 0.85, cam: [2.0, 2.3, 8.8], look: [0.1, 1.4, 0], accent: '#7CC4F2' },
  stats: { pos: [0, 0, 0], rot: 0, cam: [0, 4.6, 8.6], look: [0, 1.0, 0], accent: '#F2AE5E' },
  contact: { pos: [0.1, 0, -0.6], rot: 0.6, cam: [1.0, 2.1, 9.6], look: [0.2, 1.35, -0.3], accent: '#EE9F86' },
}

// 처음 진입 인트로: 캐릭터를 화면 가운데(이름과 인용문 사이)에 두는 카메라
export const INTRO_STAGE = { pos: [0, 0, 0], rot: 0, cam: [0, 2.0, 11.5], look: [0, 1.25, 0], accent: '#F6C964' }

export const CAMERA = {
  fov: 32,
  intro: [0, 2.8, 12.5],
}
