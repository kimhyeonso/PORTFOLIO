import DetailCanvas, { Label, Pic } from './DetailCanvas.jsx'
import { byName } from './byName.js'

// MOUNTAIN EQUIMENT 폴더의 이미지 (예: img.page01)
const img = byName(import.meta.glob('../../assets/image/project/MOUNTAIN EQUIMENT/*.png', { eager: true, import: 'default' }))

// 내지 12장의 시작 y (한 장 높이 약 510px + 간격 30px)
const pageY = [3018, 3558, 4098, 4638, 5179, 5719, 6258, 6798, 7338, 7878, 8419, 8959]

/**
 * MOUNTAIN EQUIPMENT 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것, 시안 1920 × 9649px).
 * <목업> 2장 → <커버> 2장 → <내지> 12장을 가운데 한 줄(x 323, 너비 1275px)로 보여준다.
 */
export default function MountainDetail() {
    return (
        <DetailCanvas height={9649}>
            <Label y={198} size={26}>&lt;목업&gt;</Label>
            <Pic src={img.Mokup01} x={323} y={280} w={1275} alt="카탈로그를 손에 든 목업" />
            <Pic src={img.Mokup02} x={323} y={947} w={1275} alt="카탈로그 펼침면 목업" />

            <Label y={1703} size={26}>&lt;커버&gt;</Label>
            <Pic src={img.cover01} x={323} y={1785} w={1275} alt="앞표지" />
            <Pic src={img.cover02} x={323} y={2321} w={1275} alt="속표지와 뒤표지" />

            <Label y={2937} size={26}>&lt;내지&gt;</Label>
            {pageY.map((y, index) => {
                const name = `page${String(index + 1).padStart(2, '0')}`
                return <Pic key={name} src={img[name]} x={323} y={y} w={1275} alt={`내지 ${index + 1}`} />
            })}
        </DetailCanvas>
    )
}
