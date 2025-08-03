import { registerCard } from './elements/card'
import { EDITOR_ELEMENT_TAG_NAME, EditorHTMLElement } from './elements/editor'

customElements.define(EDITOR_ELEMENT_TAG_NAME, EditorHTMLElement)
registerCard()
