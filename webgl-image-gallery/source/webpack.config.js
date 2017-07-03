const path = require('path');
const webpack = require('webpack')
const PORT = 9000;

/**
 * NOTE !!!!
 * No build configuration specified, in a normal setup you'd take out the extra javascript and
 * plugins. Not doing it here cause these are just sketches.
 * @type {{entry: [*], devServer: {contentBase: (*), port: number, hot: boolean}, output: {path: string, filename: string}, module: {rules: [*]}, plugins: [*]}}
 */
module.exports = {
    entry:[
        "./node_modules/webpack/hot/dev-server",
        `./node_modules/webpack-dev-server/client?http://localhost:${PORT}/`,
        './src/app.js'
    ],
    devServer:{
        contentBase:path.join(__dirname,"public"),
        port:9000,
        hot:true
    },
    output:{
        path:__dirname + "/public/js",
        filename:"js/app.js"
    },
    module:{
        rules:[

            {
                test:/\.js$/,
                exclude:/(node_modules|bower_components)/,
                loader:'babel-loader'
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'raw-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins:[
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ]
};
