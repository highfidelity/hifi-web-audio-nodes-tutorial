module.exports = {
    ignorePatterns: ['.eslintrc.js', 'webpack.config.js', '/dist/**/*.*', '/vendor/*.*'],
    env: {
        browser: true,
        jquery: true,
        es2021: true
    },
    extends: "eslint:recommended",
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {
    }
};
