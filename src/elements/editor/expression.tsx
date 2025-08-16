import { useState } from 'preact/hooks'

import { Expression as ConfigurationExpression } from '@/configuration/value'

import { Checkbox } from './components/checkbox'
import { Dropdown } from './components/dropdown'
import { Input } from './components/input'
import { Slider } from './components/slider'
import { TextArea } from './components/text_area'

export type ExpressionParameters = {
    label: string
    value: ConfigurationExpression
    onValueChange: (newValue: ConfigurationExpression) => void
    patterns: { [name: string]: Pattern }
}

export function Expression(parameters: ExpressionParameters) {
    const [selectedPattern, setSelectedPattern] = useState(() => {
        for (const patternName in parameters.patterns) {
            const result = parameters.patterns[patternName].matchRegex(parameters.value)
            if (result !== null) return patternName
        }
        return 'Custom'
    })

    let values
    if (selectedPattern == 'Custom') {
        values = [parameters.value]
    } else {
        const result = parameters.patterns[selectedPattern].matchRegex(parameters.value)
        if (result !== null) {
            values = [...result]
        } else {
            values = new Array(parameters.patterns[selectedPattern].inputs.length).map(() => '')
        }
    }

    const selectPattern = (newPatternName: string) => {
        parameters.onValueChange(parameters.patterns[newPatternName].computeValue([]))
        setSelectedPattern(newPatternName)
    }

    const updateValue = (newValue: string, index: number) => {
        if (selectedPattern === 'Custom') {
            parameters.onValueChange(newValue)
            return
        }
        const newValues = [...values]
        newValues[index] = newValue.toString()
        parameters.onValueChange(parameters.patterns[selectedPattern].computeValue(newValues))
    }

    return (
        <div class="expression">
            <span class="panel__label">{parameters.label.toUpperCase()}</span>
            <Dropdown
                options={['Custom', ...Object.keys(parameters.patterns)]}
                selected={selectedPattern}
                onSelectedChange={selectPattern}
            />
            <div class="expression__values">
                {selectedPattern == 'Custom' ? (
                    <TextArea
                        value={values[0]}
                        placeholder="Javascript Code"
                        onValueChange={(newValue) => updateValue(newValue, 0)}
                    />
                ) : (
                    parameters.patterns[selectedPattern].inputs.map((input, i) => {
                        const { type, name } = input
                        if (type === 'number') {
                            return (
                                <Slider
                                    key={selectedPattern + i}
                                    label={name}
                                    value={isNaN(parseFloat(values[i])) ? 0 : parseFloat(values[i])}
                                    onValueChange={(newValue) => updateValue(newValue.toString(), i)}
                                    min={input.min}
                                    max={input.max}
                                />
                            )
                        }

                        if (type === 'bool') {
                            return (
                                <Checkbox
                                    key={selectedPattern + i}
                                    label={name}
                                    value={values[i] === 'true'}
                                    onValueChange={(newValue) => updateValue(newValue ? 'true' : 'false', i)}
                                />
                            )
                        }

                        return (
                            <Input
                                key={selectedPattern + i}
                                placeholder={name}
                                value={values[i] || ''}
                                onValueChange={(newValue) => updateValue(newValue, i)}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
}

export type Pattern = {
    matchRegex: (expression: ConfigurationExpression) => string[] | null
    computeValue: (values: string[]) => ConfigurationExpression
    inputs: ({ name: string; type: 'string' | 'bool' } | { name: string; type: 'number'; min?: number; max?: number })[]
}

export const FixedStringPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^"((?:[^"\\]|\\.)*)"$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `"${(values[0] || '').replace('"', '\\"').replace('\\', '\\\\')}"`,
    inputs: [{ name: 'string', type: 'string' }],
}

export const FixedNumberPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^(\s*-?\d*\.?\d*\s*)$/.exec(value)
        return match !== null ? [match[1].trim()] : null
    },
    computeValue: (values) => `${parseFloat(values[0] || '0')}`,
    inputs: [{ name: 'number', type: 'number' }],
}

export const FixedColorPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Color\("((?:[^"\\]|\\.)*)"\)$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `new Color("${(values[0] || '').replace('"', '\\"').replace('\\', '\\\\')}")`,
    inputs: [{ name: 'color', type: 'string' }],
}

export const EntityRGBColorPattern: Pattern = {
    matchRegex: (value) => {
        const match =
            /^new Color\(...\(Entities\["((?:[^"\\]|\\.)*)\.rgb_color"\]\s*\|\|\s*\[0,0,0\]\).map\(a=>a\/255\)\)$/.exec(
                value
            )
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) =>
        `new Color(...(Entities["${(values[0] || '').replace('"', '\\"').replace('\\', '\\\\')}.rgb_color"] || [0,0,0]).map(a=>a/255))`,
    inputs: [{ name: 'entity', type: 'string' }],
}

export const EntityBrightnessPattern: Pattern = {
    matchRegex: (value) => {
        const match =
            /^\(Entities\["((?:[^"\\]|\\.)*)\.brightness"\]\s?\|\|\s?0\)\s?\*(\s*-?\d*\.?\d*\s*)\/\s?255$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\'), match[2].trim()] : null
    },
    computeValue: (values) => {
        return `(Entities["${(values[0] || '').replace('"', '\\"').replace('\\', '\\\\')}.brightness"] || 0) * ${values[1] || '1'} / 255`
    },
    inputs: [
        { name: 'entity', type: 'string' },
        { name: 'intensity', type: 'number' },
    ],
}

export const FixedVector3Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector3\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? [match[1].trim(), match[2].trim(), match[3].trim()] : null
    },
    computeValue: (values) =>
        `new Vector3(${parseFloat(values[0] || '0')},${parseFloat(values[1] || '0')},${parseFloat(values[2] || '0')})`,
    inputs: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
        { name: 'z', type: 'number' },
    ],
}

export const FixedCombinedVector3Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector3\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        if (match === null) return null
        if (match[1].trim() === match[2].trim() && match[2].trim() === match[3].trim()) return [match[1].trim()]
        return null
    },
    computeValue: (values) =>
        `new Vector3(${parseFloat(values[0] || '0')},${parseFloat(values[0] || '0')},${parseFloat(values[0] || '0')})`,
    inputs: [{ name: 'xyz', type: 'number' }],
}

export const FixedVector2Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector2\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? [match[1].trim(), match[2].trim()] : null
    },
    computeValue: (values) => `new Vector2(${parseFloat(values[0] || '0')},${parseFloat(values[1] || '0')})`,
    inputs: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
    ],
}

export const FixedCombinedVector2Pattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Vector2\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        if (match === null) return null
        if (match[1].trim() === match[2].trim()) return [match[1].trim()]
        return null
    },
    computeValue: (values) => `new Vector2(${parseFloat(values[0] || '0')},${parseFloat(values[0] || '0')})`,
    inputs: [{ name: 'xy', type: 'number' }],
}

export const FixedEulerPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new Euler\((\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*),(\s*-?\d*\.?\d*\s*)\)$/.exec(value)
        return match !== null ? match.slice(1).map((str) => `${(parseFloat(str) * 180) / Math.PI}`) : null
    },
    computeValue: (values) =>
        `new Euler(${(parseFloat(values[0] || '0') * Math.PI) / 180},${(parseFloat(values[1] || '0') * Math.PI) / 180},${(parseFloat(values[2] || '0') * Math.PI) / 180})`,
    inputs: [
        { name: 'x', type: 'number', min: -180, max: 180 },
        { name: 'y', type: 'number', min: -180, max: 180 },
        { name: 'z', type: 'number', min: -180, max: 180 },
    ],
}

export const FixedHTMLSizePattern: Pattern = {
    matchRegex: (value) => {
        const match = /^new HTMLSize\("((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\)$/.exec(value)
        return match !== null ? [match[1], match[2]] : null
    },
    computeValue: (values) => `new HTMLSize("${values[0] || ''}", "${values[1] || ''}")`,
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
    computeValue: (values) => `${values[0] || 'false'}`,
    inputs: [{ name: 'value', type: 'bool' }],
}

export const EntityBoolPattern: Pattern = {
    matchRegex: (value) => {
        const match = /^Entities\["((?:[^"\\]|\\.)*)"\] == "on"$/.exec(value)
        return match !== null ? [match[1].replace('\\"', '"').replace('\\\\', '\\')] : null
    },
    computeValue: (values) => `Entities["${(values[0] || '').replace('"', '\\"').replace('\\', '\\\\')}"] == "on"`,
    inputs: [{ name: 'entity', type: 'string' }],
}
