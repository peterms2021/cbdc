import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

//import resolve from "@rollup/plugin-node-resolve";
//import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  onwarn: function (warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if (warning.code === "THIS_IS_UNDEFINED") {
      return;
    }

    // console.warn everything else
    console.warn(warning.message);
  },
  output: {
    dir: "../banking_app/dist/src",
    format: "es",
    preserveModules: true,
    sourcemap: true,
    preserveModulesRoot: "src",
  },
  plugins: [nodeResolve(), typescript(), commonjs(), json()],
};
