import { Visual } from '@/visual'

const UPDATING_DELAY = 500

var LastCreatedVisual: Visual | null = null

export function getLastCreatedVisual(): Promise<Visual> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (LastCreatedVisual) resolve(LastCreatedVisual)
            else reject('No visual created yet')
        }, UPDATING_DELAY)
    })
}

export function setLastCreatedVisual(visual: Visual) {
    LastCreatedVisual = visual
}
