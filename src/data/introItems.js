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

/**
 * 인트로 스테이지에서 먹는 아이템 — 스테이지별로 나눠 두고, 인벤토리는 전체(allIntroItems)를 한 줄로 보여준다
 *
 *   distance  캐릭터로부터의 거리(u)
 *   y         아이템 중심의 세로 위치(%)
 *   size      이미지 너비(u). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13u×13u로 같아 보이도록 이미지별로 계산한 값
 */
export const introItems = {
    stage01: [
        { id: 'ps', src: ps, label: 'PHOTOSHOP GET!', distance: 75, y: 40, size: 20.8 },
        { id: 'ai', src: ai, label: 'ILLUSTRATOR GET!', distance: 135, y: 46, size: 14.2 },
        { id: 'xd', src: xd, label: 'XD GET!', distance: 195, y: 39, size: 16.8 },
        { id: 'id', src: indesign, label: 'INDESIGN GET!', distance: 255, y: 45, size: 14.5 },
        { id: 'ae', src: ae, label: 'AFTER EFFECTS GET!', distance: 315, y: 40, size: 17.5 },
    ],
    stage02: [
        { id: 'pr', src: pr, label: 'PREMIERE PRO GET!', distance: 75, y: 38, size: 14.3 },
        { id: 'c4d', src: c4d, label: 'CINEMA 4D GET!', distance: 135, y: 47, size: 16.6 },
        { id: 'figma', src: figma, label: 'FIGMA GET!', distance: 195, y: 37, size: 16.2 },
        { id: 'code', src: code, label: 'HTML · CSS · JS GET!', distance: 255, y: 40, size: 14.8 },
    ],
    stage03: [
        { id: 'slack', src: slack, label: 'SLACK GET!', distance: 75, y: 37, size: 14.3 },
        { id: 'notion', src: notion, label: 'NOTION GET!', distance: 135, y: 42, size: 15.2 },
        { id: 'coffee', src: coffee, label: 'COFFEE GET!', distance: 195, y: 39, size: 13.6 },
    ],
    stage04: [
        { id: 'git', src: git, label: 'GITHUB GET!', distance: 75, y: 39, size: 14.4 },
        { id: 'react', src: react, label: 'REACT GET!', distance: 135, y: 44, size: 16.4 },
        { id: 'next', src: next, label: 'NEXT.JS GET!', distance: 195, y: 39, size: 16 },
    ],
}

export const allIntroItems = Object.values(introItems).flat()
