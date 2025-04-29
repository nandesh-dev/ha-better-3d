import { Configuration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { EDITOR_CUSTOM_ELEMENT_TAGNAME } from '../editor'

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

const DefaultConfiguration = new Configuration({
    type: `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`,
    active_scene: '"primary_scene"',
    styles: `.card {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
}

.visual {
  position: relative;
  width: 100%;
  height: 100%;
}

.visual__renderer {
  width: 100%;
  height: 100%;
}

.visual__error {
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  white-space: pre;
  color: var(--primary-text-color);
}`,
    scenes: {
        primary_scene: {
            active_camera: '"primary_camera"',
            background_color: 'new Color("#eeeeee")',
            cameras: {
                primary_camera: {
                    type: 'orbital.perspective',
                    fov: '50',
                    near: '0.1',
                    far: '10000',
                    position: {
                        x: '500',
                        y: '50',
                        z: '-100',
                    },
                    look_at: {
                        x: '0',
                        y: '0',
                        z: '0',
                    },
                },
            },
            objects: {
                point_light: {
                    type: 'light.point',
                    position: {
                        x: '15',
                        y: '4',
                        z: '10',
                    },
                    intensity: '2000',
                    color: 'new Color("#ffffff")',
                    visible: 'true',
                },
                ambient_light: {
                    type: 'light.ambient',
                    intensity: '1',
                    color: 'new Color("#ffffff")',
                    visible: 'true',
                },
                logo: {
                    type: 'card.3d',
                    config: {
                        type: 'picture',
                        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
                        card_mod: {
                            style: `ha-card {
  background: none !important;
  box-shadow: none;
}`,
                        },
                    },
                    size: {
                        height: '"auto"',
                        width: '"auto"',
                    },
                    position: {
                        x: '0',
                        y: '0',
                        z: '0',
                    },
                    rotation: {
                        x: '0',
                        y: 'Math.PI / 2',
                        z: '0',
                    },
                    scale: {
                        height: '1',
                        width: '1',
                    },
                    visible: 'true',
                },
            },
        },
    },
})
