module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['@babel/preset-env', {targets: {node: 'current'}}],
            '@babel/preset-typescript'
        ],
        plugins: [
            ["@babel/plugin-proposal-decorators", {"legacy": true}],
            ["@babel/plugin-proposal-class-properties", {"loose": true}],
            "babel-plugin-parameter-decorator",
            "babel-plugin-reactgenie"
        ],
        exclude: [
            "node_modules"
        ]
    };
};