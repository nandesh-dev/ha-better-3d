import { KeyboardEventHandler } from 'preact/compat'

export type TextAreaParameters = {
    value: string
    placeholder: string
    fullHeight?: boolean
    onValueChange: (newValue: string) => void
}

export function TextArea(parameters: TextAreaParameters) {
    const handleOnKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key == 'Tab') {
            e.preventDefault()
            parameters.onValueChange(parameters.value + '    ')
        }
    }

    return (
        <textarea
            class={`textarea ${parameters.fullHeight && 'textarea--full-height'}`}
            value={parameters.value}
            placeholder={parameters.placeholder}
            onInput={(e) => parameters.onValueChange(e.currentTarget.value)}
            onKeyDown={handleOnKeyDown}
        />
    )
}
