export type InputParameters = {
    value: string
    placeholder: string
    onValueChange: (newValue: string) => void
}

export function Input(parameters: InputParameters) {
    return (
        <input
            class="input"
            value={parameters.value}
            placeholder={parameters.placeholder}
            onInput={(e) => parameters.onValueChange(e.currentTarget.value)}
        />
    )
}
