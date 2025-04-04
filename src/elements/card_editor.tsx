import { Config } from '@/configuration/v1'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

function CardEditor({ config }: ComponentProps<Config>) {
    if (!config) return

    return <div></div>
}

export const CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME = 'better-3d-card-editor'

export function registerCardEditor() {
    registerElement(CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME, CardEditor, {})
}
