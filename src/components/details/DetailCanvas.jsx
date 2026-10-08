import styles from './DetailCanvas.module.scss'

/*
 * 이미지와 제목 글자를 Figma 시안(너비 1920px) 좌표 그대로 배치하는 상세페이지 공용 틀.
 * 좌표는 모두 시안 기준 px 값이고, --u(= 컨테이너 너비 / 1920)를 곱해 팝업 너비에 맞게 같은 비율로 줄어든다.
 *   <DetailCanvas height={시안 전체 높이}>
 *     <Label y={198} size={26}>&lt;목업&gt;</Label>        가운데 정렬 제목 (x 생략 시 화면 가운데)
 *     <Pic src={이미지} x={323} y={280} w={1275} alt="" />  이미지 (높이는 비율대로)
 *     <Video src={영상} x={323} y={3140} w={630} label="" />  영상 (높이는 비율대로, 재생 버튼 포함)
 *   </DetailCanvas>
 * 폴더 이미지를 이름으로 꺼내 쓰려면 byName.js의 byName(import.meta.glob(...))을 쓴다.
 */
const pos = (style) => Object.fromEntries(Object.entries(style).map(([key, value]) => [`--${key}`, value]))

/*
 * 모든 상세페이지가 함께 쓰는 세로 간격 (시안 1920px 기준, 글줄 상자 · 이미지의 가장자리끼리 잰 값).
 * 좌표를 손으로 적지 말고 stack()으로 이 간격만큼 띄워 쌓으면 페이지마다 간격이 같아진다.
 */
export const GAP = {
    line: 16, //     소제목 글 → 바로 아래 설명 글
    near: 40, //     이미지 · 아이콘 ↔ 딸린 글, 문단 ↔ 문단, 한 묶음 안의 이미지 ↔ 이미지
    title: 60, //    제목 → 그 내용
    item: 100, //    한 섹션 안의 덩어리 ↔ 덩어리, 색 띠 안쪽 위 · 아래 여백
    section: 220, // 섹션 ↔ 섹션, 페이지 위 · 아래 여백
}

// 이미지를 너비 w로 넣었을 때의 높이 (size: 원본 [너비, 높이])
export const fitHeight = (w, [width, height]) => (w * height) / width

/*
 * 위에서부터 차례로 쌓으며 y 좌표를 계산한다 (앞 요소의 아래 끝에서 gap만큼 띄운다).
 *   const flow = stack(1209)                  시작 위치 (앞 요소의 아래 끝)
 *   flow.text(30, GAP.section)                글 한 줄 → 세로 가운데 y (글줄 높이 = 글자 크기 × 1.2)
 *   flow.lines(2, 30, 53, GAP.title)          여러 줄 (줄 간격 53) → 줄마다 세로 가운데 y
 *   flow.box(1000, GAP.item)                  이미지 · 상자 (높이 1000) → 위쪽 y
 *   flow.bottom                               지금까지의 아래 끝
 *   flow.skip(y)                              아래 끝을 y로 옮긴다 (나란히 놓인 덩어리 중 가장 긴 것에 맞출 때)
 */
export function stack(start = 0) {
    let bottom = start
    const place = (gap, height) => {
        const top = bottom + gap
        bottom = top + height
        return top
    }
    return {
        get bottom() {
            return bottom
        },
        box: (height, gap = 0) => place(gap, height),
        text: (size, gap = 0) => place(gap, size * 1.2) + size * 0.6,
        lines: (count, size, pitch, gap = 0) => {
            const top = place(gap, (count - 1) * pitch + size * 1.2)
            return Array.from({ length: count }, (_, index) => top + size * 0.6 + index * pitch)
        },
        skip: (y) => {
            bottom = y
        },
    }
}

export function Pic({ src, x, y, w, alt = '' }) {
    return <img className="detail-pic" src={src} alt={alt} loading="lazy" draggable="false" style={pos({ x, y, w })} />
}

// 영상 (높이는 비율대로). 누르면 재생되고, 재생 전에는 첫 부분 정보만 받아 팝업이 무거워지지 않는다
export function Video({ src, x, y, w, label = '' }) {
    return <video className="detail-video" src={src} controls preload="metadata" playsInline aria-label={label} style={pos({ x, y, w })} />
}

// y는 글줄의 세로 가운데, x는 가운데
export function Label({ x = 960, y, size, children }) {
    return <h3 className="detail-label" style={pos({ x, y, size })}>{children}</h3>
}

export default function DetailCanvas({ height, children }) {
    return (
        <div className={`${styles.scope} detail`}>
            <div className="detail-canvas" style={pos({ height })}>{children}</div>
        </div>
    )
}
