/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,ts,tsx,jsx,json}": ["oxfmt --no-error-on-unmatched-pattern", "oxlint --type-aware --fix"],
};
