import { forwardRef, useImperativeHandle, useRef } from 'react'
import introCharacter from '../../assets/image/intro/character/intro.png'
import stage01Run from '../../assets/image/intro/character/stage01_run.png'
import stage01Jump from '../../assets/image/intro/character/stage01_jump.png'
import stage01Landing from '../../assets/image/intro/character/stage01_landing.png'
import stage02Run from '../../assets/image/intro/character/stage02_run.png'
import stage02Jump from '../../assets/image/intro/character/stage02_jump.png'
import stage02Landing from '../../assets/image/intro/character/stage02_landing.png'
import stage03Run from '../../assets/image/intro/character/stage03_run.png'
import stage03Jump from '../../assets/image/intro/character/stage03_jump.png'
import stage03Landing from '../../assets/image/intro/character/stage03_landing.png'
import stage04Run from '../../assets/image/intro/character/stage04_run.png'
import styles from './IntroCharacter.module.scss'

const frames = {
    1: { idle: introCharacter, run: stage01Run, jump: stage01Jump, land: stage01Landing, look: introCharacter },
    2: { idle: stage02Run, run: stage02Run, jump: stage02Jump, land: stage02Landing, look: stage02Run },
    3: { idle: stage03Run, run: stage03Run, jump: stage03Jump, land: stage03Landing, look: stage03Run },
    4: { idle: stage04Run, run: stage04Run, jump: stage03Jump, land: stage03Landing, look: stage04Run },
}

const IntroCharacter = forwardRef(function IntroCharacter({ stage = 1, state = 'idle' }, ref) {
    const outerRef = useRef(null)
    const bodyRef = useRef(null)
    const source = frames[stage]?.[state] || frames[stage]?.run

    useImperativeHandle(ref, () => ({ outer: outerRef.current, body: bodyRef.current }))

    return <div className={`${styles.scope} intro-character`} data-state={state} ref={outerRef}><img ref={bodyRef} alt="Kim Hyeonsu game character" src={source} /></div>
})

export default IntroCharacter
