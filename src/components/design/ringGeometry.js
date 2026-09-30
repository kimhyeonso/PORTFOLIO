// 카드 한 장을 세로 띠 몇 장으로 잘라 곡면처럼 보이게 할지 (많을수록 매끈, 대신 무거움)
export const STRIPS = 8

/**
 * 원통 반지름: 띠(한 칸을 STRIPS로 나눈 각도의 현) 너비를 모두 더하면 카드 너비와 딱 같아지게 한다.
 * 이래야 띠마다 카드를 (카드 너비 ÷ STRIPS)씩 밀어 보여줄 때 이미지가 빠짐없이 이어진다.
 * SCSS의 --radius와 같은 식
 */
export function ringRadius(panelWidth, count) {
    return panelWidth / (2 * STRIPS * Math.tan(Math.PI / count / STRIPS))
}
