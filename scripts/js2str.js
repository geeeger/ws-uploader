const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

// console.log(path.resolve(__dirname, '../', args[0]))

const config = require(path.resolve(__dirname, '../', args[0]));

const input = fs.readFileSync(config.output.file).toString().replace('var ' + config.output.name + '=', '').replace(/\n$/, '').replace(/\\/g, '\\\\');

fs.writeFileSync(config.output.file, `export default \`${input}\``);
