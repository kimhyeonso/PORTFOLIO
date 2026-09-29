import DetailCanvas, { Label, Pic } from './DetailCanvas.jsx'
import { byName } from './byName.js'

// ADVERTISING BANNER 폴더의 이미지 (예: img.online01)
const img = byName(import.meta.glob('../../assets/image/project/ADVERTISING BANNER/*.png', { eager: true, import: 'default' }))

/**
 * ADVERTISING BANNER 세부정보 팝업 내용 (시안 1920px 기준 좌표, MOUNTAIN EQUIPMENT와 같은 폭·제목 스타일).
 * 가운데 한 줄(x 323, 너비 1275px)에 <신문 광고> → <온라인 배너 · 리버레이크 송파> → <온라인 배너 · 전시회>를 보여준다.
 * 온라인 배너 두 묶음은 세로 배너 1장 + 가로 배너 2장이 1275px 너비에 딱 맞게 짜여 있다
 * (461 + 15 + 799 = 1275, 400 + 19 + 400 = 819 / 542 + 17 + 716 = 1275, 375 + 16 + 375 = 766).
 * 제목은 앞 묶음 끝에서 118px 아래, 이미지는 제목에서 82px 아래.
 */
export default function AdvertisingBannerDetail() {
    return (
        <DetailCanvas height={3017}>
            <Label y={198} size={26}>&lt;신문 광고&gt;</Label>
            <Pic src={img.newspaper} x={323} y={280} w={1275} alt="리버레이크 송파 신문 광고" />

            <Label y={970} size={26}>&lt;온라인 배너 · 리버레이크 송파&gt;</Label>
            <Pic src={img.online01} x={323} y={1052} w={461} alt="리버레이크 송파 세로 배너" />
            <Pic src={img.online02} x={799} y={1052} w={799} alt="리버레이크 송파 가로 배너 1" />
            <Pic src={img.online03} x={799} y={1471} w={799} alt="리버레이크 송파 가로 배너 2" />

            <Label y={1989} size={26}>&lt;온라인 배너 · 전시회&gt;</Label>
            <Pic src={img.online06} x={323} y={2071} w={542} alt="ICPI WEEK 세로 배너" />
            <Pic src={img.online04} x={882} y={2071} w={716} alt="스마트 안전보건박람회 배너" />
            <Pic src={img.online05} x={882} y={2462} w={716} alt="KPCA SHOW 2025 배너" />
        </DetailCanvas>
    )
}
