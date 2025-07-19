# GitHub Workflows

This directory contains automated workflows for the tRPC Shield project, following industry best practices.

## Workflows

### 🧪 CI (`ci.yml`)
Runs on every push to `master` and `upgrade/trpc-v11` branches, and on all pull requests.

- **Matrix testing**: Tests on Node.js 18.x, 20.x, and 22.x
- **Build verification**: Ensures package builds correctly
- **Type checking**: Validates TypeScript types with `tsc --noEmit`
- **Linting**: Runs ESLint checks (continues on error for development)
- **Testing**: Runs full test suite with coverage
- **Package integrity**: Validates npm package structure
- **Artifacts**: Uploads build artifacts for debugging

### 🚀 Release (`release.yml`)
Handles automated releases to npm and GitHub from master branch only.

- **Manual triggers**: Support workflow_dispatch with version type selection
- **Auto-detection**: Determines version bump from commit messages
- **Full pipeline**: Build, test, lint, and type-check before release
- **Git integration**: Auto-commits version bumps and creates tags
- **npm publishing**: Publishes to npm registry with proper access
- **GitHub releases**: Creates releases with changelog links
- **Artifacts**: Uploads published package for verification

### 🔄 Semantic Release (`semantic-release.yml`)
Alternative release system using semantic-release for both branches.

- **Master branch**: Stable releases using semantic-release
- **upgrade/trpc-v11 branch**: Beta releases with prerelease tags
- **Conventional commits**: Automated versioning and changelog
- **Zero-config**: Uses .releaserc.json configuration

### 🛡️ Security (`security.yml`)
Comprehensive security monitoring and dependency management.

- **Scheduled audits**: Weekly security scans every Monday at 2 AM UTC
- **PR triggers**: Runs on package.json changes
- **Security reports**: Generates detailed audit reports with artifacts
- **Dependency review**: Reviews dependency changes in PRs with comments
- **Vulnerability tracking**: Uploads results for historical analysis

### ✅ PR Validation (`pr-validation.yml`)
Comprehensive validation for pull requests.

- **Build validation**: Ensures package builds and type-checks correctly
- **Commit message validation**: Enforces conventional commit format
- **PR title validation**: Validates semantic PR titles
- **Package integrity**: Verifies build artifacts and npm structure
- **Artifact verification**: Tests that essential files are present

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