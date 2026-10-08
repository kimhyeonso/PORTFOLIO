import { Fragment } from 'react'
import DetailCanvas, { GAP, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './MountainDetail.module.scss'

// MOUNTAIN EQUIMENT 폴더의 이미지 (예: img.page01, img.hero)
const img = byName(import.meta.glob('../../assets/image/project/MOUNTAIN EQUIMENT/*.{png,jpg}', { eager: true, import: 'default' }))

// 소개 카드 3장 (x · w: 카드 왼쪽 · 너비, icon: 아이콘 이미지와 그 왼쪽 · 카드 위 끝 기준 위치 · 너비)
const cards = [
    { x: 90, w: 550, icon: 'icon01', ix: 152, iy: -68, iw: 414, title: '4 Themes', lines: ['다양한 아웃도어 상품을', '4가지 주제로 분류하여', '제품군을 명확하게 구성'] },
    { x: 687, w: 547, icon: 'icon03', ix: 776, iy: -32, iw: 347, title: 'Representative Product', lines: ['각 주제를 가장 잘 보여주는', '대표 상품을 중심으로 구성해', '제품의 특징과 매력을 강조'] },
    { x: 1280, w: 551, icon: 'icon02', ix: 1355, iy: -59, iw: 389, title: 'Brand Experience', lines: ['단순한 제품 소개를 넘어', '브랜드의 아웃도어 감성과', '시각적 아이덴티티를 전달'], blue: true },
]
const CARD_HEIGHT = 533
const ICON_OVER = 68 // 카드 위로 튀어나온 아이콘 높이 (가장 높은 icon01 기준)

// 세로 위치: 히어로 · 목업 2장은 틈 없이 이어 붙이고, 그 아래부터 GAP 간격으로 쌓는다
const MOKUP02_TOP = 2167
const flow = stack(MOKUP02_TOP + fitHeight(1946, [1275, 638]))
const intro = {
    title: flow.text(44.6, GAP.section),
    first: flow.lines(2, 27.7, 36, GAP.title),
    second: flow.lines(2, 27.7, 36, GAP.near),
}
const CARD_TOP = flow.box(ICON_OVER + CARD_HEIGHT, GAP.item) + ICON_OVER

// 내지 12장: 한 장 높이 768px(1275 × 510 → 너비 1920)로 틈 없이 이어 붙인다
const PAGE_TOP = flow.bottom + GAP.section
const PAGE_HEIGHT = 768
const HEIGHT = PAGE_TOP + 12 * PAGE_HEIGHT

// y는 글줄의 세로 가운데, x는 가운데
function Text({ x = 960, y, size, className = '', children }) {
    return <p className={`mt-text ${className}`} style={{ '--x': x, '--y': y, '--size': size }}>{children}</p>
}

/**
 * MOUNTAIN EQUIPMENT 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * 히어로 → 목업 2장 → 기획 의도 소개와 카드 3장 → 카탈로그 내지 12장을 모두 화면 너비 전체로 이어 보여준다.
 * 기획 의도 · 카드의 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function MountainDetail() {
    return (
        <div className={styles.scope}>
            <DetailCanvas height={HEIGHT}>
                <Pic src={img.hero} x={0} y={0} w={1920} alt="텐트 안에서 바라본 산과 MOUNTAIN EQUIPMENT 로고" />
                <Pic src={img.Mokup01} x={0} y={1207} w={1920} alt="카탈로그를 손에 든 목업" />
                {/* 시안에서 조금 더 크게 들어가 있어 높이(974px)에 맞추고 좌우 넘치는 부분은 잘린다 */}
                <Pic src={img.Mokup02} x={-13} y={MOKUP02_TOP} w={1946} alt="카탈로그 펼침면 목업" />

                {/* 기획 의도 */}
                <Text y={intro.title} size={44.6} className="is-bold">브랜드의 특성과 무드를 직관적으로 전달합니다</Text>
                <Text y={intro.first[0]} size={27.7}>기존 브랜드 사이트는 제품 판매 중심으로 구성되어 있어,</Text>
                <Text y={intro.first[1]} size={27.7}>상품을 카테고리 별로 탐색하거나 브랜드의 다양한 제품군을 한눈에 파악하기 어려웠습니다.</Text>
                <Text y={intro.second[0]} size={27.7}>이러한 점을 보완하기 위해 아웃도어 제품 4가지 주제로 분류하고</Text>
                <Text y={intro.second[1]} size={27.7}>각 주제를 대표하는 상품을 중심으로 브랜드 특성과 아웃도어 무드를 효과적으로 소개하는 카탈로그를 제작하였습니다.</Text>

                {/* 카드를 잇는 가로선 (카드 뒤) */}
                <div className="mt-connector" style={{ '--x': 600, '--y': CARD_TOP + 219, '--w': 720 }} />
                {cards.map(({ x, w, blue }) => (
                    <div key={x} className={`mt-card ${blue ? 'is-blue' : ''}`} style={{ '--x': x, '--y': CARD_TOP, '--w': w, '--h': CARD_HEIGHT }} />
                ))}
                {cards.map(({ x, w, icon, ix, iy, iw, title, lines }) => (
                    <Fragment key={title}>
                        <Pic src={img[icon]} x={ix} y={CARD_TOP + iy} w={iw} alt="" />
                        <Text x={x + w / 2} y={CARD_TOP + 306} size={37.5} className="is-title">{title}</Text>
                        {lines.map((line, index) => (
                            <Text key={line} x={x + w / 2} y={CARD_TOP + 371 + index * 42.5} size={26.4}>{line}</Text>
                        ))}
                    </Fragment>
                ))}

                {/* 카탈로그 내지 */}
                {Array.from({ length: 12 }, (_, index) => {
                    const name = `page${String(index + 1).padStart(2, '0')}`
                    return <Pic key={name} src={img[name]} x={0} y={PAGE_TOP + index * PAGE_HEIGHT} w={1920} alt={`카탈로그 내지 ${index + 1}`} />
                })}
            </DetailCanvas>
        </div>
    )
}
