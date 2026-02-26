module.exports = [
    {
        languageOptions: {
            sourceType: "commonjs",
            ecmaVersion: 2022,
            globals: {
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error"
        },
    },
];
