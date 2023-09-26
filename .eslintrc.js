module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: "airbnb-base",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        ".eslintrc.{js,cjs}",
      ],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "linebreak-style": 0,
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "import/extensions": ["error", "never", { js: "always" }],
  },
}
