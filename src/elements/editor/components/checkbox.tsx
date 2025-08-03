export type CheckboxParameters = {
    label: string
    value: boolean
    onValueChange: (newValue: boolean) => void
}

export function Checkbox(parameters: CheckboxParameters) {
    return (
        <div class="checkbox">
            <span>{parameters.label}</span>
            <input
                type="checkbox"
                checked={parameters.value}
                onChange={(e) => parameters.onValueChange(e.currentTarget.checked)}
            />
        </div>
    )
}
