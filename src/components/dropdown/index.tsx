import { ChangeEventHandler } from 'preact/compat'
import { useState } from 'preact/hooks'

import style from './style.css?raw'

export function DropdownStyle() {
    return <style>{style}</style>
}

type DropdownProperties = {
    options: string[]
    selectedOption: string | null
    setSelectedOption: (name: string) => void
    renameOption: (oldName: string, newName: string) => void
    addNewOption: () => void
    deleteOption: (name: string) => void
}

export function Dropdown(props: DropdownProperties) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleDropdown = () => {
        setIsOpen((isOpen) => !isOpen)
    }

    const selectOption = (name: string) => {
        props.setSelectedOption(name)
        setIsOpen(false)
    }

    const renameSelectedOption: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (props.selectedOption == null) return
        props.renameOption(props.selectedOption, e.currentTarget.value)
    }

    const addNewOption = () => props.addNewOption()

    const deleteOption = (name: string) => props.deleteOption(name)

    return (
        <div class="dropdown">
            <div class="top">
                <div class="preview">
                    <input value={props.selectedOption || ''} onInput={renameSelectedOption} />
                    <button onClick={toggleDropdown}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                            <path d="M480-360 280-560h400L480-360Z" />
                        </svg>
                    </button>
                </div>
                <button onClick={addNewOption} class="add-button">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                    </svg>
                </button>
            </div>
            <div class="list-outer">
                {isOpen && (
                    <div class="list">
                        {props.options.map((option) => (
                            <div class={`option ${option == props.selectedOption && 'selected'}`}>
                                <button class="select-button" onClick={() => selectOption(option)}>
                                    {option}
                                </button>
                                <button class="delete-button" onClick={() => deleteOption(option)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="12px"
                                        viewBox="0 -960 960 960"
                                        width="12px"
                                    >
                                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
