import { ChangeEventHandler } from 'preact/compat'

import style from './style.css?raw'

export function SliderStyle() {
    return <style>{style}</style>
}

type SliderOptions = {
    children: string
    value: number
    minimum: number
    maximum: number
    step: number
    setValue: (selected: number) => void
}

export function Slider({ children, value, setValue, minimum, maximum, step }: SliderOptions) {
    const onInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        try {
            setValue(parseFloat(e.currentTarget.value))
        } catch {}
    }

    return (
        <div class="slider">
            <label>{children}</label>
            <input type="range" value={value} min={minimum} max={maximum} onInput={onInput} step={step} />
            <input type="number" value={value} onInput={onInput} step={step} />
        </div>
    )
}
