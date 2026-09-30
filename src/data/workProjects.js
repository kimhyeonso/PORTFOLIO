import amorepacificThumbnail from '../assets/image/project/AMOREPACIFIC/Thumnail.png'
import { allDesignProjects } from './designProjects.js'

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
 * 카드 번호(id)는 아래 workOrder 순서로 정렬한 뒤 01부터 다시 매긴다.
 */

/*
 * 회사(탭)별 프로젝트와 보이는 순서. 위에 적을수록 앞에 나온다 (줄 순서만 바꾸면 순서가 바뀐다).
 * 회사 순서도 이 객체의 순서를 따른다 (CONCENTRIX → RICOTA).
 * 여기 없는 실무 작업은 RICOTA 맨 뒤에 붙는다.
 */
const workOrder = {
  concentrix: [
    'amorepacific',
  ],
  ricota: [
    'hanwoo',
    'teenature',
    'kwangwoon-university',
    'g-foundation',
    'ricota-homepage',
    'dive-to-earth',
    'advertising-banner',
  ],
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

const companies = Object.keys(workOrder)
// slug → 회사 (workOrder에서 거꾸로 찾는다)
const companyOf = (slug) => companies.find((company) => workOrder[company].includes(slug)) || 'ricota'
// 회사 안에서의 순서 (목록에 없으면 맨 뒤)
const rankOf = ({ slug, category }) => {
  const index = workOrder[category]?.indexOf(slug) ?? -1
  return index < 0 ? Infinity : index
}

export const workProjects = [
  ...allDesignProjects.filter((project) => project.work).map((project) => ({ ...project, category: companyOf(project.slug) })),
  ...extraProjects,
]
  .sort((a, b) => companies.indexOf(a.category) - companies.indexOf(b.category) || rankOf(a) - rankOf(b))
  .map((project, index) => ({ ...project, id: String(index + 1).padStart(2, '0') }))
