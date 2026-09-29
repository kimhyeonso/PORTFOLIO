import amorepacificThumbnail from '../assets/image/project/AMOREPACIFIC/Thumnail.png'
import { designProjects } from './designProjects.js'

/**
 * Working(실무) 프로젝트 카드 데이터 — designProjects.js와 같은 구조
 *
 *   category     상단 서브 메뉴(탭)  'concentrix' | 'ricota'
 *   work         썸네일 위 뱃지     'client' → CLIENT WORK, 'in-house' → IN-HOUSE, 'proposal' → PROPOSAL
 *   나머지 필드는 designProjects.js 위쪽 설명과 같다.
 *
 * 1) Design에서 가져오는 실무 작업
 *    designProjects.js에서 work가 있는 프로젝트를 그대로 불러온다. 내용 수정은 designProjects.js에서 하면
 *    Design/Working 두 페이지에 같이 반영된다. 여기서는 어느 회사(탭)에서 한 작업인지만 정한다.
 * 2) Working에만 넣을 작업
 *    아래 extraProjects 배열에 designProjects.js와 같은 형식으로 추가한다.
 *
 * 카드 번호(id)는 회사 순서(CONCENTRIX → RICOTA)로 정렬한 뒤 01부터 다시 매긴다.
 */

// Design 실무 작업의 slug → 회사 (Design에서 가져오는 실무 작업은 모두 RICOTA에서 한 작업)
const companyBySlug = {
  'ricota-homepage': 'ricota',
  divetours: 'ricota',
  'advertising-banner': 'ricota',
  'g-foundation': 'ricota',
  'kwangwoon-university': 'ricota',
  hanwoo: 'ricota',
  teenature: 'ricota',
}

// Working에만 넣을 실무 작업 (designProjects.js와 같은 형식 + category)
const extraProjects = [
  {
    slug: 'amorepacific',
    category: 'concentrix',
    title: 'AMOREPACIFIC',
    work: 'client',
    type: 'Design Review',
    year: 2025,
    period: { start: '2024.10', end: '2025.04', duration: '6개월' },
    description: '아모레퍼시픽의 모든 브랜드의 상품 썸네일 제작, 상품 상세페이지 디자인 검수 일을 하였습니다',
    thumbnail: amorepacificThumbnail,
    tools: ['Figma', 'Photoshop'],
    link: '',
    images: [],
  },
]

const companyOrder = ['concentrix', 'ricota']

export const workProjects = [
  ...designProjects.filter((project) => project.work).map((project) => ({ ...project, category: companyBySlug[project.slug] || 'ricota' })),
  ...extraProjects,
]
  .sort((a, b) => companyOrder.indexOf(a.category) - companyOrder.indexOf(b.category))
  .map((project, index) => ({ ...project, id: String(index + 1).padStart(2, '0') }))
