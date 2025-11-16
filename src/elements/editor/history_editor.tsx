import { Configuration } from '@/configuration'
import { useEffect, useState } from 'preact/hooks'

import { getConfigurationHistory } from '@/utility/configuration_history'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp)
    const padding = (n: number) => String(n).padStart(2, '0')

    if (Date.now() - timestamp <= DAY) {
        return `${padding(date.getHours())} Hr ${padding(date.getMinutes())} Min ${padding(date.getSeconds())} Sec`
    }

    return `${padding(date.getDate())} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

function formatTimeAgo(timestamp: number) {
    const difference = Math.floor((Date.now() - timestamp) / 1000)

    if (difference < 5) return 'just now'
    if (difference < 60) return difference + ' Sec' + (difference > 1 ? 's' : '') + ' ago'

    const minutes = Math.floor(difference / 60)
    if (minutes < 60) return minutes + ' Min' + (minutes > 1 ? 's' : '') + ' ago'

    const hours = Math.floor(difference / 3600)
    if (hours < 24) return hours + ' Hour' + (hours > 1 ? 's' : '') + ' ago'

    const days = Math.floor(difference / 86400)
    if (days < 30) return days + ' Day' + (days > 1 ? 's' : '') + ' ago'

    const months = Math.floor(difference / (86400 * 30))
    if (months < 12) return months + ' Month' + (months > 1 ? 's' : '') + ' ago'

    const years = Math.floor(difference / (86400 * 365))
    return years + ' Year' + (years > 1 ? 's' : '') + ' ago'
}

export type HistoryEditorParameters = {
    configuration: Configuration
    onConfigurationRecover: (configuration: Configuration) => void
}

export function HistoryEditor(parameters: HistoryEditorParameters) {
    const [history, setHistory] = useState<{ timestamp: number; configuration: Configuration }[]>([])

    useEffect(() => {
        getConfigurationHistory().then((history) => {
            setHistory(history)
        })
    }, [])

    return (
        <div class="panel">
            <div class="panel__section">
                <span class="panel__label">HISTORY</span>
                {history.map(({ timestamp, configuration }) => {
                    const recoverConfiguration = () => {
                        parameters.onConfigurationRecover(configuration)
                    }

                    const isCurrentConfiguration =
                        JSON.stringify(parameters.configuration) === JSON.stringify(configuration)

                    return (
                        <div key={timestamp} class="history-editor__row">
                            <p class="history-editor__row__detail">{formatTimestamp(timestamp)}</p>
                            <p class="history-editor__row__detail">
                                {formatTimeAgo(timestamp) + (isCurrentConfiguration ? ' [ Current ]' : '')}
                            </p>
                            <button class="button" onClick={recoverConfiguration}>
                                Recover
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
