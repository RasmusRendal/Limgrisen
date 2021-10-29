const path = require('path');

let config_arg = process.argv[process.argv.length-1];
let split_arg = config_arg.split('.')
let extension = split_arg[split_arg.length-1];

if (extension === 'json') {
    config_path = path.resolve(config_arg);
    module.exports = require(config_path);
} else {
    module.exports = require('../config.json');
}
