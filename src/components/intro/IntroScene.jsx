import styles from './IntroScene.module.scss'

export function FilterDefs() {
    return (
        <svg aria-hidden="true" className="intro-filter-defs">
            <filter id="intro-posterize-strong"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .16 .34 .52 .7 .86 1" /><feFuncG type="discrete" tableValues="0 .16 .34 .52 .7 .86 1" /><feFuncB type="discrete" tableValues="0 .16 .34 .52 .7 .86 1" /></feComponentTransfer></filter>
            <filter id="intro-posterize-medium"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1" /><feFuncG type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1" /><feFuncB type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1" /></feComponentTransfer></filter>
            <filter id="intro-posterize-light"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .07 .14 .21 .28 .35 .42 .49 .56 .63 .7 .77 .84 .91 1" /><feFuncG type="discrete" tableValues="0 .07 .14 .21 .28 .35 .42 .49 .56 .63 .7 .77 .84 .91 1" /><feFuncB type="discrete" tableValues="0 .07 .14 .21 .28 .35 .42 .49 .56 .63 .7 .77 .84 .91 1" /></feComponentTransfer></filter>
        </svg>
    )
}

export default function IntroScene({ children, stage, worldRef }) {
    return (
        <main className={`${styles.scope} intro-world`} data-stage={stage} ref={worldRef} aria-label="Kim Hyeonsu portfolio introduction">
            <div className="intro-grid" />
            <div className="intro-scenery" />
            <div className="intro-ground" />
            {children}
        </main>
    )
}
