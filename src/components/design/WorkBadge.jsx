import styles from './WorkBadge.module.scss'

const labels = { client: 'CLIENT WORK', 'in-house': 'IN-HOUSE', proposal: 'PROPOSAL' }

// 실무 작업 표시 뱃지. 썸네일 왼쪽 위에 올린다 (부모가 position: relative). 종류마다 색이 다르다
export default function WorkBadge({ work }) {
    const label = labels[work]
    if (!label) return null
    return <span className={`${styles.scope} work-badge is-${work}`}>{label}</span>
}
