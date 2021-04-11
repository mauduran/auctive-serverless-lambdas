const slsw = require('serverless-webpack');
const path = require('path');

module.exports = {
    target: 'node',
    mode: 'none',
    entry: slsw.lib.entries,
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname,'/.webpack'),
        filename: '[name].js'
    }
};