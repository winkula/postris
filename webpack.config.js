const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, '/src/postris/index.ts'),
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.png$/,
                use: ['file-loader'],
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'public/index.html'
    })]
}
