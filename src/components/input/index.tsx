import { ChangeEventHandler } from 'preact/compat'

import style from './style.css?raw'

export function InputStyle() {
    return <style>{style}</style>
}

type InputOptions = {
    value: string
    children: string
    type: 'expression' | 'value'
    setValue: (newValue: string) => void
}

export function Input({ value, setValue, children, type }: InputOptions) {
    const onInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.currentTarget.value)
    }

    return (
        <div class={`input ${type == 'expression' ? 'expression' : 'value'}`}>
            <label>{children}</label>
            <input defaultValue={value} onInput={onInput} />
        </div>
    )
}
