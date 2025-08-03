export type ButtonParameters = {
    name: string
    dissabled?: boolean
    onClick: () => void
    type?: 'normal' | 'danger'
}

export function Button(parameters: ButtonParameters) {
    const handleOnClick = () => {
        if (parameters.dissabled) return
        parameters.onClick()
    }

    return (
        <button
            class={`button ${parameters.type === 'danger' && 'button--danger'}`}
            disabled={parameters.dissabled}
            onClick={handleOnClick}
        >
            {parameters.name}
        </button>
    )
}
