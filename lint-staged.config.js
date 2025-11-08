/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,ts,tsx,jsx,md,json}": "prettier --write",
};
