import ps from '../assets/image/intro/item/item_ps.png'
import ai from '../assets/image/intro/item/item_ai.png'
import xd from '../assets/image/intro/item/item_xd.png'
import indesign from '../assets/image/intro/item/item_id.png'
import ae from '../assets/image/intro/item/item_ae.png'
import pr from '../assets/image/intro/item/item_pr.png'
import c4d from '../assets/image/intro/item/item_c4d.png'
import figma from '../assets/image/intro/item/item_figma.png'
import code from '../assets/image/intro/item/item_coding.png'
import slack from '../assets/image/intro/item/item_slack.png'
import notion from '../assets/image/intro/item/item_notion.png'
import coffee from '../assets/image/intro/item/item_caffe.png'
import git from '../assets/image/intro/item/item_git.png'
import react from '../assets/image/intro/item/item_react.png'
import next from '../assets/image/intro/item/item_next.png'
import aiTools from '../assets/image/intro/item/item_ais.png'

/**
 * 인트로 스테이지에서 먹는 아이템 — 스테이지별로 나눠 두고, 인벤토리는 전체(allIntroItems)를 한 줄로 보여준다
 *
 *   distance  캐릭터로부터의 거리(w)
 *   y         아이템 중심의 세로 위치(%, PC 화면 기준) = 100 - 스테이지 잔디선(ground) - 잔디선 위 높이
 *   size      이미지 너비(w). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13×13으로 같아 보이도록 이미지별로 계산한 값
 *             (인벤토리 칸은 이 값으로 맞춘다)
 *   scale     공중에서만 키우거나 줄이는 배율 — 높고 어려운 아이템일수록 크게
 *
 * 높이 단계 (잔디선 위 높이, IntroStageGame.jsx RUN_ITEM_MAX · SINGLE_ITEM_MAX):
 *   바닥 12~13 달리면서 / 낮은 점프 29~31 / 높은 점프 38~39 (한 번 점프 꼭대기) / 이중 점프 48~49 (꼭대기에서 한 번 더)
 * 이중 점프 바로 뒤에는 착지할 여유를 두고 다음 아이템을 놓는다
 */
export const introItems = {
    // 잔디선 19.2
    stage01: [
        { id: 'ps', src: ps, label: 'PHOTOSHOP GET!', distance: 75, y: 67.8, size: 20.8, scale: 0.85 }, // 바닥
        { id: 'ai', src: ai, label: 'ILLUSTRATOR GET!', distance: 135, y: 42.8, size: 14.2, scale: 1.1 }, // 높은 점프
        { id: 'xd', src: xd, label: 'XD GET!', distance: 200, y: 32.8, size: 16.8, scale: 1.3 }, // 이중 점프
        { id: 'id', src: indesign, label: 'INDESIGN GET!', distance: 262, y: 68.8, size: 14.5, scale: 0.8 }, // 바닥
        { id: 'ae', src: ae, label: 'AFTER EFFECTS GET!', distance: 322, y: 50.8, size: 17.5, scale: 1 }, // 낮은 점프
    ],
    // 잔디선 20.4
    stage02: [
        { id: 'pr', src: pr, label: 'PREMIERE PRO GET!', distance: 75, y: 50.6, size: 14.3, scale: 1 }, // 낮은 점프
        { id: 'c4d', src: c4d, label: 'CINEMA 4D GET!', distance: 132, y: 67.6, size: 16.6, scale: 0.8 }, // 바닥
        { id: 'figma', src: figma, label: 'FIGMA GET!', distance: 198, y: 30.6, size: 16.2, scale: 1.3 }, // 이중 점프
        { id: 'code', src: code, label: 'HTML · CSS · JS GET!', distance: 265, y: 40.6, size: 14.8, scale: 1.1 }, // 높은 점프
    ],
    // 잔디선 19.5
    stage03: [
        { id: 'slack', src: slack, label: 'SLACK GET!', distance: 75, y: 67.5, size: 14.3, scale: 0.85 }, // 바닥
        { id: 'notion', src: notion, label: 'NOTION GET!', distance: 142, y: 32.5, size: 15.2, scale: 1.25 }, // 이중 점프
        { id: 'coffee', src: coffee, label: 'COFFEE GET!', distance: 210, y: 49.5, size: 13.6, scale: 0.95 }, // 낮은 점프
    ],
    // 잔디선 19.5 — 마지막 AI TOOLS는 이중 점프로 마무리
    stage04: [
        { id: 'git', src: git, label: 'GITHUB GET!', distance: 75, y: 67.5, size: 14.4, scale: 0.85 }, // 바닥
        { id: 'react', src: react, label: 'REACT GET!', distance: 135, y: 50.5, size: 16.4, scale: 1 }, // 낮은 점프
        { id: 'next', src: next, label: 'NEXT.JS GET!', distance: 195, y: 41.5, size: 16, scale: 1.1 }, // 높은 점프
        { id: 'aitools', src: aiTools, label: 'AI TOOLS GET!', distance: 265, y: 31.5, size: 15.3, scale: 1.3 }, // 이중 점프
    ],
}

export const allIntroItems = Object.values(introItems).flat()

// 인벤토리에 담는 모양 { id, src, name, size }
export const toInventoryItem = (item) => ({ id: item.id, src: item.src, name: item.label.replace(' GET!', ''), size: item.size ?? 15 })

// 스테이지 index(0부터)로 바로 갈 때 인벤토리: 앞 스테이지들의 아이템은 모두 먹은 상태, 그 스테이지부터는 아직(회색)
export const inventoryBeforeStage = (index) => Object.values(introItems).slice(0, index).flat().map(toInventoryItem)
