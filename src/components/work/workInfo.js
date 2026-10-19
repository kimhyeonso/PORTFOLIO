// Working 페이지에서 프로젝트 정보를 화면 글자로 바꾸는 도우미 (첫 화면 · 스크롤 화면 공용)

// 작업 형태 (workProjects의 work 값)
export const workLabels = { client: '클라이언트 작업', 'in-house': '인하우스 작업', proposal: '제안 프로젝트' }
// tools 키 중 화면에 다르게 보여줄 이름
export const toolNames = { Behands: 'Behance', Iweb: 'iWeb' }

// contribution: 숫자면 "기여도 30%", 역할별 목록이면 "기획 70% · 디자인 100%"
export function formatContribution(contribution) {
    if (contribution == null) return null
    if (typeof contribution === 'number') return `기여도 ${contribution}%`
    return contribution.map(({ role, value }) => `${role} ${value}%`).join(' · ')
}

// link: 문자열이면 [{ label: '홈페이지', url }], 객체면 { 버튼이름: 주소 } 를 버튼 목록으로. 빈 주소는 뺀다
export function toLinks(link) {
    if (!link) return []
    if (typeof link === 'string') return [{ label: '홈페이지', url: link }]
    return Object.entries(link).filter(([, url]) => url).map(([label, url]) => ({ label, url }))
}

// 기간: "2024.10 - 2025.04" (기간이 없으면 연도)
export const periodOf = ({ period, year }) => (period ? `${period.start} - ${period.end}` : String(year ?? ''))

// 시작 연도 (기간이 있으면 시작 연도, 없으면 year)
export const startYearOf = ({ period, year }) => (period ? Number(period.start.slice(0, 4)) : Number(year))
