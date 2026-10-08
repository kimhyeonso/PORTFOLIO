import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './KwangwoonDetail.module.scss'

// UNIVERSE 폴더의 이미지 (예: img.A, img.mainBackground)
const img = byName(import.meta.glob('../../assets/image/project/UNIVERSE/*.png', { eager: true, import: 'default' }))

// 이미지 원본 크기 [너비, 높이] (높이 계산용)
const size = { mainBackground: [1920, 1209], A: [706, 998], B: [569, 805], C: [1140, 806], sns: [1746, 930] }

// 글자 크기 · 줄 간격
const LABEL = 30
const BODY = { size: 30, pitch: 53 }
const TAG_HEIGHT = 24 * 1.2 + 20 // 태그 글줄 + 위아래 안쪽 여백

// y는 글줄의 세로 가운데. align: left(x가 왼쪽) | center(x가 가운데)
function Text({ x = 960, y, size = 28, align = 'center', className = '', children }) {
    return <p className={`kw-text is-${align} ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

// 키워드 태그 묶음 (y는 세로 가운데)
function Tags({ x = 960, y, align = 'center', items }) {
    return (
        <ul className={`kw-tags is-${align}`} style={{ '--x': x, '--y': y }}>
            {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
    )
}

// 히어로 프로젝트 정보 (굵은 이름 : 내용)
const infos = [
    { y: 781, label: '타입', value: '광고 대행 제안서' },
    { y: 857, label: '클라이언트', value: '광운대학교' },
    { y: 938, label: '역할', value: '기획 : 20% / 디자인 : 100%' },
    { y: 1019, label: '작업 범위', value: '아이디어 회의 / 3가지 키비주얼 / 목업' },
    { y: 1098, label: '사용 프로그램', value: '포토샵 / 일러스트' },
]

// DESIGN CONCEPT 아이콘 3개 (x는 가운데)
const concepts = [
    { x: 394, icon: 'icon01', title: 'SYMBOL', lines: ['학교의 상징성과', '도전 정신'] },
    { x: 933, icon: 'icon02', title: 'IT IDENTITY', lines: ['미래 지향적', 'IT 경쟁력'], navy: true },
    { x: 1499, icon: 'icon03', title: 'CAMPUS IDENTITY', lines: ['캠퍼스는 고유한', '장소성과 역사'] },
]

const aLines = [
    '2026의 숫자 26을 ‘이륙’이라는 의미로 해석하여,',
    '광운의 하늘을 힘차게 날아오르는 비마(페가수스)의 모습을 통해',
    '새로운 시작과 도전, 무한한 가능성을 향해 나가는',
    '신입생들의 이야기를 시각화한 메인 콘셉입니다',
]

// B안 · C안 설명 (x는 가운데)
const plans = [
    {
        x: 374, title: 'B안. 광운의 DNA', tags: ['IT', 'DNA', '디지털', '혁신', '미래'],
        lines: ['광운 대학교의 강한 IT 경쟁력을', 'DNA라는 키워드로 시각화하여,', '기술과 혁신으로 진화하는 미래 대학의', '이미지를 표현하였습니다.'],
    },
    {
        x: 1261, title: 'C안. 기술로 쌓아온 광운의 시간', tags: ['캠퍼스', '역사', '장소성', '아이덴티티'],
        lines: ['광운 대학교의 대표 건물과 캠퍼스의 역사를 통해', '학교의 정체성과 전통을 시각화하고, 광운에서의', '특별한 경험과 성장의 시간을 담아냈습니다'],
    },
]

// 세로 위치: 위에서부터 GAP 간격으로 쌓는다
const flow = stack(fitHeight(1920, size.mainBackground))

const overview = { label: flow.text(LABEL, GAP.section), lines: flow.lines(2, BODY.size, BODY.pitch, GAP.title) }

const concept = { label: flow.text(LABEL, GAP.section), quote: flow.lines(2, 66, 93, GAP.title), iconTop: flow.box(245, GAP.item) }
concept.title = flow.text(33, GAP.near)
concept.lines = flow.lines(2, 25, 36, GAP.line)

// A안: 왼쪽 포스터, 오른쪽 글 묶음(포스터 위 끝부터 GAP.title 간격으로)
const design = { label: flow.text(LABEL, GAP.section) }
const aTop = flow.box(fitHeight(708, size.A), GAP.title)
const aText = stack(aTop)
const a = {
    title: aText.text(64),
    slogan: aText.lines(2, 42, 59, GAP.title),
    lines: aText.lines(aLines.length, 28, 52, GAP.title),
    tags: aText.box(TAG_HEIGHT, GAP.title) + TAG_HEIGHT / 2,
}

// B안 · C안: 이미지 아래에 제목 → 선 → 설명 → 태그
const bcTop = flow.box(Math.max(fitHeight(566, size.B), fitHeight(1139, size.C)), GAP.item)
const bcBottom = flow.bottom
const planPos = plans.map(({ lines }) => {
    const col = stack(bcBottom)
    const pos = { title: col.text(42, GAP.near), bar: col.box(6, GAP.line), lines: col.lines(lines.length, 26, 37, GAP.line) }
    pos.tags = col.box(TAG_HEIGHT, GAP.title) + TAG_HEIGHT / 2
    return { pos, bottom: col.bottom }
})
flow.skip(Math.max(...planPos.map(({ bottom }) => bottom)))

const mockup = { label: flow.text(LABEL, GAP.section), top: flow.box(fitHeight(1746, size.sns), GAP.title) }
const HEIGHT = flow.bottom + GAP.section

/**
 * 광운대학교 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 히어로 → PROJECT OVERVIEW → DESIGN CONCEPT(아이콘 3개) → DESIGN(A안 · B안 · C안) → A시안 MOCKUP
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function KwangwoonDetail() {
    return (
        <div className={`${styles.scope} kw`}>
            <DetailCanvas height={HEIGHT}>
                {/* 히어로 */}
                <Pic src={img.mainBackground} x={0} y={0} w={1920} alt="광운대학교 캠퍼스 건물" />
                <Text x={83} y={146} size={70} align="left" className="is-hero">광운대학교</Text>
                <Text x={83} y={228} size={46} align="left" className="is-hero-sub">2026년 신입생 모집 제안</Text>
                {infos.map(({ y, label, value }) => (
                    <Text key={label} x={83} y={y} size={32} align="left" className="is-info"><b>{label} :</b> {value}</Text>
                ))}

                {/* PROJECT OVERVIEW */}
                <Text y={overview.label} size={LABEL} className="is-label">PROJECT OVERVIEW</Text>
                <Text y={overview.lines[0]} size={BODY.size} className="is-body"><b>학교의 상징성, IT 경쟁력, 캠퍼스 정체성</b>을 바탕으로</Text>
                <Text y={overview.lines[1]} size={BODY.size} className="is-body"><b>3가지 비주얼 방향을 제안</b>한 입시 홍보 프로젝트</Text>

                {/* DESIGN CONCEPT */}
                <Text y={concept.label} size={LABEL} className="is-label">DESIGN CONCEPT</Text>
                <Text y={concept.quote[0]} size={66} className="is-quote">“광운대학교를 어떤 이미지로</Text>
                <Text y={concept.quote[1]} size={66} className="is-quote">기억하게 할 것인가?”</Text>
                {concepts.map(({ x, icon, title, lines, navy }) => (
                    <Fragment key={title}>
                        <Pic src={img[icon]} x={x - 122.5} y={concept.iconTop} w={245} alt="" />
                        <Text x={x} y={concept.title} size={33} className={`is-concept ${navy ? 'is-navy' : ''}`}>{title}</Text>
                        {lines.map((line, index) => <Text key={line} x={x} y={concept.lines[index]} size={25} className="is-body">{line}</Text>)}
                    </Fragment>
                ))}

                {/* DESIGN — A안 */}
                <Text y={design.label} size={LABEL} className="is-label">DESIGN</Text>
                <Pic src={img.A} x={89} y={aTop} w={708} alt="A안 비마 키비주얼 포스터" />
                <Text x={861} y={a.title} size={64} align="left" className="is-plan">A안. 비마를 활용</Text>
                <Text x={900} y={a.slogan[0]} size={42} align="left" className="is-slogan">26, 이륙</Text>
                <Text x={900} y={a.slogan[1]} size={42} align="left" className="is-slogan">광운의 하늘로, 광운의 미래로</Text>
                {aLines.map((line, index) => <Text key={line} x={900} y={a.lines[index]} size={28} align="left" className="is-body">{line}</Text>)}
                <Tags x={900} y={a.tags} align="left" items={['상징성', '도전', '미래', '청춘']} />

                {/* DESIGN — B안 · C안 */}
                <Pic src={img.B} x={89} y={bcTop} w={566} alt="B안 광운의 DNA 키비주얼 포스터" />
                <Pic src={img.C} x={692} y={bcTop} w={1139} alt="C안 기술로 쌓아온 광운의 시간 키비주얼" />
                {plans.map(({ x, title, lines, tags }, planIndex) => {
                    const { pos } = planPos[planIndex]
                    return (
                        <Fragment key={title}>
                            <Text x={x} y={pos.title} size={42} className="is-plan-sm">{title}</Text>
                            <div className="kw-bar" style={{ '--x': x - 40, '--y': pos.bar }} />
                            {lines.map((line, index) => <Text key={line} x={x} y={pos.lines[index]} size={26} className="is-body">{line}</Text>)}
                            <Tags x={x} y={pos.tags} items={tags} />
                        </Fragment>
                    )
                })}

                {/* A시안 MOCKUP */}
                <Text y={mockup.label} size={LABEL} className="is-label">A시안 MOCKUP</Text>
                <Pic src={img.sns} x={89} y={mockup.top} w={1746} alt="네이버 배너 · 인스타그램 피드 · 옥외 광고에 들어간 A안 목업" />
            </DetailCanvas>
        </div>
    )
}
