import { Configuration } from '@/configuration'

import { Expression as ConfigurationExpression } from '@/configuration/value'

import { DEFAULT_CONFIG } from '../card/default_config'
import { TextArea } from './components/text_area'

export type StyleEditorParameters = {
    configuration: Configuration
    onConfigurationChange: (newConfiguration: Configuration) => void
}

export function StyleEditor(parameters: StyleEditorParameters) {
    const updateStyles = (newStyles: ConfigurationExpression) => {
        parameters.onConfigurationChange({ ...parameters.configuration, styles: newStyles })
    }

    return (
        <div class="panel">
            <div class="panel__section panel__section--full-height">
                <span class="panel__label">STYLE</span>
                <TextArea
                    value={parameters.configuration.styles}
                    onValueChange={updateStyles}
                    placeholder={DEFAULT_CONFIG.styles}
                    fullHeight
                />
            </div>
        </div>
    )
}
