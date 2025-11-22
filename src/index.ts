import { CARD_ELEMENT_TAGNAME } from './configuration'
import { CardHTMLElement } from './elements/card'
import { EDITOR_ELEMENT_TAG_NAME, EditorHTMLElement } from './elements/editor'

customElements.define(EDITOR_ELEMENT_TAG_NAME, EditorHTMLElement)

customElements.define(CARD_ELEMENT_TAGNAME, CardHTMLElement)
;(window as any).customCards = (window as any).customCards || []
;(window as any).customCards.push({
    type: CARD_ELEMENT_TAGNAME,
    name: 'Better 3D',
    description: 'Fully customizable 3D rendering card',
    documentationURL: 'https://github.com/nandesh-dev/ha-better-3d',
})
