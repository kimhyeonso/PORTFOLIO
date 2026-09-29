import styles from './DetailCanvas.module.scss'

/*
 * 이미지와 제목 글자를 Figma 시안(너비 1920px) 좌표 그대로 배치하는 상세페이지 공용 틀.
 * 좌표는 모두 시안 기준 px 값이고, --u(= 컨테이너 너비 / 1920)를 곱해 팝업 너비에 맞게 같은 비율로 줄어든다.
 *   <DetailCanvas height={시안 전체 높이}>
 *     <Label y={198} size={26}>&lt;목업&gt;</Label>        가운데 정렬 제목 (x 생략 시 화면 가운데)
 *     <Pic src={이미지} x={323} y={280} w={1275} alt="" />  이미지 (높이는 비율대로)
 *   </DetailCanvas>
 * 폴더 이미지를 이름으로 꺼내 쓰려면 byName.js의 byName(import.meta.glob(...))을 쓴다.
 */
const pos = (style) => Object.fromEntries(Object.entries(style).map(([key, value]) => [`--${key}`, value]))

export function Pic({ src, x, y, w, alt = '' }) {
    return <img className="detail-pic" src={src} alt={alt} loading="lazy" draggable="false" style={pos({ x, y, w })} />
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
