import DetailCanvas, { GAP, Label, Pic, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './DivetoursDetail.module.scss'

// DIVETOURS 폴더의 이미지 (예: img.diveTours01)
const img = byName(import.meta.glob('../../assets/image/project/DIVETOURS/*.{png,jpg}', { eager: true, import: 'default' }))

// 무한 슬라이드로 흐르는 투어 썸네일 (productThumnail01, 02, … 이름 순)
const products = Object.keys(img).filter((name) => name.startsWith('productThumnail')).sort().map((name) => img[name])

// 이미지 원본 크기 [너비, 높이] (높이 계산용)
const size = {
    logo: [259, 317], ad: [1920, 1488],
    diveTours01: [560, 4768], diveTours02: [540, 1083], diveTours03: [540, 4081], diveTours04: [540, 3957],
    diveTours05: [560, 2762], diveTours06: [560, 4116], diveTours07: [560, 4808],
}

const LABEL = 48
const SUB_LABEL = 32

// 세로 위치: 위에서부터 GAP 간격으로 쌓는다
const flow = stack(0)
const logoTop = flow.box(fitHeight(259, size.logo), GAP.section)
const adTop = flow.box(fitHeight(1920, size.ad), GAP.item)
const marqueeTop = flow.box(600, GAP.item)

// 썸네일 및 일정 소개: 1열은 1.083배, 2 · 3열은 1.04배로 키워 3열을 채운다 (2 · 3열은 1열 그림자 여백만큼 9px 아래에서 시작)
const scheduleLabel = flow.text(LABEL, GAP.section)
const scheduleTop = flow.bottom + GAP.title
const col2Bottom = scheduleTop + 9 + fitHeight(561, size.diveTours02)
const tour04Top = col2Bottom + GAP.near
flow.skip(Math.max(
    scheduleTop + fitHeight(606, size.diveTours01),
    tour04Top + fitHeight(561, size.diveTours04),
    scheduleTop + 9 + fitHeight(562, size.diveTours03),
))

const commonLabel = flow.text(LABEL, GAP.section)
const commonSub = flow.text(SUB_LABEL, GAP.title)
const commonTop = flow.box(Math.max(...['diveTours05', 'diveTours06', 'diveTours07'].map((name) => fitHeight(560, size[name]))), GAP.near)
const HEIGHT = flow.bottom + GAP.section

/**
 * DIVETOURS 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 너비 1920px).
 * DIVE TO EARTH 로고 → 광고 배너 모음(ad) → 투어 썸네일 무한 슬라이드(productThumnail)
 * → <썸네일 및 일정 소개> 투어 상세페이지 4종 → <공통> 지역소개 / 자사 소개 / 체크리스트를 3열로 보여준다.
 * 너비 560px 이미지는 둘레에 그림자 여백이 있어 그만큼 바깥에서 시작한다.
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function DivetoursDetail() {
    return (
        <div className={styles.scope}>
            <DetailCanvas height={HEIGHT}>
                <Pic src={img.logo} x={831} y={logoTop} w={259} alt="DIVE TO EARTH 다이브투어스 로고" />
                <Pic src={img.ad} x={0} y={adTop} w={1920} alt="다이빙 투어 광고 배너 모음" />
                {/* 투어 썸네일 띠: 같은 목록을 두 번 이어 붙이고 한 벌 길이만큼 왼쪽으로 흘려 끊김 없이 반복한다 */}
                <div className="dv-marquee" style={{ '--y': marqueeTop, '--count': products.length }} aria-label="투어 상품 썸네일">
                    <div className="dv-marquee-track">
                        {[...products, ...products].map((src, index) => (
                            <img key={index} src={src} alt={index < products.length ? `투어 상품 썸네일 ${index + 1}` : ''} aria-hidden={index >= products.length} draggable="false" />
                        ))}
                    </div>
                </div>

                <Label y={scheduleLabel} size={LABEL}>&lt;썸네일 및 일정 소개&gt;</Label>
                <Pic src={img.diveTours01} x={32} y={scheduleTop} w={606} alt="말라파스쿠아 다이빙 투어 상세페이지" />
                <Pic src={img.diveTours02} x={680} y={scheduleTop + 9} w={561} alt="팔라우 다이빙 투어 상세페이지" />
                <Pic src={img.diveTours04} x={680} y={tour04Top} w={561} alt="세부 스쿠버다이빙 오픈클래스 상세페이지" />
                <Pic src={img.diveTours03} x={1318} y={scheduleTop + 9} w={562} alt="이집트 홍해 리브어보드 다이빙 투어 상세페이지" />

                <Label y={commonLabel} size={LABEL}>&lt;공통&gt;</Label>
                <Label x={393} y={commonSub} size={SUB_LABEL}>&lt;지역소개 및 포인트 설명&gt;</Label>
                <Label x={973} y={commonSub} size={SUB_LABEL}>&lt;자사 소개&gt;</Label>
                <Label x={1553} y={commonSub} size={SUB_LABEL}>&lt;체크리스트&gt;</Label>
                <Pic src={img.diveTours05} x={117} y={commonTop} w={560} alt="말라파스쿠아 지역소개 및 다이빙 포인트 설명" />
                <Pic src={img.diveTours06} x={697} y={commonTop} w={560} alt="다이브투어스 자사 소개" />
                <Pic src={img.diveTours07} x={1277} y={commonTop} w={560} alt="체크리스트와 자주 묻는 질문" />
            </DetailCanvas>
        </div>
    )
}
