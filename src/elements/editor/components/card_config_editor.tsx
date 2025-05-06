import { FormEventHandler } from 'preact/compat'
import { useEffect, useRef, useState } from 'preact/hooks'
import { parse, stringify } from 'yaml'

import { CardConfigConfiguration } from '@/configuration/objects'

export type CardConfigEditorProperties = {
    label: string
    configuration: CardConfigConfiguration
    onChange: () => void
}

export function CardConfigEditor({ label, configuration, onChange }: CardConfigEditorProperties) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [configString, setConfigString] = useState<string>(stringify(configuration.config))

    useEffect(() => {
        if (!textAreaRef.current) return

        const eventListener = (e: KeyboardEvent) => {
            if (!e.currentTarget || e.key !== 'Tab') return
            e.preventDefault()

            const textAreaElement = e.currentTarget as HTMLTextAreaElement
            const { value, selectionStart, selectionEnd } = textAreaElement

            textAreaElement.value = `${value.substring(0, selectionStart)}  ${value.substring(selectionEnd)}`
            textAreaElement.selectionStart = textAreaElement.selectionEnd = selectionEnd + 2
        }

        textAreaRef.current.addEventListener('keydown', eventListener)

        return () => textAreaRef.current?.removeEventListener('keydown', eventListener)
    }, [textAreaRef])

    useEffect(() => {
        const parsedConfig = parse(configString)
        configuration.config = parsedConfig
        configuration.type = parsedConfig.type || ''
        onChange()
    }, [configString])

    const onTextAreaValueChange: FormEventHandler<HTMLTextAreaElement> = (e) => {
        setConfigString(e.currentTarget.value)
    }

    return (
        <div class="config-editor">
            <span>{label}</span>
            <textarea
                class="config-editor-textarea"
                value={configString}
                onInput={onTextAreaValueChange}
                ref={textAreaRef}
            />
        </div>
    )
}
