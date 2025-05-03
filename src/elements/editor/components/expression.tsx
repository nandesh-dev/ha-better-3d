import { FormEventHandler, HTMLInputTypeAttribute } from 'preact/compat'
import { useState } from 'preact/hooks'

import { Expression as ConfigurationExpression } from '@/configuration/expression'

export type Properties = {
    label: string
    configuration: ConfigurationExpression
    onChange: () => void
    patterns: { [name: string]: Pattern }
}

export function Expression({ label, configuration, onChange, patterns }: Properties) {
    const [selectedPattern, setSelectedPattern] = useState(() => {
        for (const patternName in patterns) {
            const result = patterns[patternName].matchRegex(configuration.value)
            if (result !== null) return patternName
        }
        return 'Custom'
    })

    let values = ['']
    if (selectedPattern == 'Custom') {
        values = [configuration.value]
    } else {
        const result = patterns[selectedPattern].matchRegex(configuration.value)
        if (result !== null) values = result
    }

    const createOnValueChangeHandler = (i: number): FormEventHandler<HTMLInputElement> => {
        return (e) => {
            if (selectedPattern == 'Custom') {
                configuration.value = e.currentTarget.value
            } else {
                values[i] = e.currentTarget.value
                configuration.value = patterns[selectedPattern].computeValue(values)
            }
            onChange()
        }
    }

    const onSelectedPatternChange: FormEventHandler<HTMLSelectElement> = (e) => {
        setSelectedPattern(e.currentTarget.value)
    }

    return (
        <div>
            <span>{label}</span>
            <div>
                {selectedPattern == 'Custom' ? (
                    <input value={values[0]} onInput={createOnValueChangeHandler(0)} type="string" />
                ) : (
                    patterns[selectedPattern].inputs.map(({ type }, i) => {
                        if (type == 'number') {
                            return (
                                <input
                                    value={values[i]}
                                    onInput={createOnValueChangeHandler(i)}
                                    type={type}
                                    step={Math.abs(Math.ceil(parseFloat(values[i]) / 10))}
                                />
                            )
                        }
                        return <input value={values[i]} onInput={createOnValueChangeHandler(i)} type={type} />
                    })
                )}
                <select value={selectedPattern} onChange={onSelectedPatternChange}>
                    {['Custom', ...Object.keys(patterns)].map((patternName) => {
                        return <option>{patternName}</option>
                    })}
                </select>
            </div>
        </div>
    )
}

export type Pattern = {
    matchRegex: (expression: ConfigurationExpression['value']) => string[] | null
    computeValue: (values: string[]) => ConfigurationExpression['value']
    inputs: { name: string; type: HTMLInputTypeAttribute }[]
}

export const FixedStringPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^"((?:[^"\\]|\\.)*)"$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `"${values[0].replace('"', '\\"').replace('\\', '\\\\')}"`,
    inputs: [{ name: 'string', type: 'string' }],
}

export const FixedNumberPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^(\s*-?\d*\.?\d*\s*)$/.exec(value)
        return match !== null ? [match[1].trim()] : null
    },
    computeValue: (values) => `${parseFloat(values[0])}`,
    inputs: [{ name: 'number', type: 'number' }],
}

export const FixedColorPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Color\("((?:[^"\\]|\\.)*)"\)$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `new Color("${values[0].replace('"', '\\"').replace('\\', '\\\\')}")`,
    inputs: [{ name: 'color', type: 'string' }],
}

export const RGBEntityColorPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Color\(...Entities\["((?:[^"\\]|\\.)*)"\].map\(a=>a\/255\)\)$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) =>
        `new Color(...Entities["${values[0].replace('"', '\\"').replace('\\', '\\\\')}"].map(a=>a/255))`,
    inputs: [{ name: 'entity', type: 'string' }],
}

export const Vector3Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector3\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? [match[1].trim(), match[2].trim(), match[3].trim()] : null
    },
    computeValue: (values) => `new Vector3(${parseFloat(values[0])},${parseFloat(values[1])},${parseFloat(values[2])})`,
    inputs: [
        { name: 'X', type: 'number' },
        { name: 'Y', type: 'number' },
        { name: 'Z', type: 'number' },
    ],
}
