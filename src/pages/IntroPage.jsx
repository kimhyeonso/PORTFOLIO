import IntroStage01 from '../components/intro/IntroStage01.jsx'
import IntroStage02 from '../components/intro/IntroStage02.jsx'
import IntroStage03 from '../components/intro/IntroStage03.jsx'
import IntroStage04 from '../components/intro/IntroStage04.jsx'
import IntroStart from '../components/intro/IntroStart.jsx'
import { useIntroEngine } from '../hooks/useIntroEngine.js'
import styles from './IntroPage.module.scss'

const stageComponents = { stage01: IntroStage01, stage02: IntroStage02, stage03: IntroStage03, stage04: IntroStage04 }

export default function IntroPage({ onEnterMain }) {
    const engine = useIntroEngine({ onEnterMain })
    const Stage = stageComponents[engine.phase]

    return (
        <div className={`${styles.scope} intro-page`}>
            {!engine.started && <IntroStart onSkip={engine.skip} onStart={engine.start} onSelectStage={engine.goToStage} />}
            {engine.started && <Stage key={engine.runId} onClear={engine.clearStage} onSkip={engine.skip} onSelectStage={engine.goToStage} />}
        </div>
    )
}
