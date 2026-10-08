import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './GFoundationDetail.module.scss'

// G-FOUNDATION 폴더의 이미지 (예: img.page01, img['background01 (2)'])
const img = byName(import.meta.glob('../../assets/image/project/G-FOUNDATION/*.png', { eager: true, import: 'default' }))

// y는 글줄의 세로 가운데. align: left(x가 왼쪽) | center(x가 가운데)
function Text({ x = 960, y, size = 28, align = 'center', className = '', children }) {
    return <p className={`gf-text is-${align} ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

// 네모 상자 (배경색 · 테두리 등은 className으로)
function Box({ x, y, w, h, className = '' }) {
    return <div className={`gf-box ${className}`} style={{ '--x': x, '--y': y, '--w': w, '--h': h }} />
}

// 시안 전체 크기의 SVG (좌표를 시안 그대로 쓰고, dy만큼 아래로 옮긴다)
function Svg({ dy = 0, children }) {
    return (
        <svg className="gf-svg" viewBox={`0 0 1920 ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
            <g transform={`translate(0 ${dy})`}>{children}</g>
        </svg>
    )
}

/*
 * 세로 위치: 위에서부터 GAP 간격으로 쌓는다.
 * 미션 카드 · 전략 카드 · 상세페이지 설명처럼 안쪽 배치가 정해진 덩어리는 시안 좌표 그대로 두고,
 * 덩어리째 옮긴 거리(d…)만 더한다.
 */
const flow = stack(1232) // 히어로 아래 끝
const heading = (iconHeight) => ({ icon: flow.box(iconHeight, GAP.section), label: flow.text(32, GAP.near) })

const overview = { ...heading(186), lines: flow.lines(3, 29, 52, GAP.title) }

const mission = { ...heading(186), sub: flow.text(50, GAP.title) }
const dMission = flow.box(1168, GAP.title) - 2230 // 카드 위 끝 (시안 2230)

const strategyIcon = flow.box(199, GAP.section)
const dStrategy = flow.box(4670 - 3878, GAP.title) - 3878 // 가운데 카드 위 끝(시안 3878) ~ 주황 곡선 아래 끝(4670)

// Key Message: 제목 → 키 메세지 → 설명 → <광고> 이미지 2장 → <상세페이지> 덩어리
function keyMessage(bannerHeight, naverHeight, pageTop, pageBottom) {
    const label = flow.text(30, GAP.section)
    const key = flow.text(80, GAP.title)
    const lines = flow.lines(2, 32, 49, GAP.line)
    const ad = flow.text(34, GAP.item)
    const banner = flow.box(bannerHeight, GAP.title)
    const naver = flow.box(naverHeight, GAP.near)
    const page = flow.text(34, GAP.item)
    const dPage = flow.box(pageBottom - pageTop, GAP.title) - pageTop
    return { label, key, lines, ad, banner, naver, page, dPage }
}
const key1 = keyMessage(545, 823, 7224, 9733) // 상세페이지: page01 위 끝 ~ 설명 글 아래 끝 (시안 좌표)
const key2 = keyMessage(549, 830, 12458, 13982)
const HEIGHT = flow.bottom + GAP.section

// MISSION 카드 2장 (dx · dy: 왼쪽 카드 기준으로 옮긴 만큼)
const missions = [
    {
        dx: 0, dy: 0, no: 1, image: 'mission01', imageX: 143, imageY: 2257, title: '생리대 지원', sub: '여성 청소년의 건강한 일상을 지키는 지원 캠페인',
        task: '민감한 주제를 부담없이 전달', direction: ['직설적 표현 보다는 공감과', '배려 중심의 키워드 메세지 설계'],
    },
    {
        dx: 880, dy: -4, no: 2, image: 'page06', imageX: 1026, imageY: 2262, title: '아동결연', sub: '아이들의 오늘과 내일을 함께 만드는 후원 캠페인',
        task: '후원의 의미를 따뜻하게 전달', direction: ['정서적 공감과 신뢰를 높이는', '메세지 구조 제안'],
    },
]

// 주황 곡선 배경 위 전략 카드 3장
const strategies = [
    { x: 38, y: 4030, title: ['Sensitive', 'Communication'], lines: ['민감한 후원 주제를 직접적으로', '드러내기 보다, 공감과 배려를 중심으로', '메세지를 전달했습니다'] },
    { x: 661, y: 3878, title: ['Multi-Channel', 'Campaign'], lines: ['네이버 구글광고, SNS 광고,', '상세페이지까지 일관된 메세지를', '다양한 접점으로 확장했습니다'] },
    { x: 1284, y: 4030, title: ['Participation', 'Idea'], lines: ['단순한 후원 요청을 넘어 실제 후원금', '조성과 참여를 유도할 수 있는', '이벤트 아이디어 3가지를 제안했습니다'] },
]

// 상세페이지 설명 (가운데 정렬 제목 + 설명 줄, part: 1 · 2번째 Key Message)
const notes = [
    { part: 1, x: 458, y: 8812, title: '3. 실제 사례 스토리', lines: ['두 명의 청소년 이야기를 통해', '문제의 현상을 자연스럽게 전달'] },
    { part: 1, x: 1355, y: 8812, title: '4. 지원 내용 소개', lines: ['지원되는 키트 구성과', '실질적인 지원 내용 소개'] },
    { part: 1, x: 458, y: 9612, title: '5. 지원 현황', lines: ['데이터를 통해 후원의 필요성과', '변화를 시작적으로 보여줌'] },
    { part: 1, x: 1355, y: 9612, title: '6. 후원 참여 CTA', lines: ['후원으로 연결되는 명확한 CTA로', '캠페인 마무리'] },
    { part: 2, x: 548, y: 13823, title: '3. 손편지 인터랙션', lines: ['결연 아동의 실제 편지를 통해', '사용자가 더 가까이 공감할 수', '있도록 인터랙션을 구성'] },
    { part: 2, x: 1423, y: 13823, title: '4. 결연 대상 선택', lines: ['대상 선택을 통해 내가 원하는', '아이에게 직접적으로 후원 가능하다'] },
]

// 오른쪽 설명 (번호 제목 + 설명 줄, 왼쪽 정렬)
function Point({ x, y, title, lines }) {
    return (
        <>
            <Text x={x + 10} y={y} size={36} align="left" className="is-title">{title}</Text>
            {lines.map((line, index) => <Text key={line} x={x} y={y + 64 + index * 38} size={28} align="left" className="is-body">{line}</Text>)}
        </>
    )
}

/**
 * 지파운데이션 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 히어로 → PROJECT OVERVIEW → MISSION(캠페인 카드 2장) → 전략 카드 3장
 * → 1. 안녕한 하루(광고 · 상세페이지) → 2. 인생을 바꾸는 결연(광고 · 상세페이지)
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function GFoundationDetail() {
    const d1 = key1.dPage
    const d2 = key2.dPage
    return (
        <div className={`${styles.scope} gf`}>
            <DetailCanvas height={HEIGHT}>
                {/* PROJECT OVERVIEW 손 배경 (히어로 아래 그림자 뒤까지 깐다) */}
                <Pic src={img['background01 (2)']} x={0} y={1180} w={1920} alt="" />

                {/* 히어로 (제목 · 프로젝트 정보 글자는 이미지에 포함), 하트 곡선만 코드로 */}
                <Pic src={img.ThmnailMain} x={0} y={0} w={1920} alt="25-26' 지파운데이션 광고대행 제안서" />
                <Svg>
                    <path
                        d="M90,693 C130,680 170,690 200,688 C150,670 115,620 140,595 C160,575 195,595 205,632 C215,585 260,565 282,590 C300,615 260,670 200,688 C260,695 320,650 360,662 C400,672 430,705 455,716"
                        fill="none" stroke="#f7a21b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
                    />
                </Svg>

                {/* PROJECT OVERVIEW */}
                <Pic src={img.icon01} x={891} y={overview.icon} w={139} alt="" />
                <Text y={overview.label} size={32} className="is-label">PROJECT OVERVIEW</Text>
                <Text y={overview.lines[0]} size={29} className="is-body">지파운데이션 제안서 프로젝트에 참여해 <b>제안서 전반의 디자인을 담당</b>했습니다.</Text>
                <Text y={overview.lines[1]} size={29} className="is-body">기획 초기 단계부터 팀원들과 함께 <b>아이디어 회의에 참여하며 제안 방향과 콘텐츠 구성</b>에 대한 의견을 나누었고,</Text>
                <Text y={overview.lines[2]} size={29} className="is-body">논의된 내용을 바탕으로 <b>핵심 메시지가 효과적으로 전달</b>될 수 있도록 제안서의 시각적 구조와 디자인을 정리했습니다.</Text>

                {/* MISSION (카드 안쪽은 시안 좌표 + dMission) */}
                <Pic src={img.icon01} x={891} y={mission.icon} w={139} alt="" />
                <Text y={mission.label} size={32} className="is-label">MISSION</Text>
                <Text y={mission.sub} size={50} className="is-body">지파운데이션 주력 캠페인 2가지를 이용하여 작업</Text>
                {missions.map(({ dx, dy: cardDy, no, image, imageX, imageY, title, sub, task, direction }) => {
                    const dy = cardDy + dMission
                    return (
                        <Fragment key={no}>
                            <Box x={103 + dx} y={2230 + dMission} w={834} h={1168} className="gf-mission" />
                            <Pic src={img[image]} x={imageX} y={imageY + dMission} w={image === 'mission01' ? 753 : 748} alt={`${title} 캠페인 메인 배너`} />
                            <div className="gf-number" style={{ '--x': 339 + dx, '--y': 2749 + dy }}>{no}</div>
                            <Text x={418 + dx} y={2778 + dy} size={50} align="left" className="is-dark">{title}</Text>
                            <Text x={520 + dx} y={2855 + dy} size={26} className="is-body">{sub}</Text>

                            <Box x={137 + dx} y={2903 + dy} w={766} h={184} className="gf-panel" />
                            <Pic src={img.icon02} x={205 + dx} y={2925 + dy} w={145} alt="" />
                            <Box x={379 + dx} y={2937 + dy} w={1.5} h={113} className="gf-divider" />
                            <Text x={412 + dx} y={2963 + dy} size={34} align="left" className="is-strong">전달과제</Text>
                            <Text x={412 + dx} y={3025 + dy} size={30} align="left" className="is-body">{task}</Text>

                            <Box x={137 + dx} y={3105 + dy} w={766} h={266} className="gf-panel" />
                            <Pic src={img.icon03} x={164 + dx} y={3150 + dy} w={184} alt="" />
                            <Box x={379 + dx} y={3155 + dy} w={1.5} h={167} className="gf-divider" />
                            <Text x={412 + dx} y={3181 + dy} size={34} align="left" className="is-strong">커뮤니케이션 방향</Text>
                            {direction.map((line, index) => (
                                <Text key={line} x={412 + dx} y={3243 + dy + index * 52} size={30} align="left" className="is-body">{line}</Text>
                            ))}
                        </Fragment>
                    )
                })}

                {/* 전략: 전구 · 주황 곡선 배경 · 목업 · 카드 3장 (시안 좌표 + dStrategy) */}
                <Pic src={img.icon04} x={872} y={strategyIcon} w={172} alt="" />
                <Pic src={img['background02 (2)']} x={0} y={4360 + dStrategy} w={1920} className="gf-faded" alt="" />
                <Svg dy={dStrategy}>
                    <path d="M0,4215 Q960,3870 1920,4255 L1920,4670 Q960,4140 0,4600 Z" fill="#f39320" />
                </Svg>
                {strategies.map(({ x, y, title, lines }) => (
                    <Fragment key={x}>
                        <Box x={x} y={y + dStrategy} w={596} h={303} className="gf-card" />
                        {title.map((line, index) => <Text key={line} x={x + 298} y={y + dStrategy + 52 + index * 37} size={34} className="is-en">{line}</Text>)}
                        <Box x={x + 255} y={y + dStrategy + 130} w={86} h={8} className="gf-bar" />
                        {lines.map((line, index) => <Text key={line} x={x + 298} y={y + dStrategy + 182 + index * 35} size={28} className="is-body">{line}</Text>)}
                    </Fragment>
                ))}

                {/* 1. Key Message — 안녕한 하루 */}
                <Text y={key1.label} size={30} className="is-label">1. Key Message</Text>
                <Text y={key1.key} size={80} className="is-key">" 안녕한 하루 "</Text>
                <Text y={key1.lines[0]} size={32} className="is-dark">여성 청소년의 감수성을 반영한 완곡한 표현</Text>
                <Text y={key1.lines[1]} size={32} className="is-dark">생리로 인한 불편함과 불안감을 느끼지 않는 오늘을 반영</Text>
                <Text y={key1.ad} size={34} className="is-body">&lt;네이버 GFA 광고 / INSTAGRAM 광고&gt;</Text>
                <Pic src={img.banner01} x={95} y={key1.banner} w={1730} alt="안녕한 하루 GFA · 인스타그램 배너" />
                <Pic src={img.naver01} x={94} y={key1.naver} w={1730} alt="네이버 메인 · 인스타그램 피드에 들어간 광고" />

                {/* 상세페이지 (시안 좌표 + d1) */}
                <Text y={key1.page} size={34} className="is-body">&lt;상세페이지&gt;</Text>
                <Pic src={img.page01} x={95} y={7224 + d1} w={1001} alt="안녕한 하루 상세페이지 메인 비주얼" />
                <Svg dy={d1}>
                    <polygon points="1096,7432 1365,7397 1365,7590 1096,7548" fill="#9a9a9a" opacity=".8" />
                </Svg>
                <Pic src={img.button01} x={1263} y={7380 + d1} w={208} alt="하루 선물하기 하트 버튼" />
                <Pic src={img.button02} x={1263} y={7637 + d1} w={208} alt="마우스를 올렸을 때 바뀐 하트 버튼" />
                <Point x={1145} y={7240 + d1} title="1. 메인 비주얼" lines={['민감한 주제를 직접적으로 드러내지 않고', '공감할 수 있는 키 메세지로 시작']} />
                <Pic src={img.icon05} x={1488} y={7474 + d1} w={36} alt="" />
                <Text x={1536} y={7492 + d1} size={24} align="left" className="is-body">Sticky 효과</Text>
                <Pic src={img.icon05} x={1488} y={7737 + d1} w={36} alt="" />
                <Text x={1536} y={7755 + d1} size={24} align="left" className="is-body">마우스 hover 시 이미지 변환</Text>
                <Point x={1145} y={7930 + d1} title="2. 버튼 디자인" lines={['따라가는 버튼을 통해 언제든지 후원', '링크 확인 가능']} />
                <Pic src={img.page02} x={95} y={7953 + d1} w={700} alt="실제 사례 스토리" />
                <Pic src={img.page03} x={947} y={8258 + d1} w={809} alt="한 뼘 생리대 키트" />
                <Pic src={img.page04} x={95} y={9038 + d1} w={716} alt="지원 현황 인포그래픽" />
                <Pic src={img.page05} x={947} y={9039 + d1} w={809} alt="캠페인 영상 CTA" />

                {/* 2. Key Message — 인생을 바꾸는 결연 */}
                <Text y={key2.label} size={30} className="is-label">2. Key Message</Text>
                <Text y={key2.key} size={80} className="is-key">" 인생을 바꾸는 결연 "</Text>
                <Text y={key2.lines[0]} size={32} className="is-dark">1:1 결연으로 한 아이의 일상을 변화시키는 힘</Text>
                <Text y={key2.lines[1]} size={32} className="is-dark">후원자에게 책임과 동기 부여를 전달하는 메세지</Text>
                <Text y={key2.ad} size={34} className="is-body">&lt;네이버 GFA 광고 / INSTAGRAM 광고&gt;</Text>
                <Pic src={img.banner02} x={96} y={key2.banner} w={1744} alt="인생을 바꾸는 결연 GFA · 인스타그램 배너" />
                <Pic src={img.naver02} x={96} y={key2.naver} w={1745} alt="네이버 메인 · 인스타그램 피드에 들어간 광고" />

                {/* 상세페이지 (시안 좌표 + d2) */}
                <Text y={key2.page} size={34} className="is-body">&lt;상세페이지&gt;</Text>
                <Pic src={img.page09} x={95} y={12458 + d2} w={1001} alt="인생을 바꾸는 결연 상세페이지 메인 비주얼" />
                <Svg dy={d2}>
                    <polygon points="1050,12840 1320,12808 1290,13000 1050,12955" fill="#9a9a9a" opacity=".8" />
                </Svg>
                <Pic src={img.button03} x={1229} y={12806 + d2} w={353} alt="지금, 후원하기 버튼" />
                <Point x={1145} y={12482 + d2} title="1. 메인 비주얼" lines={['타이포 그래피 중심으로', '직관적으로 전달합니다']} />
                <Point x={1160} y={13093 + d2} title="2. 버튼 디자인" lines={['따라가는 버튼을 통해 언제든지 후원', '링크 확인 가능']} />
                <Pic src={img.page07} x={95} y={13266 + d2} w={825} alt="손편지 인터랙션" />
                <Pic src={img.page08} x={1006} y={13266 + d2} w={824} alt="결연 대상 선택" />

                {/* 상세페이지 설명 (가운데 정렬) */}
                {notes.map(({ part, x, y, title, lines }) => {
                    const top = y + (part === 1 ? d1 : d2)
                    return (
                        <Fragment key={title}>
                            <Text x={x} y={top} size={36} className="is-title">{title}</Text>
                            {lines.map((line, index) => <Text key={line} x={x} y={top + 65 + index * 38} size={30} className="is-body">{line}</Text>)}
                        </Fragment>
                    )
                })}
            </DetailCanvas>
        </div>
    )
}
