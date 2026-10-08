import DetailCanvas, { GAP, Label, Pic, Video, fitHeight, stack } from './DetailCanvas.jsx'
import { byName } from './byName.js'

// ADVERTISING BANNER 폴더의 이미지 · 영상 (예: img.online01, video.riverlake_15)
const img = byName(import.meta.glob('../../assets/image/project/ADVERTISING BANNER/*.png', { eager: true, import: 'default' }))
const video = byName(import.meta.glob('../../assets/image/project/ADVERTISING BANNER/*.mp4', { eager: true, import: 'default' }))

const LABEL = 26
const SUB_LABEL = 22

// 세로 위치: 위에서부터 GAP 간격으로 쌓는다 (묶음 안 배너 사이 틈 15 ~ 19px은 1275px 너비를 맞춘 짜임이라 그대로)
const flow = stack(0)
const newspaper = { label: flow.text(LABEL, GAP.section), top: flow.box(fitHeight(1275, [1277, 573]), GAP.title) }
const riverlake = { label: flow.text(LABEL, GAP.section), top: flow.box(819, GAP.title) }
const movie = { label: flow.text(LABEL, GAP.section), sub: flow.text(SUB_LABEL, GAP.title), top: flow.box(fitHeight(630, [1080, 1920]), GAP.near) }
const exhibition = { label: flow.text(LABEL, GAP.section), top: flow.box(766, GAP.title) }
const HEIGHT = flow.bottom + GAP.section

/**
 * ADVERTISING BANNER 세부정보 팝업 내용 (시안 1920px 기준 좌표, MOUNTAIN EQUIPMENT와 같은 폭·제목 스타일).
 * 가운데 한 줄(x 323, 너비 1275px)에 <신문 광고> → <온라인 배너 · 리버레이크 송파> → <영상 광고 · 리버레이크 송파> → <온라인 배너 · 전시회>를 보여준다.
 * 온라인 배너 두 묶음은 세로 배너 1장 + 가로 배너 2장이 1275px 너비에 딱 맞게 짜여 있다
 * (461 + 15 + 799 = 1275, 400 + 19 + 400 = 819 / 542 + 17 + 716 = 1275, 375 + 16 + 375 = 766).
 * <영상 광고>는 세로 영상(1080 × 1920) 2개를 위와 같은 폭에 나란히 (630 + 15 + 630 = 1275, 높이 1120).
 * 세로 위치는 stack()으로 GAP 간격만큼 띄워 계산한다.
 */
export default function AdvertisingBannerDetail() {
    return (
        <DetailCanvas height={HEIGHT}>
            <Label y={newspaper.label} size={LABEL}>&lt;신문 광고&gt;</Label>
            <Pic src={img.newspaper} x={323} y={newspaper.top} w={1275} alt="리버레이크 송파 신문 광고" />

            <Label y={riverlake.label} size={LABEL}>&lt;온라인 배너 · 리버레이크 송파&gt;</Label>
            <Pic src={img.online01} x={323} y={riverlake.top} w={461} alt="리버레이크 송파 세로 배너" />
            <Pic src={img.online02} x={799} y={riverlake.top} w={799} alt="리버레이크 송파 가로 배너 1" />
            <Pic src={img.online03} x={799} y={riverlake.top + 419} w={799} alt="리버레이크 송파 가로 배너 2" />

            <Label y={movie.label} size={LABEL}>&lt;영상 광고 · 리버레이크 송파&gt;</Label>
            <Label x={638} y={movie.sub} size={SUB_LABEL}>15초</Label>
            <Label x={1283} y={movie.sub} size={SUB_LABEL}>30초</Label>
            <Video src={video.riverlake_15} x={323} y={movie.top} w={630} label="리버레이크 송파 15초 영상 광고" />
            <Video src={video.riverlake_30} x={968} y={movie.top} w={630} label="리버레이크 송파 30초 영상 광고" />

            <Label y={exhibition.label} size={LABEL}>&lt;온라인 배너 · 전시회&gt;</Label>
            <Pic src={img.online06} x={323} y={exhibition.top} w={542} alt="ICPI WEEK 세로 배너" />
            <Pic src={img.online04} x={882} y={exhibition.top} w={716} alt="스마트 안전보건박람회 배너" />
            <Pic src={img.online05} x={882} y={exhibition.top + 391} w={716} alt="KPCA SHOW 2025 배너" />
        </DetailCanvas>
    )
}
