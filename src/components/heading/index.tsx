import style from './style.css?raw'

export function HeadingStyle() {
    return <style>{style}</style>
}
type HeadingParameters = {
    children: string
}

export function Heading({ children }: HeadingParameters) {
    return <h1 class="heading">{children}</h1>
}
