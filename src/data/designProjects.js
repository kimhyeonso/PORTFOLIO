import sonyPieceThumbnail from '../assets/image/project/SONYPIECE/Thumnail.png'
import wildFixThumbnail from '../assets/image/project/WILDFIX/Thumnail.png'
import diveToursThumbnail from '../assets/image/project/DIVETOURS/Thumnail.png'
import homepageThumbnail from '../assets/image/project/HOMEPAGE/Thumnail.png'
import mountainThumbnail from '../assets/image/project/MOUNTAIN EQUIMENT/Thumnail.png'
import bannerThumbnail from '../assets/image/project/ADVERTISING BANNER/Thumnail.png'
import gFoundationThumbnail from '../assets/image/project/G-FOUNDATION/Thumnail.png'
import universeThumbnail from '../assets/image/project/UNIVERSE/Thumnail.png'
import hanwooThumbnail from '../assets/image/project/HANWOO/Thumnail.png'
import teenatureThumbnail from '../assets/image/project/TEENATURE/Thumnail.png'

/**
 * 디자인 프로젝트 카드 데이터 (Frontend와 같은 구조)
 *
 * 카드 화면 매핑
 *   id           카드 번호               01
 *   title        큰 제목               SONY PIECE
 *   type / year  제목 아래 한 줄       Web Design / 2022
 *   period       기간 줄              2022.10 - 2022.12 (2개월)   ※ 없으면 생략 → 줄이 안 보임
 *   contribution 기여도 줄
 *                  숫자 하나          30                              → 기여도 : 30%
 *                  역할별 목록        [{ role: '기획', value: 70 }, …] → 기획 : 70% 디자인 : 100%
 *   description  따옴표 설명           "공간의 흐름 ..."
 *   thumbnail    왼쪽 큰 이미지 (아직 없으면 null → 빈 배경으로 표시)
 *   tools        도구 아이콘 (skillIcons.js의 키 이름)
 *   textSide     PC 카드에서 이미지 위 글자 위치 'left' | 'right' (생략하면 왼쪽)
 *   link         이미지 호버 시 [세부정보] 옆 링크 버튼 (없으면 빈 문자열)
 *                  주소 하나        'https://...'                          → [홈페이지]
 *                  여러 개          { '버튼 이름': 'https://...', … }     → [버튼 이름] (이름마다 하나씩)
 *   세부정보      이미지 호버 시 [세부정보] → 팝업(ProjectModal): 썸네일 없이 images(상세페이지)만
 *   detail       false면 [세부정보] 버튼을 숨긴다 (세부정보 팝업이 없는 프로젝트)
 *   images       세부정보 팝업에 바로 보일 상세 이미지들 (위에서부터 이어 붙음, 없으면 썸네일이 대신 보임)
 *   category     상단 탭 필터 (web-ui | editorial | proposal)   ※ proposal은 Design에선 숨기고 Working에서만 보여준다
 *                같은 category끼리 붙어 있어야 탭을 눌렀을 때 그 묶음으로 이동한다
 *   work         실무 작업 뱃지 (썸네일 왼쪽 위)  'client' → CLIENT WORK, 'in-house' → IN-HOUSE, 'proposal' → PROPOSAL   ※ 개인·학습 작업은 생략
 */
export const allDesignProjects = [
  {
    id: '01',
    slug: 'sony-piece', // 영문 소문자-하이픈, 프로젝트마다 겹치지 않게
    detail: false, // 세부정보 버튼 없음
    category: 'web-ui',
    title: 'SONY PIECE',
    type: 'Web Design',
    year: 2022,
    period: { start: '2022.10', end: '2022.12', duration: '2개월' },
    contribution: 30, // % 숫자만
    description: '공간의 흐름 이라는 키워드로 SONY PIECE라는 브랜드를 만들었고 SONY PIECE라는 브랜드 안에 턴테이블 제품을 구상하여 만들었습니다',
    thumbnail: sonyPieceThumbnail,
    tools: ['Figma', 'Cinema 4D', 'Behands'],
    link: 'https://www.behance.net/gallery/159965505/SONY-PIECE-Play-Small-Excitement-in-Everyday-Life',
    images: [], // 세부정보 팝업에 보일 상세 이미지 (Mokup01.png 등 import해서 넣기)
  },
  {
    id: '02',
    slug: 'wildfix',
    category: 'web-ui',
    title: 'WILDFIX',
    type: 'Web Design',
    year: 2024,
    period: { start: '2024.04', end: '2024.05', duration: '1개월' },
    contribution: 100,
    description: '빈티지 컨셉의 남성 쇼핑몰 웹을 디자인하였습니다 빈티지 느낌을 살려 그린 계열의 컬러를 메인 컬러로 선정하였습니다',
    thumbnail: wildFixThumbnail,
    tools: ['Photoshop', 'Figma'],
    link: '',
    images: [], // 세부정보 팝업은 components/details/WildfixDetail.jsx (코드로 만든 상세페이지)
  },
  {
    id: '03',
    slug: 'ricota-homepage',
    detail: false, // 세부정보 버튼 없음
    category: 'web-ui',
    title: '회사 홈 페이지',
    work: 'in-house',
    type: 'Home Web Page',
    year: 2025,
    contribution: [
      { role: '디자인', value: 100 },
    ],
    description: '회사 내부의 아이덴티티의 맞춰서 회사 홈페이지를 제작하였습니다',
    thumbnail: homepageThumbnail,
    tools: ['Illustrator', 'After Effects', 'Iweb'],
    link: 'https://www.ricota.co.kr/',
    images: [],
  },
  {
    id: '04',
    slug: 'g-foundation',
    category: 'web-ui',
    title: '지파운데이션',
    work: 'proposal',
    type: 'Proposal Design',
    year: 2025,
    period: { start: '2025.05', end: '2025.05', duration: '2주' },
    contribution: [
      { role: '기획', value: 30 },
      { role: '디자인', value: 100 },
    ],
    description: '지파운데이션 제안서의 상세페이지 리디자인으로 인포그래픽 중심으로 작업한 후 pc 화면으로 구현하였습니다',
    thumbnail: gFoundationThumbnail,
    tools: ['VS Code', 'Figma', 'Photoshop'],
    link: {
      'SANITARY PAD': 'https://kimhyeonso.github.io/GFoundation-sanitarypad/',
      'CHILD SPONSOR': 'https://kimhyeonso.github.io/Gfoundation-childsponsorship/',
    },
    images: [],
  },
  {
    id: '05',
    slug: 'dive-to-earth',
    category: 'editorial',
    title: 'DIVE TO EARTH',
    work: 'client',
    type: 'Product Detail Page (PDP)',
    year: 2025,
    contribution: [
      { role: '기획', value: 70 },
      { role: '디자인', value: 100 },
    ],
    description: '다이브 투어스 스마트 스토어 운영 및 온라인 배너 상세 페이지 제작 하였습니다',
    thumbnail: diveToursThumbnail,
    tools: [],
    link: '',
    images: [],
  },
  {
    id: '06',
    slug: 'mountain-equipment',
    category: 'editorial',
    title: 'MOUNTAIN EQUIPMENT',
    type: 'Editorial Design',
    year: 2023,
    period: { start: '2023.03', end: '2023.03', duration: '5주' },
    contribution: 100,
    description: '아웃도어의 여러가지 상품들을 4개의 주제로 나누어 대표 상품을 통해 브랜트 특성을 소개하는 카탈로그를 제작하였습니다',
    thumbnail: mountainThumbnail,
    tools: ['Photoshop', 'InDesign'],
    link: '',
    images: [], // 세부정보 팝업은 components/details/MountainDetail.jsx (코드로 만든 상세페이지)
  },
  {
    id: '07',
    slug: 'advertising-banner',
    category: 'editorial',
    title: 'ADVERTISING BANNER',
    work: 'client',
    type: 'Advertising Design',
    year: 2025,
    contribution: [
      { role: '디자인', value: 100 },
    ],
    description: '리버레이크 송파와 경련전람 홍보에 대한 온 · 오프라인 광고를 기획에 맞춰 디자인 작업을 하였습니다',
    thumbnail: bannerThumbnail,
    tools: ['Photoshop', 'Illustrator'],
    link: '',
    images: [],
  },
  {
    id: '08',
    slug: 'kwangwoon-university',
    category: 'proposal',
    title: '광운대학교',
    work: 'proposal',
    type: 'Proposal Design',
    year: 2025,
    period: { start: '2025.04', end: '2025.04', duration: '2주' },
    contribution: [
      { role: '기획', value: 20 },
      { role: '디자인', value: 100 },
    ],
    description: '광운대학교의 대표 비마를 이용하여 3가지 KV와 광고 배너를 제작하였습니다',
    thumbnail: universeThumbnail,
    tools: ['Photoshop', 'Illustrator'],
    link: '',
    images: [],
  },
  {
    id: '09',
    slug: 'hanwoo',
    category: 'proposal',
    title: '한우자조금',
    work: 'proposal',
    type: 'Proposal Design',
    year: 2025,
    period: { start: '2025.10', end: '2025.10', duration: '3주' },
    contribution: [
      { role: '기획', value: 45 },
      { role: '디자인', value: 100 },
    ],
    description: '한우자조금의 캐릭터를 이용하여 한우 먹는날을 1년의 4종 컨셉에 대한 KV를 제작하고 그에 맞는 광고 배너 및 검색광고를 제작하였습니다',
    thumbnail: hanwooThumbnail,
    tools: ['Photoshop', 'Illustrator', 'PowerPoint'],
    link: '',
    images: [],
  },
  {
    id: '10',
    slug: 'teenature',
    category: 'proposal',
    title: '티네이처',
    work: 'proposal',
    type: 'Proposal Design',
    year: 2025,
    period: { start: '2026.02', end: '2026.02', duration: '2주' },
    contribution: [
      { role: '기획', value: 30 },
      { role: '디자인', value: 100 },
    ],
    description: '청소년 샴푸의 타겟을 청소년과 학부모 2가지를 선정하고 타겟의 맞는 KV과 검색 광고 디자인을 제작하였습니다',
    thumbnail: teenatureThumbnail,
    tools: ['Photoshop'],
    link: '',
    images: [],
  },
]

// Design 페이지 · 메뉴에 보일 프로젝트 (proposal 분류는 Working에서만)
export const designProjects = allDesignProjects.filter((project) => project.category !== 'proposal')
