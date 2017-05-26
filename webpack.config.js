const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './test/index.js',
    output: {
        path: __dirname,
        filename: 'test/index.min.js'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    plugins: ['transform-runtime']
                }
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map'
};
