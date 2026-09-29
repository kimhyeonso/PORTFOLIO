import DetailCanvas, { Label, Pic } from './DetailCanvas.jsx'
import { byName } from './byName.js'

// DIVETOURS 폴더의 이미지 (예: img.diveTours01)
const img = byName(import.meta.glob('../../assets/image/project/DIVETOURS/*.png', { eager: true, import: 'default' }))

/**
 * DIVETOURS 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 1920 × 11776px).
 * <썸네일 및 일정 소개> 투어 상세페이지 4종 · <공통> 지역소개 / 자사 소개 / 체크리스트를 3열로 보여준다.
 * 칸 너비는 540px(x 123 · 703 · 1283). 너비 560px 이미지는 둘레에 그림자 여백(약 8px)이 있어 그만큼 바깥에서 시작한다.
 */
export default function DivetoursDetail() {
    return (
        <DetailCanvas height={11776}>
            <Label y={203} size={48}>&lt;썸네일 및 일정 소개&gt;</Label>
            <Pic src={img.diveTours01} x={115} y={451} w={560} alt="말라파스쿠아 다이빙 투어 상세페이지" />
            <Pic src={img.diveTours02} x={703} y={459} w={540} alt="팔라우 다이빙 투어 상세페이지" />
            <Pic src={img.diveTours04} x={703} y={1810} w={540} alt="세부 스쿠버다이빙 오픈클래스 상세페이지" />
            <Pic src={img.diveTours03} x={1283} y={459} w={540} alt="이집트 홍해 리브어보드 다이빙 투어 상세페이지" />

            <Label y={6177} size={48}>&lt;공통&gt;</Label>
            <Label x={393} y={6390} size={32}>&lt;지역소개 및 포인트 설명&gt;</Label>
            <Label x={973} y={6390} size={32}>&lt;자사 소개&gt;</Label>
            <Label x={1553} y={6390} size={32}>&lt;체크리스트&gt;</Label>
            <Pic src={img.diveTours05} x={117} y={6427} w={560} alt="말라파스쿠아 지역소개 및 다이빙 포인트 설명" />
            <Pic src={img.diveTours06} x={697} y={6427} w={560} alt="다이브투어스 자사 소개" />
            <Pic src={img.diveTours07} x={1277} y={6427} w={560} alt="체크리스트와 자주 묻는 질문" />
        </DetailCanvas>
    )
}
