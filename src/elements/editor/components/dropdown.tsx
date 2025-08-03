export type DropdownParameters<O extends readonly string[]> = {
    selected: O[number]
    options: O
    onSelectedChange: (newSelected: O[number]) => void
}

export function Dropdown<O extends readonly string[]>(parameters: DropdownParameters<O>) {
    return (
        <select
            class="dropdown"
            value={parameters.selected}
            onChange={(e) => parameters.onSelectedChange(e.currentTarget.value)}
        >
            {parameters.options.map((option) => {
                return (
                    <option>
                        <span>{option}</span>
                    </option>
                )
            })}
        </select>
    )
}
