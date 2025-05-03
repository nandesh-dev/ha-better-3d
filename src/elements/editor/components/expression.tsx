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
        else for (let i = values.length; i < patterns[selectedPattern].inputs.length; i++) values.push('')
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

    const createOnCheckedHandler = (i: number): FormEventHandler<HTMLInputElement> => {
        return (e) => {
            if (selectedPattern == 'Custom') {
                configuration.value = e.currentTarget.checked ? 'true' : 'false'
            } else {
                values[i] = e.currentTarget.checked ? 'true' : 'false'
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
                    patterns[selectedPattern].inputs.map(({ type, name }, i) => {
                        if (type == 'number') {
                            return (
                                <input
                                    value={values[i]}
                                    onInput={createOnValueChangeHandler(i)}
                                    type={type}
                                    step={Math.min(Math.ceil(Math.abs(parseFloat(values[i])) / 10), 5)}
                                    key={name}
                                />
                            )
                        }

                        if (type == 'checkbox') {
                            return (
                                <input
                                    checked={values[i] == 'true'}
                                    onInput={createOnCheckedHandler(i)}
                                    type={type}
                                    key={name}
                                />
                            )
                        }

                        return (
                            <input value={values[i]} onInput={createOnValueChangeHandler(i)} type={type} key={name} />
                        )
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

export const EntityRGBColorPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Color\(...Entities\["((?:[^"\\]|\\.)*)\.rgb_color"\].map\(a=>a\/255\)\)$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) =>
        `new Color(...Entities["${values[0].replace('"', '\\"').replace('\\', '\\\\')}.rgb_color"].map(a=>a/255))`,
    inputs: [{ name: 'entity', type: 'string' }],
}

export const EntityBrightnessPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^Entities\["((?:[^"\\]|\\.)+)\.brightness"\]\s*\*(\s*-?\d*\.?\d*\s*)\/ 255$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\'), match[2].trim()] : null
    },
    computeValue: (values) => {
        return `Entities["${values[0].replace('"', '\\"').replace('\\', '\\\\')}.brightness"] * ${values[1]} / 255`
    },
    inputs: [
        { name: 'entity', type: 'string' },
        { name: 'intensity', type: 'number' },
    ],
}

export const Vector3Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector3\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? [match[1].trim(), match[2].trim(), match[3].trim()] : null
    },
    computeValue: (values) => `new Vector3(${parseFloat(values[0])},${parseFloat(values[1])},${parseFloat(values[2])})`,
    inputs: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
        { name: 'z', type: 'number' },
    ],
}

export const Vector2Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector2\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? [match[1].trim(), match[2].trim()] : null
    },
    computeValue: (values) => `new Vector3(${parseFloat(values[0])},${parseFloat(values[1])})`,
    inputs: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
    ],
}

export const EulerPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Euler\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? match.slice(1).map((str) => `${(parseFloat(str) * 180) / Math.PI}`) : null
    },
    computeValue: (values) =>
        `new Euler(${(parseFloat(values[0]) * Math.PI) / 180},${(parseFloat(values[1]) * Math.PI) / 180},${(parseFloat(values[2]) * Math.PI) / 180})`,
    inputs: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
        { name: 'z', type: 'number' },
    ],
}

export const HTMLSizePattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new HTMLSize\("((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\)$/.exec(value)
        return match !== null ? [match[1], match[2]] : null
    },
    computeValue: (values) => `new HTMLSize("${values[0]}", "${values[1]}")`,
    inputs: [
        { name: 'height', type: 'string' },
        { name: 'width', type: 'string' },
    ],
}

export const FixedBoolPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^(true|false)$/.exec(value)
        return match !== null ? [match[1]] : null
    },
    computeValue: (values) => `${values[0]}`,
    inputs: [{ name: 'value', type: 'checkbox' }],
}

export const EntityBoolPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^Entities\["((?:[^"\\]|\\.)*)"\] == "on"$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `Entities["${values[0].replace('"', '\\"').replace('\\', '\\\\')}"] == "on"`,
    inputs: [{ name: 'entity', type: 'string' }],
}
