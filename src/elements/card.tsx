import { Config } from '@/configuration/v1'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME } from './card_editor'

function Card({ config }: ComponentProps<Config>) {
    if (!config) return

    const ref = useRef<HTMLDivElement>(null)
    const [visual, setVisual] = useState<Visual>()

    useEffect(() => {
        if (!ref.current) return

        const visual = new Visual({ height: ref.current.clientHeight, width: ref.current.clientWidth }, config)
        ref.current.append(visual.domElement)
        setVisual(visual)

        const resizeObserver = new ResizeObserver(() => {
            if (!ref.current) return
            visual.updateSize({ height: ref.current.clientHeight, width: ref.current.clientWidth })
        })

        resizeObserver.observe(ref.current)

        return () => {
            resizeObserver.disconnect()
            if (ref.current?.contains(visual.domElement)) {
                ref.current.removeChild(visual.domElement)
            }
            visual?.dispose()
        }
    }, [ref.current])

    useEffect(() => {
        if (!visual) return

        visual.updateConfig(config)
    }, [config])

    return <div ref={ref} style={{ overflow: 'hidden', width: '100%', aspectRatio: '2/1' }}></div>
}

export const CARD_CUSTOM_ELEMENT_TAGNAME = 'better-3d-card'

export function registerCard() {
    registerElement(CARD_CUSTOM_ELEMENT_TAGNAME, Card, {
        getConfigElement: () => {
            return document.createElement(CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME)
        },
    })
}
