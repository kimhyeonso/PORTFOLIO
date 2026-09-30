import DetailCanvas, { Label, Pic } from './DetailCanvas.jsx'
import { byName } from './byName.js'
import styles from './DivetoursDetail.module.scss'

// DIVETOURS 폴더의 이미지 (예: img.diveTours01)
const img = byName(import.meta.glob('../../assets/image/project/DIVETOURS/*.{png,jpg}', { eager: true, import: 'default' }))

// 무한 슬라이드로 흐르는 투어 썸네일 (productThumnail01, 02, … 이름 순)
const products = Object.keys(img).filter((name) => name.startsWith('productThumnail')).sort().map((name) => img[name])

/**
 * DIVETOURS 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 1920 × 14190px).
 * DIVE TO EARTH 로고 → 광고 배너 모음(ad) → 투어 썸네일 무한 슬라이드(productThumnail)
 * → <썸네일 및 일정 소개> 투어 상세페이지 4종 → <공통> 지역소개 / 자사 소개 / 체크리스트를 3열로 보여준다.
 * 너비 560px 이미지는 둘레에 그림자 여백이 있어 그만큼 바깥에서 시작한다.
 */
export default function DivetoursDetail() {
    return (
        <div className={styles.scope}>
            <DetailCanvas height={14190}>
                <Pic src={img.logo} x={831} y={211} w={259} alt="DIVE TO EARTH 다이브투어스 로고" />
                <Pic src={img.ad} x={0} y={708} w={1920} alt="다이빙 투어 광고 배너 모음" />
                {/* 투어 썸네일 띠: 같은 목록을 두 번 이어 붙이고 한 벌 길이만큼 왼쪽으로 흘려 끊김 없이 반복한다 */}
                <div className="dv-marquee" style={{ '--y': 2304, '--count': products.length }} aria-label="투어 상품 썸네일">
                    <div className="dv-marquee-track">
                        {[...products, ...products].map((src, index) => (
                            <img key={index} src={src} alt={index < products.length ? `투어 상품 썸네일 ${index + 1}` : ''} aria-hidden={index >= products.length} draggable="false" />
                        ))}
                    </div>
                </div>

                {/* 썸네일 및 일정 소개: 1열은 1.083배, 2 · 3열은 1.04배로 키워 3열을 채운다 */}
                <Label y={3183} size={48}>&lt;썸네일 및 일정 소개&gt;</Label>
                <Pic src={img.diveTours01} x={32} y={3322} w={606} alt="말라파스쿠아 다이빙 투어 상세페이지" />
                <Pic src={img.diveTours02} x={680} y={3331} w={561} alt="팔라우 다이빙 투어 상세페이지" />
                <Pic src={img.diveTours04} x={680} y={4524} w={561} alt="세부 스쿠버다이빙 오픈클래스 상세페이지" />
                <Pic src={img.diveTours03} x={1318} y={3331} w={562} alt="이집트 홍해 리브어보드 다이빙 투어 상세페이지" />

                <Label y={8900} size={48}>&lt;공통&gt;</Label>
                <Label x={393} y={9113} size={32}>&lt;지역소개 및 포인트 설명&gt;</Label>
                <Label x={973} y={9113} size={32}>&lt;자사 소개&gt;</Label>
                <Label x={1553} y={9113} size={32}>&lt;체크리스트&gt;</Label>
                <Pic src={img.diveTours05} x={117} y={9150} w={560} alt="말라파스쿠아 지역소개 및 다이빙 포인트 설명" />
                <Pic src={img.diveTours06} x={697} y={9150} w={560} alt="다이브투어스 자사 소개" />
                <Pic src={img.diveTours07} x={1277} y={9150} w={560} alt="체크리스트와 자주 묻는 질문" />
            </DetailCanvas>
        </div>
    )
}
