const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const uglify = require("rollup-plugin-terser").terser;

module.exports = {
  input: './webworker-script/qetag.js',
  output: {
    file: 'src/ws/qetag.bundle.ts',
    name: "$$qetagWorkerScript",
    format: 'iife'
  },
  plugins: [ resolve(), commonjs(),uglify() ]
};