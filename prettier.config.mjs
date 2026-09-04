// @ts-check

/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  overrides: [
    {
      // Angular templates need the dedicated parser, not the generic HTML one.
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
