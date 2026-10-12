import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './AmorepacificDetail.module.scss'

// AMOREPACIFIC 폴더의 이미지 (예: img.hera, img.detailPage01)
const img = byName(import.meta.glob('../../assets/image/project/AMOREPACIFIC/*.png', { eager: true, import: 'default' }))

// 이미지 원본 크기 [너비, 높이] (높이 계산용)
const size = {
    amorepacific: [750, 105],
    sulwhasoo: [473, 138], hera: [463, 106], ap: [499, 122], hanyul: [216, 94], prmr: [269, 122], lope: [326, 134],
    laneige: [490, 137], vital: [777, 143], mamonde: [360, 267], miseenscene: [361, 265],
    detailPage05: [501, 1588],
}

// 글자 크기 · 줄 간격
const HEAD = { size: 66, pitch: 92 } // 섹션 큰 제목
const BODY = { size: 30, pitch: 52 }
const CHECK = { size: 32, pitch: 56 } // 체크 목록

// 브랜드 로고 띠 2줄 (원본 크기의 LOGO_SCALE배, 띠 높이 = 가장 큰 로고 높이)
const LOGO_SCALE = 0.9
const logoRows = [
    { logos: ['sulwhasoo', 'hera', 'ap', 'hanyul', 'prmr', 'lope'], reverse: false },
    { logos: ['laneige', 'vital', 'mamonde', 'miseenscene'], reverse: true },
].map((row) => ({ ...row, height: Math.max(...row.logos.map((name) => size[name][1])) * LOGO_SCALE }))
const logoAlt = {
    sulwhasoo: '설화수', hera: '헤라', ap: 'AP BEAUTY', hanyul: '한율', prmr: 'primera', lope: 'IOPE',
    laneige: '라네즈', vital: '바이탈뷰티', mamonde: '마몽드', miseenscene: '미쟝센',
}

// 업무 경험 3열 (x: 열 가운데)
const ICON = 168 // 원래 240에서 30% 줄임
const strengths = [
    { x: 413, icon: 'icon01', lines: ['브랜드별 디자인 기준을 이해하고', '톤앤매너를 유지하는 능력 경험'] },
    { x: 960, icon: 'icon02', lines: ['사이즈와 가독성을 고려한', '세밀한 검수 능력 경험'] },
    { x: 1507, icon: 'icon03', lines: ['다양한 요청사항을 빠르고 정확하게', '수행하는 실무 능력 경험'] },
]

// 작업 묶음 이름표 (01 Detail Page …)
const PILL = { w: 556, pad: 28, title: 34, sub: 28, pitch: 38 }
const pillInner = stack(0)
const pillPos = { title: pillInner.text(PILL.title, PILL.pad), sub: pillInner.lines(2, PILL.sub, PILL.pitch, GAP.line) }
const PILL_HEIGHT = pillInner.bottom + PILL.pad

// 가로 콘텐츠 영역 (가운데 정렬, 너비 1684)
const LEFT = 118
const RIGHT = LEFT + 1684

// 01 상세페이지 5장 (사이 30, 마지막 장은 오른쪽 끝까지)
const pageCols = [
    { name: 'detailPage01', w: 242, alt: '라네즈 워터뱅크 크림 상세페이지' },
    { name: 'detailPage02', w: 242, alt: '라네즈 워터뱅크 리필 상세페이지' },
    { name: 'detailPage03', w: 335, alt: '설화수 진설 리버스에이징 상세페이지' },
    { name: 'detailPage04', w: 289, alt: '설화수 진설크림 리치 상세페이지' },
].reduce((cols, col) => [...cols, { ...col, x: cols.length ? cols.at(-1).x + cols.at(-1).w + 30 : LEFT }], [])
const PAGE_LAST_X = pageCols.at(-1).x + pageCols.at(-1).w + 30
const PAGE_LAST_W = RIGHT - PAGE_LAST_X
const PAGE_HEIGHT = 2878 // 01 ~ 04 장의 높이 (원본 크기 그대로)

// 02 썸네일 (행마다 [이미지, x, 너비])
const THUMB_GAP = 20
const thumbRows = [
    { h: 469, items: [['thumbnail01', LEFT, 391], ['thumbnail02', LEFT + 411, 391], ['thumbnail03', LEFT + 822, 391], ['thumbnail04', RIGHT - 470, 470]] },
    { h: 337, items: [0, 1, 2].map((index) => [`thumbnail0${index + 5}`, LEFT + index * (548 + THUMB_GAP), 548]) },
    { h: 391, items: [['thumbnail08', LEFT, 391], ['thumbnail09', LEFT + 411, 391]] },
    { h: 496, items: [['thumbnail10', LEFT, 1684]] },
]
const thumbAlt = {
    thumbnail01: '라네즈 워터뱅크 크림 썸네일', thumbnail02: '라네즈 워터뱅크 3종 썸네일', thumbnail03: '크림 텍스처 썸네일',
    thumbnail04: '바이탈뷰티 슈퍼레티놀 썸네일', thumbnail05: '헤라 립스틱 썸네일', thumbnail06: '헤라 아이 팔레트 썸네일',
    thumbnail07: '헤라 아이섀도 썸네일', thumbnail08: '한율 클렌징폼 썸네일', thumbnail09: '한율 수분진정 패드 썸네일',
    thumbnail10: '마몽드 제품 썸네일 4종',
}

// 03 배너: 왼쪽 가로 배너 2장 + 오른쪽 세로 배너 2장 (사이 25)
const BANNER_GAP = 25
const BANNER_WIDE = { x: LEFT, w: 1169 }
const BANNER_TALL = { x: LEFT + 1169 + BANNER_GAP, w: 490 }
const BANNER_HEIGHT = 642 + BANNER_GAP + 748 // 오른쪽 세로 배너 2장 높이 합

const checks = {
    detail: ['디자인 검수', '전체 사이즈 조정', '폰트 크기 조정', '가독성 및 레이아웃 균형 개선'],
    thumbnail: ['제품 중심 구도 조정', '브랜드별 비율에 맞춘 썸네일 제작', '제품 그림자 추가 및 배경 추가', '잘린 이미지 보안 및 배경 확장'],
    banner: ['반응형 배너(키비주얼) 제작', '섹션별 크기에 맞춘 배너 제작', '가독성을 위한 제품 배경 색감 조정', '텍스트로 인한 제품 위치 조정'],
}
const CHECK_HEIGHT = (checks.detail.length - 1) * CHECK.pitch + CHECK.size * 1.2

/*
 * 첫 화면: 로고 → 브랜드 로고 띠 2줄. 팝업 높이를 꽉 채우는 칸의 세로 가운데에 두어,
 * 처음 열었을 때는 로고들만 보이고 아래 내용은 내려야 보인다
 */
const hero = stack(0)
const LOGO_W = 660
const LOGO_TO_MARQUEE = 300 // 로고 → 브랜드 로고 띠 (브랜드 로고를 조금 더 아래로)
const logoTop = hero.box(fitHeight(LOGO_W, size.amorepacific))
const marqueeTops = logoRows.map((row, index) => hero.box(row.height, index ? GAP.near : LOGO_TO_MARQUEE))
const HERO_HEIGHT = hero.bottom

/* 세로 위치: 첫 화면 아래부터 GAP 간격으로 쌓는다 */
const flow = stack(0)

// 브랜드 운영을 위한 업무 경험 (아이콘 3개 + 설명 2줄)
const strength = { head: flow.lines(2, HEAD.size, HEAD.pitch, GAP.section), iconTop: flow.box(ICON, GAP.title), lines: flow.lines(2, BODY.size, BODY.pitch, GAP.near) }

// 01 Detail Page: 체크 목록은 마지막 열 아래 끝에 맞춘다
const detail = { pill: flow.box(PILL_HEIGHT, GAP.section), top: flow.box(PAGE_HEIGHT, GAP.title) }
detail.checks = stack(flow.bottom - CHECK_HEIGHT).lines(checks.detail.length, CHECK.size, CHECK.pitch)

// 02 Thumbnail: 체크 목록은 3번째 줄 세로 가운데에
const thumbnail = { pill: flow.box(PILL_HEIGHT, GAP.section) }
thumbnail.rows = thumbRows.map((row, index) => flow.box(row.h, index ? GAP.near : GAP.title))
thumbnail.checks = stack(thumbnail.rows[2] + (thumbRows[2].h - CHECK_HEIGHT) / 2).lines(checks.thumbnail.length, CHECK.size, CHECK.pitch)

// 03 Banner(KV): 체크 목록은 두 가로 배너 사이 세로 가운데에
const banner = { pill: flow.box(PILL_HEIGHT, GAP.section), top: flow.box(BANNER_HEIGHT, GAP.title) }
const WIDE_TOP_BOTTOM = banner.top + fitHeight(BANNER_WIDE.w, [1169, 438])
const WIDE_BOTTOM_TOP = flow.bottom - fitHeight(BANNER_WIDE.w, [1169, 412])
banner.checks = stack(WIDE_TOP_BOTTOM + (WIDE_BOTTOM_TOP - WIDE_TOP_BOTTOM - CHECK_HEIGHT) / 2).lines(checks.banner.length, CHECK.size, CHECK.pitch)

const HEIGHT = flow.bottom + GAP.section

// y는 글줄의 세로 가운데. align: left(x가 왼쪽) | center(x가 가운데)
function Text({ x = 960, y, size = 28, align = 'center', className = '', children }) {
    return <p className={`ap-text is-${align} ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

// 옆으로 계속 흐르는 로고 띠 (같은 로고 묶음을 두 번 이어 붙여 끊김 없이 돈다)
function Marquee({ y, height, logos, reverse }) {
    const set = (copy) => logos.map((name) => (
        <img key={`${copy}-${name}`} src={img[name]} alt={copy ? '' : logoAlt[name]} draggable="false" style={{ '--w': size[name][0] * LOGO_SCALE }} />
    ))
    return (
        <div className="ap-marquee" style={{ '--y': y, '--h': height }}>
            <div className={`ap-marquee-track ${reverse ? 'is-reverse' : ''}`}>
                <div className="ap-marquee-set">{set(0)}</div>
                <div className="ap-marquee-set" aria-hidden="true">{set(1)}</div>
            </div>
        </div>
    )
}

// 작업 묶음 이름표 (회색 둥근 상자 + 제목 + 설명 2줄)
function Pill({ y, title, sub }) {
    const x = 960 - PILL.w / 2
    return (
        <>
            <div className="ap-pill" style={{ '--x': x, '--y': y, '--w': PILL.w, '--h': PILL_HEIGHT }} />
            <Text y={y + pillPos.title} size={PILL.title} className="is-pill-title">{title}</Text>
            {sub.map((line, index) => <Text key={line} y={y + pillPos.sub[index]} size={PILL.sub} className="is-pill-sub">{line}</Text>)}
        </>
    )
}

// 체크 아이콘 + 글 목록
function Checks({ x, ys, items }) {
    return items.map((item, index) => (
        <Fragment key={item}>
            <svg className="ap-check" style={{ '--x': x, '--y': ys[index] - 16 }} viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <path d="M10,16.5 L14.5,21 L22.5,12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Text x={x + 46} y={ys[index]} size={CHECK.size} align="left" className="is-check">{item}</Text>
        </Fragment>
    ))
}

/**
 * 아모레퍼시픽 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 로고 → 브랜드 로고 띠 → 브랜드 운영을 위한 업무 경험(3열) → 01 Detail Page → 02 Thumbnail → 03 Banner(KV)
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function AmorepacificDetail() {
    return (
        <div className={`${styles.scope} ap`}>
            {/* 첫 화면: 로고 · 브랜드 로고 띠 */}
            <div className="ap-hero">
                <DetailCanvas height={HERO_HEIGHT}>
                    <Pic src={img.amorepacific} x={960 - LOGO_W / 2} y={logoTop} w={LOGO_W} alt="AMOREPACIFIC" />
                    {logoRows.map((row, index) => <Marquee key={row.logos[0]} y={marqueeTops[index]} {...row} />)}
                </DetailCanvas>
            </div>

            <DetailCanvas height={HEIGHT}>
                {/* 브랜드 운영을 위한 업무 경험 */}
                <Text y={strength.head[0]} size={HEAD.size} className="is-head">브랜드 운영을 위한</Text>
                <Text y={strength.head[1]} size={HEAD.size} className="is-head">업무 경험</Text>
                {strengths.map(({ x, icon, lines }) => (
                    <Fragment key={icon}>
                        <Pic src={img[icon]} x={x - ICON / 2} y={strength.iconTop} w={ICON} alt="" />
                        {lines.map((line, index) => <Text key={line} x={x} y={strength.lines[index]} size={BODY.size} className="is-strength">{line}</Text>)}
                    </Fragment>
                ))}

                {/* 01 Detail Page */}
                <Pill y={detail.pill} title="01 Detail Page" sub={['상세 페이지 디자인 검수 및', '최적화']} />
                {pageCols.map(({ name, x, w, alt }) => <Pic key={name} src={img[name]} x={x} y={detail.top} w={w} alt={alt} />)}
                <Pic src={img.detailPage05} x={PAGE_LAST_X} y={detail.top} w={PAGE_LAST_W} alt="헤라 센슈얼 누드 글로스 상세페이지" />
                <Checks x={PAGE_LAST_X} ys={detail.checks} items={checks.detail} />

                {/* 02 Thumbnail */}
                <Pill y={thumbnail.pill} title="02 Thumbnail" sub={['제품별 썸네일 제작 및', '이미지 보정']} />
                {thumbRows.map((row, rowIndex) => row.items.map(([name, x, w]) => (
                    <Pic key={name} src={img[name]} x={x} y={thumbnail.rows[rowIndex]} w={w} alt={thumbAlt[name]} />
                )))}
                <Checks x={LEFT + 2 * (548 + THUMB_GAP)} ys={thumbnail.checks} items={checks.thumbnail} />

                {/* 03 Banner(KV) */}
                <Pill y={banner.pill} title="03 Banner(KV)" sub={['반응형 배너', '키비주얼 제작']} />
                <Pic src={img.banner01} x={BANNER_WIDE.x} y={banner.top} w={BANNER_WIDE.w} alt="설화수 자음생크림 가로 배너" />
                <Pic src={img.banner03} x={BANNER_WIDE.x} y={WIDE_BOTTOM_TOP} w={BANNER_WIDE.w} alt="설화수 자음생크림 리치 가로 배너" />
                <Pic src={img.banner02} x={BANNER_TALL.x} y={banner.top} w={BANNER_TALL.w} alt="설화수 자음생크림 세로 배너" />
                <Pic src={img.banner04} x={BANNER_TALL.x} y={banner.top + 642 + BANNER_GAP} w={BANNER_TALL.w} alt="설화수 자음생크림 리치 세로 배너" />
                <Checks x={LEFT + 70} ys={banner.checks} items={checks.banner} />
            </DetailCanvas>
        </div>
    )
}
