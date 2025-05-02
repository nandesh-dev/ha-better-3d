import { Configuration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { EDITOR_CUSTOM_ELEMENT_TAGNAME } from '../editor'
import { DEFAULT_CONFIG } from './default_config'

export const CARD_CUSTOM_ELEMENT_TAGNAME = process.env.PRODUCTION ? 'better-3d-card' : 'better-3d-card_development'

function Card({ config, homeAssistant }: ComponentProps) {
    if (!config || !homeAssistant) return

    const ref = useRef<HTMLDivElement>(null)
    const [styles, setStyles] = useState('')
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
        const configuration = new Configuration(config)
        setStyles(configuration.styles)

        if (!visual) return
        visual.updateConfig(configuration)
    }, [config, visual])

    useEffect(() => {
        if (!visual) return

        visual.updateHomeAssistant(homeAssistant)
    }, [homeAssistant, visual])

    return (
        <>
            <style>{styles}</style>
            <div class="card" ref={ref} />
        </>
    )
}

export function registerCard() {
    registerElement(
        CARD_CUSTOM_ELEMENT_TAGNAME,
        Card,
        {
            getStubConfig: () => {
                return DefaultConfiguration.encode()
            },
            getConfigElement: () => {
                return document.createElement(EDITOR_CUSTOM_ELEMENT_TAGNAME)
            },
        },
        {
            name: 'Better 3D',
            description: 'Fully customizable 3D rendering card',
            documentationURL: 'https://github.com/nandesh-dev/ha-better-3d',
        }
    )
}

const DefaultConfiguration = new Configuration(DEFAULT_CONFIG)
