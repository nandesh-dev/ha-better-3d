import { MouseEventHandler } from 'preact/compat'

import style from './style.css?raw'

export function SegmentedButtonsStyle() {
    return <style>{style}</style>
}

type SegmentedButtonsOptions = {
    buttons: string[]
    selected: string
    onChange: (selected: string) => void
}

export function SegmentedButtons({ buttons, selected, onChange }: SegmentedButtonsOptions) {
    return (
        <div class="segmented-buttons">
            {buttons.map((value) => {
                const onClick: MouseEventHandler<HTMLButtonElement> = () => onChange(value)

                return (
                    <button disabled={value == selected} onClick={onClick}>
                        {value}
                    </button>
                )
            })}
        </div>
    )
}
