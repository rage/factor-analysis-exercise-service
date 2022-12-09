module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --cache --fix --cache-location './node_modules/.cache/.eslintcache/'"],
  "src/**/*.{js,jsx,ts,tsx}": () =>
    "npx tsc --noEmit",
  "*.{md,json,scss,css}": "prettier --write",
  "system-tests/src/**/*.{js,jsx,ts,tsx}": () => [
    "npx tsc -p system-tests --noEmit",
  ],
}
