export default {
  extends: ['@commitlint/config-conventional'],
  // Dependabot writes its own subjects ("ci: Bump actions/checkout from 5 to 7")
  // and they cannot be reworded, so they trip subject-case. Its commits are
  // identified by the sign-off trailer it adds to every one of them.
  ignores: [(message) => message.includes('Signed-off-by: dependabot[bot]')],
};
