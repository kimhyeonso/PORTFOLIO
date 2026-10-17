import { menus } from '../../../data/profileStatus.js'

/* 포즈 캐러셀 track 계산 (track = 가운데 포즈 번호, 실수 · 원형) */

export const POSE_COUNT = menus.length
// 캐릭터 높이 (GLB는 이 높이로 맞춘다 · 말풍선은 이 위에 뜬다)
export const POSE_HEIGHT = 2.3
// track 기준 포즈 i의 원형 거리 (-POSE_COUNT/2 .. POSE_COUNT/2)
export function poseOffset(i, track) {
    const n = POSE_COUNT
    return ((((i - track) % n) + n * 1.5) % n) - n / 2
}

// 지금 track에서 가장 가까운 '포즈 i' 위치 (원형이므로 여러 바퀴 중 가장 가까운 값)
export function nearestTrack(i, track) {
    return track + poseOffset(i, track)
}

export function trackIndex(track) {
    return ((Math.round(track) % POSE_COUNT) + POSE_COUNT) % POSE_COUNT
}
