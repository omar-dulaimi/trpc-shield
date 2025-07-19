# GitHub Workflows

This directory contains automated workflows for the tRPC Shield project.

## Workflows

### 🧪 Test (`test.yml`)
Runs on every push to `master` and `upgrade/trpc-v11` branches, and on all pull requests.

- **Matrix testing**: Tests on Node.js 18.x and 20.x
- **Linting**: Runs ESLint and Prettier checks
- **Type checking**: Validates TypeScript types
- **Testing**: Runs full test suite with coverage
- **Build verification**: Ensures package builds correctly

### 🚀 Release (`release.yml`)
Handles automated releases to npm and GitHub.

- **Master branch**: Creates stable releases (e.g., `1.0.0`)
- **upgrade/trpc-v11 branch**: Creates beta releases (e.g., `1.0.0-beta.1`)
- **Semantic versioning**: Uses conventional commits for version bumping
- **Automated changelogs**: Generates release notes
- **npm publishing**: Publishes to npm registry
- **GitHub releases**: Creates GitHub releases with assets

### 🛡️ Security (`security.yml`)
Runs weekly security audits and dependency checks.

- **Security audit**: Runs `npm audit` for vulnerabilities
- **Dependency review**: Reviews dependency changes in PRs
- **Outdated packages**: Checks for package updates

### ✅ PR Validation (`pr-validation.yml`)
Validates pull requests before merge.

- **Commit message validation**: Ensures conventional commit format
- **PR title validation**: Validates semantic PR titles
- **Bundle size check**: Monitors package size changes

## Setup Requirements

### GitHub Secrets
The following secrets need to be configured in the repository:

1. **`NPM_TOKEN`**: npm authentication token for publishing
   - Create at: https://www.npmjs.com/settings/tokens
   - Choose "Automation" token type

2. **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions
   - No manual setup required

3. **`CODECOV_TOKEN`** (optional): For code coverage reporting
   - Create at: https://codecov.io/

### Branch Protection
Consider enabling branch protection rules for `master`:

1. Require status checks to pass
2. Require up-to-date branches
3. Require review from code owners
4. Restrict pushes to admins only

## Release Process

### Stable Release (master)
1. Create PR to `master` branch
2. Use conventional commit messages (`feat:`, `fix:`, etc.)
3. Merge PR to trigger automated release

### Beta Release (upgrade/trpc-v11)
1. Push commits to `upgrade/trpc-v11` branch
2. Automatic beta release will be created
3. Install with: `npm install trpc-shield@beta`

## Conventional Commits

This project uses conventional commits for automatic versioning:

- `feat:` → Minor version bump (new feature)
- `fix:` → Patch version bump (bug fix)
- `perf:` → Patch version bump (performance)
- `refactor:` → Patch version bump (refactoring)
- `BREAKING CHANGE:` → Major version bump

Examples:
```
feat: add context extension support
fix: resolve middleware compatibility issue
perf: optimize rule evaluation performance
feat!: update to tRPC v11 (breaking change)
```