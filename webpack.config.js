const { resolve } = require("path");
const { ProgressPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const AppDir  = resolve(__dirname, 'app');
const DistDir = resolve(__dirname, 'dist');

module.exports = {
    devServer: {
        contentBase: DistDir,
        compress: true,
        port: 1337
    },
    entry: resolve(AppDir, "index.js"),
    target: "web",
    mode: process.env.WEBPACK_DEV_SERVER ? "development" : "production",
    devtool: "source-map",
    output: {
        path: DistDir,
        filename: "static/app.js"
    },
    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                include: AppDir,
                loader: "babel-loader"
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [{
                        loader: 'style-loader',
                        options: {
                            injectType: 'styleTag',
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        }
                    }
                ],
                sideEffects: true,
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {
                  // outputPath: resolve(__dirname, 'dist', 'static'),
                  name: '[contenthash].[ext]'        
                }
            }
        ]
    },
    plugins: [
        new ProgressPlugin(),
        new HtmlWebpackPlugin({
            name: 'index',
            template: resolve(AppDir, 'public', 'index.html'),
            filename: 'index.html',
            chunks: ['main'],
            scriptLoading: 'defer',
            inject: 'head'
        })
    ]
};