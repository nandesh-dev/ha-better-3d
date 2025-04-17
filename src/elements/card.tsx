import { Configuration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME } from './card_editor'

function Card({ config, homeAssistant }: ComponentProps) {
    if (!config || !homeAssistant) return

    const ref = useRef<HTMLDivElement>(null)
    const [visual, setVisual] = useState<Visual>()

    useEffect(() => {
        if (!ref.current) return

        const visual = new Visual(
            { height: ref.current.clientHeight, width: ref.current.clientWidth },
            new Configuration(config),
            homeAssistant
        )
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

        visual.updateConfig(new Configuration(config))
    }, [config, visual])

    useEffect(() => {
        if (!visual) return

        visual.updateHomeAssistant(homeAssistant)
    }, [homeAssistant, visual])

    return <div ref={ref} style={{ overflow: 'hidden', width: '100%', aspectRatio: '2/1' }}></div>
}

export const CARD_CUSTOM_ELEMENT_TAGNAME = import.meta.env.PROD ? 'better-3d-card' : 'better-3d-card_development'

export function registerCard() {
    registerElement(CARD_CUSTOM_ELEMENT_TAGNAME, Card, {
        getConfigElement: () => {
            return document.createElement(CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME)
        },
    })
}
