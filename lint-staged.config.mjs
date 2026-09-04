// @ts-check
import { defineConfig } from 'lint-staged/config';

export default defineConfig({
  // ESLint runs first: it fixes semantics and reorders template attributes,
  // then Prettier lays the result out.
  '*.{ts,html}': ['eslint --fix', 'prettier --write'],
  '*.{js,mjs,cjs,json,css,scss,md,yml,yaml}': ['prettier --write'],
});
