import { FormEventHandler } from 'preact/compat'

export type SelectProperties = {
    label: string
    selected: string
    options: string[]
    setSelected: (selected: string) => void
}

export function Select({ label, selected, options, setSelected }: SelectProperties) {
    const onChange: FormEventHandler<HTMLSelectElement> = (e) => {
        setSelected(e.currentTarget.value)
    }

    return (
        <div class="select">
            <span>{label}</span>
            <select class="select-input" value={selected} onChange={onChange}>
                {options.map((option) => {
                    return <option key={option}>{option}</option>
                })}
            </select>
        </div>
    )
}
