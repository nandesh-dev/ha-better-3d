export type HomeAssistantState = {
    state: boolean
    attributes: { [key: string]: unknown }
}

export type HomeAssistantStates = { [key: string]: HomeAssistantState }

export type HomeAssistant = {
    states: HomeAssistantStates
}
