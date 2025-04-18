import 'dotenv/config'
import * as esbuild from 'esbuild'
import path from 'path'

if (!process.env.HA_BETTER_3D_BUILD_OUTPUT_FILEPATH) {
    throw new Error(
        "Build output path not set,\nSet the 'HA_BETTER_3D_BUILD_OUTPUT_FILEPATH' variable in the .env file in project root."
    )
}

const DefaultESBuildOptions: esbuild.BuildOptions = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    treeShaking: true,
    minify: false,
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    outfile: process.env.HA_BETTER_3D_BUILD_OUTPUT_FILEPATH,
    loader: {
        '.css': 'text',
    },
    alias: {
        '@/*': path.resolve(__dirname, 'src'),
    },
}

async function build() {
    await esbuild.build({ ...DefaultESBuildOptions, define: { 'process.env.PRODUCTION': 'true' } })
}

async function watch() {
    const ctx = await esbuild.context({
        ...DefaultESBuildOptions,
        define: { 'process.env.PRODUCTION': 'false' },
    })
    await ctx.watch()
}

if (process.argv.includes('--watch')) {
    watch()
} else {
    build()
}
