import { FormEventHandler } from 'preact/compat'

export type Properties = {
    label: string
    value: string
    setValue: (value: string) => void
}

export function Input({ label, value, setValue }: Properties) {
    const onInput: FormEventHandler<HTMLInputElement> = (e) => {
        setValue(e.currentTarget.value)
    }

    return (
        <div class="input">
            <span>{label}</span>
            <input class="input-input" value={value} onInput={onInput} type="string" />
        </div>
    )
}
