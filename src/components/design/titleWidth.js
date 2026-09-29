// 제목이 한 줄에 들어가도록 글자 크기를 줄일 때 쓰는 "제목 너비(em 단위)" 추정값.
// Inter Bold / Noto Sans KR Bold 기준 대략적인 글자 폭 (한글은 넓고, 공백은 좁다)
export function titleWidthEm(title = '') {
    let width = 0
    for (const char of title) {
        if (/[가-힣]/.test(char)) width += 0.98
        else if (char === ' ') width += 0.28
        else if (/[A-Z0-9]/.test(char)) width += 0.7
        else width += 0.55
    }
    // 글자 간격(letter-spacing)과 여유분
    return Math.max(width * 1.04, 1)
}
