import { Configuration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'
import { Logger } from '@/utility/logger'

export const CARD_CUSTOM_ELEMENT_TAGNAME = process.env.PRODUCTION ? 'better-3d-card' : 'better-3d-card_development'

const LOG_DISAPPEAR_TIME = 5 * 1000

function Card({ config, homeAssistant }: ComponentProps) {
    if (!config || !homeAssistant) return

    const ref = useRef<HTMLDivElement>(null)
    const [styles, setStyles] = useState('')
    const [visual, setVisual] = useState<Visual>()
    const [logger, _] = useState(() => new Logger())
    const [logs, setLogs] = useState<string[]>([])

    useEffect(() => {
        logger.onLog((log) => {
            setLogs((logs) => [...logs, log])

            setTimeout(() => {
                setLogs((logs) => logs.slice(1))
            }, LOG_DISAPPEAR_TIME)
        })
    }, [logger])

    useEffect(() => {
        if (!ref.current) return

        const visual = new Visual(
            { height: ref.current.clientHeight, width: ref.current.clientWidth },
            new Configuration(config),
            homeAssistant,
            logger
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
        logger.setLevel(configuration.logLevel)
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
            <div class="card">
                <div class="visual" ref={ref} />
                <div class="logs">
                    {logs.map((log) => {
                        return <p class="logs__log">{log}</p>
                    })}
                </div>
            </div>
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
    log_level: 'error',
    styles: `
      .card {
        position: relative;
        width: 100%;
        aspect-ratio: 2/1;
      }

      .visual {
        width: 100%;
        height: 100%;
      }

      .logs {
        position: absolute;
        bottom: 0;
        right: 0;
      }

      .logs__log {
        text-align: right;
        padding: 0.5rem 1rem;
        margin: 0;
      }
    `,
    scenes: {
        primary_scene: {
            active_camera: '"primary_camera"',
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
                light: {
                    type: 'light.point',
                    position: {
                        x: '15',
                        y: '4',
                        z: '10',
                    },
                    intensity: '2000',
                    color: 'Color.fromHEX("#ffffff")',
                    visible: 'true',
                },
                logo: {
                    type: 'card',
                    config: {
                        type: 'picture',
                        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
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
                        x: '1',
                        y: '1',
                        z: '1',
                    },
                    visible: 'true',
                },
            },
        },
    },
})
