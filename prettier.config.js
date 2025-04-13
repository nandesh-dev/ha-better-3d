/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 120,
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: [
        '<THIRD_PARTY_MODULES>',
        '^@/elements/(.*)$',
        '^@/components/(.*)$',
        '^@/visual/(.*)$',
        '^@/configuration/(.*)$',
        '^@/utility/(.*)$',
        '^[./]',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
}

export default config
