import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './HanwooDetail.module.scss'

// HANWOO 폴더의 이미지 (예: img.mainKey01, img.subKey01)
const img = byName(import.meta.glob('../../assets/image/project/HANWOO/*.png', { eager: true, import: 'default' }))

// 이미지 원본 크기 [너비, 높이] (높이 계산용)
const size = {
    hanurang01: [542, 613], hanurang02: [306, 391], background011: [1920, 1055], background022: [1920, 1083],
    sms: [421, 719], lms: [320, 635], sns: [635, 551], influencer: [310, 554], digital04: [1095, 718],
}

// 글자 크기 · 줄 간격
const LABEL = 32 // 섹션 이름 (PROJECT OVERVIEW …)
const HEAD = { size: 64, pitch: 88 } // 섹션 큰 제목
const BODY = { size: 30, pitch: 52 }
const CAPTION = { title: 36, body: 26, pitch: 44 } // 이미지 아래 제목 · 설명

// y는 글줄의 세로 가운데. align: left(x가 왼쪽) | center(x가 가운데)
function Text({ x = 960, y, size = 28, align = 'center', className = '', children }) {
    return <p className={`hw-text is-${align} ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

// 네모 상자 (배경색 · 모양은 className으로)
function Box({ x, y, w, h, className = '', children }) {
    return <div className={`hw-box ${className}`} style={{ '--x': x, '--y': y, '--w': w, '--h': h }}>{children}</div>
}

// 히어로 프로젝트 정보 (굵은 이름 : 내용, 이름이 없으면 윗줄에 이어지는 내용)
const infos = [
    { label: '타입', value: '광고 대행 제안서' },
    { label: '클라이언트', value: '한우 자조금 관리위원회' },
    { label: '역할', value: '기획 : 45% / 디자인 : 100%' },
    { label: '작업 범위', value: '아이디어 회의 / 4가지 키워드 도출 / 4가지 키워드 키비주얼 제작' },
    { value: '네이버 GFA / 구글 GNB / SNS 광고 디자인 / 브랜드 검색 / 제안서 ppt 작성' },
    { label: '사용 프로그램', value: '포토샵 / 일러스트 / 파워포인트 / 재미나이' },
]

// TARGET 카드 2장
const targets = [
    { x: 155, title: '2030세대', sub: '일상 속 경험을 중시하는 디지털 네이티브', photo: 'target01', icons: ['icon01', 'icon02', 'icon03', 'icon04'], lines: ['일상성 가벼운 소비', '디지털 진화', '공유 가능한 경험', '가볍고 재미있는 접근'] },
    { x: 975, title: '4050세대', sub: '신뢰와 가치를 중시하는 실속 소비층', photo: 'target02', icons: ['icon05', 'icon06', 'icon07', 'icon08'], lines: ['품질과 안전성', '정보 탐색 후 구매', '실속과 가치 중심', '가족을 위한 선택'] },
]

// MESSAGE 기존 → 변경 사진 2장
const messages = [
    { x: 211, image: 'message01', top: '기존', title: '명절 특별식', bottom: '고급 식재료' },
    { x: 1091, image: 'message02', top: '변경', title: '일상의 선택', bottom: '누구나 즐기는 한우 가까운 일상식' },
]

// MAIN KEY VISUAL 오른쪽: 컬러칩 · 키워드
const colors = ['#3d2314', '#6e0b0b', '#fbdca7', '#e9e9e1']
const keywords = [['EveryDay', '일상에 식탁에서'], ['Premium', '변하지 않는 한우의 가치로'], ['Seasonal', '계절마다 새롭게']]

// FOUR SURPRISE CONCEPT 포스터 4장 (너비 442 · 452, 사이 12px)
const surprises = [
    { x: 53, w: 442, image: 'subKey01', title: '01 설날', desc: '새해의 시작을 특별하게 채우는 한우' },
    { x: 507, w: 452, image: 'subKey02', title: '02 가정의 달', desc: '소중한 사람과 함께 나누는 따뜻한 한우' },
    { x: 971, w: 442, image: 'subKey03', title: '03 추석', desc: '풍성한 명절의 마음을 담아 전하는 한우' },
    { x: 1425, w: 442, image: 'subKey04', title: '04 한우먹는 날', desc: '한우를 가장 즐겁고 특별하게 만나는 하루' },
]

// DIGITAL 1: 아래 끝을 맞춰 놓는 4가지 매체 (sms.png = 인스타그램 화면, sns.png = 모니터 광고)
const channels = [
    { x: 80, w: 376, image: 'sms', title: '01 SNS', desc: '일상의 순간을 담은 콘텐츠' },
    { x: 501, w: 307, image: 'lms', title: '02 LMS', desc: '한우 혜택 이벤트 등의 광고 문자' },
    { x: 843, w: 629, image: 'sns', title: '03 Advertisement', desc: '한우먹는 날 시즌 별 광고' },
    { x: 1517, w: 307, image: 'influencer', title: '04 Influencer', desc: '인플루언서 협업 콘텐츠' },
]

// DIGITAL 2: 폰 화면 2장 (높이 741, cx: 아래 글 가운데)
const contents = [
    { x: 304, w: 658, image: 'digital01', cx: 525, title: '월간 우리', lines: ['한달 마다 한우의 이야기를 담은', '에디토리얼 콘텐츠'] },
    { x: 1120, w: 667, image: 'digital02', cx: 1400, title: '인스타툰', lines: ['일상 속 한우를 공감있게 풀어낸', '스토리텔링형 콘텐츠'] },
]

/* 세로 위치: 히어로 아래부터 GAP 간격으로 쌓는다 */
const flow = stack(1209) // 히어로 아래 끝

// PROJECT OVERVIEW: 캐릭터 → 이름 → 본문
const overview = { icon: flow.box(fitHeight(240, size.hanurang02), GAP.section), label: flow.text(LABEL, GAP.near), lines: flow.lines(3, BODY.size, BODY.pitch, GAP.title) }

// TARGET: 카드 안은 안쪽 여백 70 → 세대 → 설명 → 사진 · 목록 → 안쪽 여백 70
const target = { label: flow.text(LABEL, GAP.section), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title) }
const CARD = { w: 790, pad: 70, photo: 276, icon: 50 }
const card = stack(flow.bottom + GAP.title)
const cardTop = card.bottom
Object.assign(CARD, { top: cardTop, title: card.text(48, CARD.pad), sub: card.text(28, GAP.line), photoTop: card.box(CARD.photo, GAP.near) })
CARD.height = card.bottom + CARD.pad - cardTop
const rowPitch = (CARD.photo - CARD.icon) / 3 // 아이콘 4줄을 사진 높이에 고르게
flow.skip(cardTop + CARD.height)

// 고기 배경: 카드 아래로 GAP.item만큼 더 깔고, 여기서 크림색 배경이 시작된다
const CREAM_TOP = flow.bottom + GAP.item
flow.skip(CREAM_TOP)

// MESSAGE: 사진 안 글 3줄은 사진 세로 가운데에
const message = { label: flow.text(LABEL, GAP.item), head: flow.text(80, GAP.title), top: flow.box(489, GAP.title) }
const inPhoto = stack(message.top + (489 - (26 * 1.2 * 2 + 42 * 1.2 + GAP.line * 2)) / 2)
message.lines = [inPhoto.text(26), inPhoto.text(42, GAP.line), inPhoto.text(26, GAP.line)]

// MAIN KEY VISUAL: 포스터 2장 옆 오른쪽 묶음은 포스터 높이의 세로 가운데에
const keyVisual = { label: flow.text(LABEL, GAP.section), first: flow.text(64, GAP.title), brush: flow.box(188, GAP.line), top: flow.box(754, GAP.title) }
const PILL = 64
const KV_COLUMN = 100 + GAP.title + (2 * BODY.pitch + BODY.size * 1.2) + GAP.near + (3 * PILL + 2 * GAP.line)
const kvColumn = stack(keyVisual.top + (754 - KV_COLUMN) / 2)
keyVisual.chips = kvColumn.box(100)
keyVisual.lines = kvColumn.lines(3, BODY.size, BODY.pitch, GAP.title)
keyVisual.pills = keywords.map((_, index) => kvColumn.box(PILL, index === 0 ? GAP.near : GAP.line))

// FOUR SURPRISE CONCEPT
const surprise = {
    label: flow.text(LABEL, GAP.section), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title),
    top: flow.box(625, GAP.title), title: flow.text(34, GAP.near), desc: flow.text(25, GAP.line),
}

// DIGITAL / CONTENT APPLICATION 1: 매체 이미지는 아래 끝을 맞춘다
const channelHeights = channels.map(({ w, image }) => fitHeight(w, size[image]))
const channel = { label: flow.text(LABEL, GAP.section), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title) }
channel.bottom = flow.box(Math.max(...channelHeights), GAP.title) + Math.max(...channelHeights)
channel.title = flow.text(CAPTION.title, GAP.near)
channel.desc = flow.text(CAPTION.body, GAP.line)

// DIGITAL / CONTENT APPLICATION 2: 폰 화면 2장 → 숏폼 · 유튜브
const content = {
    label: flow.text(LABEL, GAP.section), head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.title),
    top: flow.box(741, GAP.title), title: flow.text(CAPTION.title, GAP.near), lines: flow.lines(2, CAPTION.body, CAPTION.pitch, GAP.line),
}
const video = {
    top: flow.box(Math.max(490, fitHeight(790, size.digital04)), GAP.item),
    title: flow.text(CAPTION.title, GAP.near), lines: flow.lines(2, CAPTION.body, CAPTION.pitch, GAP.line),
}
const HEIGHT = flow.bottom + GAP.section

/**
 * 한우자조금 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 히어로 → PROJECT OVERVIEW → TARGET(세대별 카드 2장) → MESSAGE(기존 → 변경) → MAIN KEY VISUAL
 * → FOUR SURPRISE CONCEPT(포스터 4장) → DIGITAL / CONTENT APPLICATION(매체 4종 · 콘텐츠)
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function HanwooDetail() {
    return (
        <div className={`${styles.scope} hw`}>
            <DetailCanvas height={HEIGHT}>
                {/* 배경: 고기 사진(TARGET) → 크림색 + 산수화(MESSAGE) */}
                <Pic src={img.background011} x={0} y={CREAM_TOP - size.background011[1]} w={1920} alt="" />
                <Box x={0} y={CREAM_TOP} w={1920} h={HEIGHT - CREAM_TOP} className="hw-cream" />
                <Pic src={img.background022} x={0} y={CREAM_TOP} w={1920} alt="" />

                {/* 히어로 */}
                <Pic src={img.mainBackground} x={0} y={0} w={1920} alt="한우를 함께 먹으며 웃는 두 사람" />
                <Text x={88} y={216} size={44} align="left" className="is-hero">한우 자조금 관리위원회 제안서</Text>
                <Pic src={img.typo01} x={85} y={285} w={1036} alt="한우로 채우다" />
                {infos.map(({ label, value }, index) => (
                    <Text key={value} x={88} y={701 + index * 80} size={30} align="left" className="is-info">
                        {label && <b>{label} : </b>}{value}
                    </Text>
                ))}
                <Pic src={img.hanurang01} x={1420} y={640} w={440} alt="한우 캐릭터 한우랑" />

                {/* PROJECT OVERVIEW */}
                <Pic src={img.hanurang02} x={840} y={overview.icon} w={240} alt="" />
                <Text y={overview.label} size={LABEL} className="is-label">PROJECT OVERVIEW</Text>
                <Text y={overview.lines[0]} size={BODY.size} className="is-body">한우는 여전히 특별한 날에만 떠올리는 프리미엄 식품으로 인식되고 있습니다.</Text>
                <Text y={overview.lines[1]} size={BODY.size} className="is-body">본 프로젝트는 한<b>우의 높은 구매 전환에도 비해 낮은 브랜드 인지도의 문제를 해결</b>하고,</Text>
                <Text y={overview.lines[2]} size={BODY.size} className="is-body">한우를 <b>우리 모두의 일상 속 선택지로 확장하기 위한 통합 캠페인</b> 제안 입니다</Text>

                {/* TARGET */}
                <Text y={target.label} size={LABEL} className="is-label">TARGET</Text>
                <Text y={target.head[0]} size={HEAD.size} className="is-head">세대별 소비 특성과 니즈,</Text>
                <Text y={target.head[1]} size={HEAD.size} className="is-head">다르게 접근</Text>
                {targets.map(({ x, title, sub, photo, icons, lines }) => (
                    <Fragment key={title}>
                        <Box x={x} y={CARD.top} w={CARD.w} h={CARD.height} className="hw-card" />
                        <Text x={x + 90} y={CARD.title} size={48} align="left" className="is-card-title">{title}</Text>
                        <Text x={x + 90} y={CARD.sub} size={28} align="left" className="is-dark">{sub}</Text>
                        <Pic src={img[photo]} x={x + 90} y={CARD.photoTop} w={245} alt={`${title} 대표 인물`} />
                        {icons.map((icon, index) => {
                            const iconTop = CARD.photoTop + index * rowPitch
                            return (
                                <Fragment key={icon}>
                                    <Pic src={img[icon]} x={x + 385} y={iconTop} w={CARD.icon} alt="" />
                                    <Text x={x + 453} y={iconTop + CARD.icon / 2} size={28} align="left" className="is-body">{lines[index]}</Text>
                                </Fragment>
                            )
                        })}
                    </Fragment>
                ))}

                {/* MESSAGE */}
                <Text y={message.label} size={LABEL} className="is-label">MESSAGE</Text>
                <Text y={message.head} size={80} className="is-head is-mixed">한우<small>를 우리의 </small>일상<small>으로</small></Text>
                {messages.map(({ x, image, top, title, bottom }) => (
                    <Fragment key={image}>
                        <Pic src={img[image]} x={x} y={message.top} w={619} alt={title} />
                        <Text x={x + 309.5} y={message.lines[0]} size={26} className="is-white">{top}</Text>
                        <Text x={x + 309.5} y={message.lines[1]} size={42} className="is-white is-bold">{title}</Text>
                        <Text x={x + 309.5} y={message.lines[2]} size={26} className="is-white">{bottom}</Text>
                    </Fragment>
                ))}
                <Box x={944} y={message.top + 489 / 2 - 35} w={56} h={70} className="hw-arrow" />

                {/* MAIN KEY VISUAL */}
                <Text y={keyVisual.label} size={LABEL} className="is-label">MAIN KEY VISUAL</Text>
                <Text y={keyVisual.first} size={64} className="is-maroon">한우로</Text>
                {/* 붓글씨 "일상을"(이미지) 오른쪽에 "채우다"를 붓글씨 아래쪽에 맞춰 둔다 */}
                <Pic src={img.typo02} x={610} y={keyVisual.brush} w={564} alt="일상을" />
                <Text x={1128} y={keyVisual.brush + 114} size={64} align="left" className="is-maroon">채우다</Text>
                <Pic src={img.mainKey02} x={96} y={keyVisual.top} w={534} alt="한우로 일상을 채우다 메인 키비주얼 1" />
                <Pic src={img.mainKey01} x={640} y={keyVisual.top} w={534} alt="한우로 일상을 채우다 메인 키비주얼 2" />
                {colors.map((color, index) => (
                    <div key={color} className="hw-chip" style={{ '--x': 1317 + index * 120, '--y': keyVisual.chips, '--color': color }} />
                ))}
                {['한우의 고급스러움을 유지하되,', '특별한 날에만 먹는 음식이 아닌', '일상 속 즐거움으로 표현했습니다'].map((line, index) => (
                    <Text key={line} x={1547} y={keyVisual.lines[index]} size={BODY.size} className="is-body">{line}</Text>
                ))}
                {keywords.map(([word, desc], index) => (
                    <div key={word} className="hw-pill" style={{ '--x': 1267, '--y': keyVisual.pills[index], '--w': 560, '--h': PILL }}>
                        <b>{word}</b>
                        <span>{desc}</span>
                    </div>
                ))}

                {/* FOUR SURPRISE CONCEPT */}
                <Text y={surprise.label} size={LABEL} className="is-label">FOUR SURPRISE CONCEPT</Text>
                <Text y={surprise.head[0]} size={HEAD.size} className="is-head-dark">일상의 다양한 순간을 4번의</Text>
                <Text y={surprise.head[1]} size={HEAD.size} className="is-head-dark"><b>‘소프라이즈’</b>로 채우다</Text>
                {surprises.map(({ x, w, image, title, desc }) => (
                    <Fragment key={image}>
                        <Pic src={img[image]} x={x} y={surprise.top} w={w} alt={`${title} 키비주얼`} />
                        <Text x={x} y={surprise.title} size={34} align="left" className="is-caption">{title}</Text>
                        <Text x={x} y={surprise.desc} size={25} align="left" className="is-body">{desc}</Text>
                    </Fragment>
                ))}

                {/* DIGITAL / CONTENT APPLICATION 1 */}
                <Text y={channel.label} size={LABEL} className="is-label">DIGITAL / CONTENT APPLICATION</Text>
                <Text y={channel.head[0]} size={HEAD.size} className="is-head-dark">온 · 오프라인에서 만나는</Text>
                <Text y={channel.head[1]} size={HEAD.size} className="is-head">한우의 일상적인 순간들</Text>
                {channels.map(({ x, w, image, title, desc }, index) => (
                    <Fragment key={image}>
                        <Pic src={img[image]} x={x} y={channel.bottom - channelHeights[index]} w={w} alt={title} />
                        <Text x={x + w / 2} y={channel.title} size={CAPTION.title} className="is-caption">{title}</Text>
                        <Text x={x + w / 2} y={channel.desc} size={CAPTION.body} className="is-body">{desc}</Text>
                    </Fragment>
                ))}

                {/* DIGITAL / CONTENT APPLICATION 2 */}
                <Text y={content.label} size={LABEL} className="is-label">DIGITAL / CONTENT APPLICATION</Text>
                <Text y={content.head[0]} size={HEAD.size} className="is-head-dark">다양한 콘텐츠로,</Text>
                <Text y={content.head[1]} size={HEAD.size} className="is-head-dark">더 가까운 <b>한우의 일상</b></Text>
                {contents.map(({ x, w, image, cx, title, lines }) => (
                    <Fragment key={image}>
                        <Pic src={img[image]} x={x} y={content.top} w={w} alt={title} />
                        <Text x={cx} y={content.title} size={CAPTION.title} className="is-caption">{title}</Text>
                        {lines.map((line, index) => <Text key={line} x={cx} y={content.lines[index]} size={CAPTION.body} className="is-body">{line}</Text>)}
                    </Fragment>
                ))}
                <Pic src={img.digital03} x={64} y={video.top} w={918} alt="숏폼 영상 3편" />
                <Pic src={img.digital04} x={1005} y={video.top} w={790} alt="한우자조금 유튜브 채널" />
                <Text y={video.title} size={CAPTION.title} className="is-caption">숏폼/ 영상 콘텐츠</Text>
                {['맛있는 순간을 담은 레시피 및', '먹방 브랜드 영상'].map((line, index) => (
                    <Text key={line} y={video.lines[index]} size={CAPTION.body} className="is-body">{line}</Text>
                ))}
            </DetailCanvas>
        </div>
    )
}
