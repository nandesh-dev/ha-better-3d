import { FormEventHandler } from 'preact/compat'
import { useState } from 'preact/hooks'

export type SliderParameters = {
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    onValueChange: (newValue: number) => void
}

export function Slider(parameters: SliderParameters) {
    const [maxValue, setMaxValue] = useState(Math.max(Math.round(Math.abs(parameters.value)) * 3, 1))

    const handleRangeInput: FormEventHandler<HTMLInputElement> = (e) => {
        const newValue = parseFloat(e.currentTarget.value)
        if (isNaN(newValue)) return
        parameters.onValueChange(newValue)
    }

    const handleRangeEnded: FormEventHandler<HTMLInputElement> = (e) => {
        const newValue = parseFloat(e.currentTarget.value)
        if (isNaN(newValue)) return
        setMaxValue(Math.max(Math.round(Math.abs(newValue)) * 3, 1))
    }

    const handleValueChange: FormEventHandler<HTMLInputElement> = (e) => {
        const newValue = parseFloat(e.currentTarget.value)
        if (isNaN(newValue)) return
        parameters.onValueChange(newValue)
        setMaxValue(Math.max(Math.round(Math.abs(newValue)) * 3, 1))
    }

    return (
        <div class="slider">
            <div class="slider__top">
                <span>{parameters.label}</span>
                <input class="slider__value" value={parameters.value} size={8} onChange={handleValueChange} />
            </div>
            <input
                class="slider__range"
                type="range"
                value={parameters.value}
                max={parameters.max === undefined ? maxValue : parameters.max}
                min={parameters.min === undefined ? -maxValue : parameters.min}
                step={parameters.step === undefined ? maxValue / 40 : parameters.step}
                onInput={handleRangeInput}
                onMouseUp={handleRangeEnded}
                onTouchEnd={handleRangeEnded}
                onKeyUp={handleRangeEnded}
            />
        </div>
    )
}
