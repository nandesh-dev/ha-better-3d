import "dotenv/config";
import * as esbuild from "esbuild";

if (!process.env.HA_BETTER_3D_BUILD_OUTPUT_FILEPATH) {
  throw new Error(
    "Build output path not set,\nSet the 'HA_BETTER_3D_BUILD_OUTPUT_FILEPATH' variable in the .env file in project root.",
  );
}

const BUILD_OPTIONS: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  treeShaking: true,
  minify: true,
  jsxFactory: "h",
  jsxFragment: "Fragment",
  outfile: process.env.HA_BETTER_3D_BUILD_OUTPUT_FILEPATH,
};

async function build() {
  await esbuild.build(BUILD_OPTIONS);
}

async function watch() {
  const ctx = await esbuild.context(BUILD_OPTIONS);
  await ctx.watch();
}

if (process.argv.includes("--watch")) {
  watch();
} else {
  build();
}
