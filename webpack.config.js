var webpack = require('webpack');

module.exports = {
    entry: './test.js',
    output: {
        path: __dirname,
        filename: 'bundle.min.js'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                  presets: 'es2015',
                },
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map'
};
