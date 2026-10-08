import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './TeenatureDetail.module.scss'

// TEENATURE 폴더의 이미지 (예: img.young01, img.shampoo)
const img = byName(import.meta.glob('../../assets/image/project/TEENATURE/*.png', { eager: true, import: 'default' }))

// 이미지 원본 크기 [너비, 높이] (높이 계산용)
const size = {
    content: [669, 560], targer01: [566, 849], targer02: [539, 808], background022: [1917, 1079],
    shampoo: [583, 826], young01: [459, 650], parent01: [441, 624],
}

// 글자 크기 · 줄 간격
const LABEL = 32 // 섹션 이름 (PROJECT OVERVIEW …)
const HEAD = { size: 66, pitch: 92 } // 섹션 큰 제목
const BODY = { size: 30, pitch: 52 }
const SMALL = { size: 26, pitch: 44 }

// y는 글줄의 세로 가운데. align: left(x가 왼쪽) | center(x가 가운데) | right(x가 오른쪽 끝)
function Text({ x = 960, y, size = 28, align = 'center', className = '', children }) {
    return <p className={`tn-text is-${align} ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

// 네모 상자 (배경색 · 모양은 className으로)
function Box({ x, y, w, h, className = '', style, children }) {
    return <div className={`tn-box ${className}`} style={{ '--x': x, '--y': y, '--w': w, '--h': h, ...style }}>{children}</div>
}

// 섹션 높이에 맞춰 꽉 채우는 배경 사진 (넘치는 부분은 잘린다)
function Bg({ src, y, h }) {
    return <Box x={0} y={y} w={1920} h={h} className="tn-bg" style={{ backgroundImage: `url("${src}")` }} />
}

// 점선 화살표 (dir: left | right)
function Arrow({ x, y, w, dir, color }) {
    const head = dir === 'left' ? 'M14,2 L2,12 L14,22' : `M${w - 14},2 L${w - 2},12 L${w - 14},22`
    return (
        <svg className="tn-arrow" style={{ '--x': x, '--y': y - 12, '--w': w }} viewBox={`0 0 ${w} 24`} aria-hidden="true">
            <line x1="4" y1="12" x2={w - 4} y2="12" stroke={color} strokeWidth="3" strokeDasharray="10 8" />
            <path d={head} fill="none" stroke={color} strokeWidth="3" />
        </svg>
    )
}

// 히어로 프로젝트 정보 (굵은 이름 : 내용)
const infos = [
    ['타입', '광고 대행 제안서'],
    ['클라이언트', '티네이처'],
    ['역할', '기획 : 30% / 디자인 : 100%'],
    ['작업 범위', '아이디어 회의 / 2가지 타겟 설정 / 브랜드 검색'],
    ['사용 프로그램', '포토샵 / 일러스트'],
]

// UNDERSTANDING THE TARGET 3열 (x: 열 가운데)
const columns = [
    { x: 333, title: '01 SELF CARE', sub: <>외모 관리에서 <b>자기 관리로</b></> },
    { x: 960, title: '02 CONTENT', sub: <>콘텐츠가 <b>제품을 발견한다</b></> },
    { x: 1605, title: '03 PURCHASE', sub: <>구매 결정은 <b>부모가 신뢰를 거친다</b></> },
]
const journey = [['icon01', 'SNS 발견'], ['icon02', '관심'], ['icon03', '부모 신뢰'], ['icon04', '구매']]

// 두 타겟 카드
const duals = [
    { x: 473, lines: ['TEENATURE', '청소년', '14 - 25 세'], points: ['SNS 콘텐츠 소비', '새로운 제품에 대한 높은 관심', '재미와 비주얼 중심의 접근'] },
    { x: 1027, lines: ['PARENT', '학부모', '40 - 50 세'], points: ['제품 성분의 안전성', '자녀 관리에 대한 관심', '신뢰할 수 있는 브랜드 정보'] },
]

// CREATIVE STRATEGY 카드 2장 · 키비주얼 설명 2개
const kvCards = [
    { x: 110, tone: 'is-pink', no: 'KV 01', title: 'YOUNG CARE', target: '청소년 타겟', keyword: 'Fun / Trend / Youth', tags: ['SNS 친화적', '트렌디한', '맑고 경쾌한'] },
    { x: 1330, tone: 'is-green', no: 'KV 02', title: 'THE ORIGINAL', target: '학부모 타겟', keyword: 'Trust / Nature / Safety', tags: ['자연 유래', '순한 성분', '신뢰감'] },
]
const kvDetails = [
    {
        image: 'young01', x: 29, w: 443, textX: 523, tone: 'is-pink', title: 'YOUNG & PLAYFUL', target: '청소년 타겟', chips: ['#f47ab4', '#a8e0b8', '#5b8ff0'],
        lines: ['밝은 컬러와 그래픽 요소로', 'SNS에서 쉽게 소비할 수 있는', '캐쥬얼한 비주얼'],
    },
    {
        image: 'parent01', x: 990, w: 441, textX: 1482, tone: 'is-green', title: 'NATURAL & TRUST', target: '학부모 타겟', chips: ['#0d3311', '#d4e6d6', '#ffffff'],
        lines: ['자연 유래 이미지와', '신뢰감을 강조한 그린 컬러와', '자연 소재 중심의 비주얼'],
    },
]

// KEY VISUAL 4장 (너비 459, 사이 10px)
const keyVisuals = [
    { image: 'young01', title: '01 GROWING CARE', lines: ['청소년 성장기를 표현한 Playful Visual'] },
    { image: 'young02', title: '02 DAILY SCENE', lines: ['일상 속 제품 사용 성향을 표현한 캠페인', '비주얼'] },
    { image: 'parent02', title: '03 THE ORIGINAL', lines: ['자연 유래 성분을 강조한 브랜드 비주얼'] },
    { image: 'parent01', title: '04 VARIATION', lines: ['다양한 톤앤무드의 비주얼 확장'] },
]

// 매체 3종 아래 설명 (x: 가운데)
const media = [
    { x: 336, title: 'SNS', sub: 'Instagram / Youtube / Short-form' },
    { x: 960, title: '영상 콘텐츠', sub: 'Influencer / Product Review' },
    { x: 1584, title: '온프라인 매체', sub: 'Bus Shelter / Outdoor Advertisement' },
]

/* 세로 위치: 히어로 아래부터 GAP 간격으로 쌓는다 */
const flow = stack(1209) // 히어로 아래 끝

const overview = { label: flow.text(LABEL, GAP.section), lines: flow.lines(3, BODY.size, BODY.pitch, GAP.title) }

// UNDERSTANDING THE TARGET: 3열은 같은 높이(원그래프 + 설명 2줄)에 맞추고, 나머지 열은 그 세로 가운데에
const understand = { label: flow.text(LABEL, GAP.section), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title) }
understand.colTitle = flow.text(36, GAP.title)
understand.colSub = flow.text(26, GAP.line)
const PIE_HEIGHT = fitHeight(576, size.content)
const COL_HEIGHT = PIE_HEIGHT + GAP.near + SMALL.pitch + SMALL.size * 1.2
understand.top = flow.box(COL_HEIGHT, GAP.near)
understand.pieLines = stack(understand.top + PIE_HEIGHT).lines(2, SMALL.size, SMALL.pitch, GAP.near)
const JOURNEY_HEIGHT = 115 + GAP.line + 30 * 1.2
understand.iconTop = understand.top + (COL_HEIGHT - JOURNEY_HEIGHT) / 2
understand.iconLabel = understand.iconTop + 115 + GAP.line + 30 * 0.6

// 두 타겟: 인물 사진 아래 끝을 맞추고, 카드는 사진 세로 가운데에
const dual = { head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.section), photoTop: flow.box(fitHeight(552, size.targer01), GAP.title) }
const PHOTO_BOTTOM = flow.bottom
const DUAL_PAD = 50
const DUAL_CARD = DUAL_PAD + (2 * 52 + 40 * 1.2) + GAP.near + 4 + GAP.near + (2 * 52 + SMALL.size * 1.2) + DUAL_PAD
const dualCard = stack(dual.photoTop + (PHOTO_BOTTOM - dual.photoTop - DUAL_CARD) / 2)
dual.cardTop = dualCard.bottom
dual.lines = dualCard.lines(3, 40, 52, DUAL_PAD)
dual.bar = dualCard.box(4, GAP.near)
dual.points = dualCard.lines(3, SMALL.size, 52, GAP.near)

// MESSAGE (숲 배경 띠, 안쪽 위 · 아래 여백 GAP.item)
const MESSAGE_TOP = PHOTO_BOTTOM
const message = { label: flow.text(LABEL, GAP.item), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title), lines: flow.lines(2, SMALL.size, 52, GAP.title), title: flow.box(502, GAP.title) }
const MINT_TOP = flow.bottom + GAP.item
flow.skip(MINT_TOP)

// CREATIVE STRATEGY: 카드 2장은 샴푸 이미지 세로 가운데에
const strategy = { label: flow.text(LABEL, GAP.item), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title) }
const SHAMPOO_HEIGHT = fitHeight(460, size.shampoo)
strategy.rowTop = flow.box(SHAMPOO_HEIGHT, GAP.title)
const KV_PAD = 60
const kvCard = stack(0)
const kvCardPos = {
    no: kvCard.text(26, KV_PAD), title: kvCard.text(44, GAP.near), target: kvCard.text(32, GAP.line), keyword: kvCard.text(28, GAP.line), tags: kvCard.box(52, GAP.near) + 26,
}
const KV_CARD_HEIGHT = kvCard.bottom + KV_PAD
strategy.cardTop = strategy.rowTop + (SHAMPOO_HEIGHT - KV_CARD_HEIGHT) / 2

// 키비주얼 설명 2개: 글 묶음은 이미지 세로 가운데에
const KV_IMAGE = fitHeight(443, size.young01)
strategy.detailTop = flow.box(KV_IMAGE, GAP.item)
const detailText = stack(0)
const detailPos = { title: detailText.text(46), target: detailText.text(34, GAP.line), chips: detailText.box(78, GAP.near), lines: detailText.lines(3, 28, 52, GAP.near) }
const detailOffset = strategy.detailTop + (KV_IMAGE - detailText.bottom) / 2

// KEY VISUAL
const keyVisual = { label: flow.text(LABEL, GAP.section), top: flow.box(650, GAP.title), title: flow.text(36, GAP.near), lines: flow.lines(2, SMALL.size, 40, GAP.line) }

// 다양한 매체: 이미지 묶음(시안 기준 위 끝 = 브랜드 검색 위 끝, 아래 끝 = 버스 쉘터 아래 끝)
const mediaSection = { head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.section), lines: flow.lines(2, SMALL.size, 52, GAP.title), top: flow.box(56 + 715, GAP.title) }
mediaSection.title = flow.text(36, GAP.near)
mediaSection.sub = flow.text(SMALL.size, GAP.line)
const HEIGHT = flow.bottom + GAP.section

/**
 * 티네이처 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 히어로 → PROJECT OVERVIEW → UNDERSTANDING THE TARGET(3열) → 두 타겟(청소년 · 학부모) → MESSAGE
 * → CREATIVE STRATEGY(KV 01 · 02) → KEY VISUAL 4장 → 다양한 매체
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function TeenatureDetail() {
    const s = strategy
    return (
        <div className={`${styles.scope} tn`}>
            <DetailCanvas height={HEIGHT}>
                {/* 배경: 잎 사진 → 두 타겟 사진 배경 → 숲(MESSAGE) → 민트색 */}
                <Pic src={img.background011} x={0} y={1209} w={1920} alt="" />
                <Pic src={img.background022} x={0} y={PHOTO_BOTTOM - fitHeight(1920, size.background022)} w={1920} alt="" />
                <Bg src={img.background033} y={MESSAGE_TOP} h={MINT_TOP - MESSAGE_TOP} />
                <Box x={0} y={MINT_TOP} w={1920} h={HEIGHT - MINT_TOP} className="tn-mint" />

                {/* 히어로 */}
                <Pic src={img.mainBackground} x={0} y={0} w={1920} alt="잎 그림이 있는 초록 배경" />
                {['Teenature', '청소년 샴푸', '기획서'].map((line, index) => (
                    <Text key={line} x={1744} y={272 + index * 108} size={76} align="right" className="is-hero">{line}</Text>
                ))}
                {infos.map(([label, value], index) => (
                    <Text key={label} x={88} y={784 + index * 80} size={30} align="left" className="is-info"><b>{label} : </b>{value}</Text>
                ))}

                {/* PROJECT OVERVIEW */}
                <Text y={overview.label} size={LABEL} className="is-label">PROJECT OVERVIEW</Text>
                <Text y={overview.lines[0]} size={BODY.size} className="is-body">청소년의 두피 고민을 <b>새로운 소비자 접점으로 확장</b>하기 위해</Text>
                <Text y={overview.lines[1]} size={BODY.size} className="is-body">타깃의 <b>소비 행동과 콘텐츠 이용 패턴을 분석</b>하고,</Text>
                <Text y={overview.lines[2]} size={BODY.size} className="is-body">이를 기반으로 티네이처의 캠페인 메시지와 비주얼 방향을 제안했습니다.</Text>

                {/* UNDERSTANDING THE TARGET */}
                <Text y={understand.label} size={LABEL} className="is-label">UNDERSTANDING THE TARGET</Text>
                <Text y={understand.head[0]} size={HEAD.size} className="is-head">청소년은 콘텐츠로 발견하고,</Text>
                <Text y={understand.head[1]} size={HEAD.size} className="is-head">부모의 신뢰를 거쳐 구매한다.</Text>
                {[647, 1283].map((x) => (
                    <Box key={x} x={x} y={understand.colTitle - 21.6} w={2} h={understand.top + COL_HEIGHT - understand.colTitle + 21.6} className="tn-dotted" />
                ))}
                {columns.map(({ x, title, sub }) => (
                    <Fragment key={title}>
                        <Text x={x} y={understand.colTitle} size={36} className="is-strong">{title}</Text>
                        <Text x={x} y={understand.colSub} size={26} className="is-body">{sub}</Text>
                    </Fragment>
                ))}
                <Pic src={img.selfCare} x={83} y={understand.top + (COL_HEIGHT - 500) / 2} w={500} alt="외모 관리에서 자기 관리를 확장하는 청소년 소비 트렌드" />
                <Pic src={img.content} x={688} y={understand.top} w={576} alt="MZ 세대가 느끼는 인플루언서의 영향력 원그래프" />
                <Text y={understand.pieLines[0]} size={SMALL.size} className="is-dark">MZ 세대가 느끼는</Text>
                <Text y={understand.pieLines[1]} size={SMALL.size} className="is-dark">인플루언서의 영향력</Text>
                {journey.map(([icon, label], index) => {
                    const x = 1336 + index * 140
                    return (
                        <Fragment key={icon}>
                            <Pic src={img[icon]} x={x} y={understand.iconTop} w={115} alt="" />
                            <Text x={x + 57.5} y={understand.iconLabel} size={30} className="is-dark">{label}</Text>
                            {index > 0 && <Text x={x - 12.5} y={understand.iconTop + 57.5} size={22} className="is-body">→</Text>}
                        </Fragment>
                    )
                })}

                {/* 두 타겟 */}
                <Text y={dual.head[0]} size={HEAD.size} className="is-head">청소년과 학부모,</Text>
                <Text y={dual.head[1]} size={HEAD.size} className="is-head">두 타겟을 동시에 연결하는 캠페인</Text>
                <Pic src={img.targer01} x={112} y={PHOTO_BOTTOM - fitHeight(552, size.targer01)} w={552} alt="하늘을 올려다보는 청소년" />
                <Pic src={img.targer02} x={1320} y={PHOTO_BOTTOM - fitHeight(539, size.targer02)} w={539} alt="미소 짓는 학부모" />
                {duals.map(({ x, lines, points }) => (
                    <Fragment key={lines[0]}>
                        <Box x={x} y={dual.cardTop} w={420} h={DUAL_CARD} className="tn-glass" />
                        {lines.map((line, index) => <Text key={line} x={x + 210} y={dual.lines[index]} size={40} className="is-strong">{line}</Text>)}
                        <Box x={x + 182} y={dual.bar} w={56} h={4} className="tn-bar" />
                        {points.map((point, index) => <Text key={point} x={x + 42} y={dual.points[index]} size={SMALL.size} align="left" className="is-body">⊙ {point}</Text>)}
                    </Fragment>
                ))}
                <svg className="tn-cross" style={{ '--x': 925, '--y': dual.cardTop + DUAL_CARD / 2 - 35 }} viewBox="0 0 70 70" aria-hidden="true">
                    <path d="M2,2 L68,68 M68,2 L2,68" stroke="#2a5534" strokeWidth="3" />
                </svg>

                {/* MESSAGE */}
                <Pic src={img.bubble} x={1296} y={MESSAGE_TOP + 80} w={160} alt="" />
                <Pic src={img.bubble} x={1640} y={MESSAGE_TOP + 290} w={340} alt="" />
                <Pic src={img.bubble} x={-60} y={MESSAGE_TOP + 740} w={300} alt="" />
                <Text y={message.label} size={LABEL} className="is-label">MESSAGE</Text>
                <Text y={message.head[0]} size={HEAD.size} className="is-head">청소년 샴푸의 필요성을</Text>
                <Text y={message.head[1]} size={HEAD.size} className="is-head">명확하게 인지시켜주자!</Text>
                <Text y={message.lines[0]} size={SMALL.size} className="is-body">청소년에게는 <b>새로운 자기관리 제품</b>으로,</Text>
                <Text y={message.lines[1]} size={SMALL.size} className="is-body">부모에게는 <b>필요한 관리 제품</b>으로 인식 시키는 것</Text>
                <Pic src={img.title} x={213} y={message.title} w={1493} alt="청소년 전용 두피 케어" />

                {/* CREATIVE STRATEGY */}
                <Text y={s.label} size={LABEL} className="is-label">CREATIVE STRATEGY</Text>
                <Text y={s.head[0]} size={HEAD.size} className="is-head">하나의 제품으로</Text>
                <Text y={s.head[1]} size={HEAD.size} className="is-head">두가지 크리에이티브로 확장</Text>
                <Pic src={img.leaf} x={1340} y={s.head[1] - 130} w={220} alt="" />
                {kvCards.map(({ x, tone, no, title, target, keyword, tags }) => (
                    <Fragment key={no}>
                        <Box x={x} y={s.cardTop} w={480} h={KV_CARD_HEIGHT} className={`tn-kv ${tone}`} />
                        <Text x={x + 240} y={s.cardTop + kvCardPos.no} size={26} className="is-body">{no}</Text>
                        <Text x={x + 240} y={s.cardTop + kvCardPos.title} size={44} className={`is-tone is-bold ${tone}`}>{title}</Text>
                        <Text x={x + 240} y={s.cardTop + kvCardPos.target} size={32} className={`is-tone ${tone}`}>{target}</Text>
                        <Text x={x + 240} y={s.cardTop + kvCardPos.keyword} size={28} className={`is-tone is-bold ${tone}`}>{keyword}</Text>
                        <ul className={`tn-tags ${tone}`} style={{ '--x': x + 240, '--y': s.cardTop + kvCardPos.tags }}>
                            {tags.map((tag) => <li key={tag}>{tag}</li>)}
                        </ul>
                    </Fragment>
                ))}
                <Pic src={img.shampoo} x={730} y={s.rowTop} w={460} alt="티네이처 더 오리지널 샴푸" />
                <Arrow x={613} y={s.cardTop + KV_CARD_HEIGHT / 2} w={142} dir="left" color="#d0386a" />
                <Arrow x={1188} y={s.cardTop + KV_CARD_HEIGHT / 2} w={142} dir="right" color="#24452c" />

                {kvDetails.map(({ image, x, w, textX, tone, title, target, chips, lines }) => (
                    <Fragment key={title}>
                        <Pic src={img[image]} x={x} y={s.detailTop} w={w} alt={`${title} 키비주얼`} />
                        <Text x={textX} y={detailOffset + detailPos.title} size={46} align="left" className={`is-tone is-bold ${tone}`}>{title}</Text>
                        <Text x={textX} y={detailOffset + detailPos.target} size={34} align="left" className={`is-tone ${tone}`}>{target}</Text>
                        {chips.map((color, index) => (
                            <Box key={color} x={textX + index * 93} y={detailOffset + detailPos.chips} w={78} h={78} className="tn-chip" style={{ '--color': color }} />
                        ))}
                        {lines.map((line, index) => <Text key={line} x={textX} y={detailOffset + detailPos.lines[index]} size={28} align="left" className="is-body">{line}</Text>)}
                    </Fragment>
                ))}

                {/* KEY VISUAL */}
                <Text y={keyVisual.label} size={LABEL} className="is-label">KEY VISUAL</Text>
                {keyVisuals.map(({ image, title, lines }, index) => {
                    const x = 27 + index * 469
                    return (
                        <Fragment key={title}>
                            <Pic src={img[image]} x={x} y={keyVisual.top} w={459} alt={`${title} 키비주얼`} />
                            <Text x={x} y={keyVisual.title} size={36} align="left" className="is-strong">{title}</Text>
                            {lines.map((line, lineIndex) => <Text key={line} x={x} y={keyVisual.lines[lineIndex]} size={SMALL.size} align="left" className="is-body">{line}</Text>)}
                        </Fragment>
                    )
                })}

                {/* 다양한 매체 (묶음 위 끝 기준: 버스 쉘터 +56, 인플루언서 +133, SNS +189) */}
                <Text y={mediaSection.head[0]} size={HEAD.size} className="is-head">다양한 매체에서</Text>
                <Text y={mediaSection.head[1]} size={HEAD.size} className="is-head">일관된 브랜드 경험 전달</Text>
                <Text y={mediaSection.lines[0]} size={SMALL.size} className="is-body">Key Visual이 온라인과 오프라인에서도</Text>
                <Text y={mediaSection.lines[1]} size={SMALL.size} className="is-body"><b>동일한 브랜드 경험을 전달할 수 있도록 확장</b>했습니다</Text>
                <Pic src={img.busShelter} x={1187} y={mediaSection.top + 56} w={1017} alt="버스 쉘터 옥외 광고" />
                <Pic src={img.Influencer} x={533} y={mediaSection.top + 133} w={776} alt="인플루언서 유튜브 리뷰 영상" />
                <Pic src={img.brandSearch} x={355} y={mediaSection.top} w={470} alt="티네이처 브랜드 검색 광고" />
                <Pic src={img.sns} x={56} y={mediaSection.top + 189} w={448} alt="인스타그램 · 쇼츠 화면" />
                {media.map(({ x, title, sub }) => (
                    <Fragment key={title}>
                        <Text x={x} y={mediaSection.title} size={36} className="is-strong">{title}</Text>
                        <Text x={x} y={mediaSection.sub} size={SMALL.size} className="is-body">{sub}</Text>
                    </Fragment>
                ))}
            </DetailCanvas>
        </div>
    )
}
