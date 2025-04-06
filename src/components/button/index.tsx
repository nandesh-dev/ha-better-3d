import style from './style.css?raw'

export function ButtonStyle() {
    return <style>{style}</style>
}

type ButtonProperties = {
    children: string
    onClick: () => void
}

export function Button({ children, onClick }: ButtonProperties) {
    return (
        <button class="button" onClick={onClick}>
            {children}
        </button>
    )
}
