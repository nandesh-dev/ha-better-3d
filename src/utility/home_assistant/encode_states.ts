import { HomeAssistantStates } from './types'

export type States = { [key: string]: unknown }

export function encodeStates(rawStates: HomeAssistantStates) {
    const states: States = {}

    for (const rawStateName in rawStates) {
        const { state, attributes } = rawStates[rawStateName]

        states[rawStateName] = state

        for (const attributeName in attributes) {
            states[`${rawStateName}.${attributeName}`] = attributes[attributeName]
        }
    }

    return states
}
