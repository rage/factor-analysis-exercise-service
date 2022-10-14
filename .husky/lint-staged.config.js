module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --cache --fix"],
  "src/**/*.{js,jsx,ts,tsx}": () =>
    "npx tsc --noEmit",
  "*.{md,json,scss,css}": "prettier --write",
  "system-tests/src/**/*.{js,jsx,ts,tsx}": () => [
    `./bin/check-no-test-only-in-system-tests`,
    "npx tsc -p system-tests --noEmit",
  ],
}
