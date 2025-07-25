## [1.3.0](https://github.com/omar-dulaimi/trpc-shield/compare/v1.2.0...v1.3.0) (2025-07-25)

### 🚀 Features

* update main library dependencies to latest versions ([8d174ae](https://github.com/omar-dulaimi/trpc-shield/commit/8d174ae9f884e57ff3c7b232c90c71479a75b4a8))
* upgrade to tRPC v11 and update dependencies ([bcf4b25](https://github.com/omar-dulaimi/trpc-shield/commit/bcf4b25c81ed67391068cc8215d8266979edd629))

### 🐛 Bug Fixes

* regenerate package-lock.json files for CI consistency ([5f66c63](https://github.com/omar-dulaimi/trpc-shield/commit/5f66c63633bb4caca90b07d83e8c15817f48c5fb))

### ♻️ Code Refactoring

* remove generated shield file from example ([2c71934](https://github.com/omar-dulaimi/trpc-shield/commit/2c719347a4557e49a8b20db80c28c66284e3d8b9))
* remove prisma-trpc-shield-generator from example ([624b27c](https://github.com/omar-dulaimi/trpc-shield/commit/624b27c3fe4e3873d389c9651c6fe3ed8f29e8b9))
* update generated tRPC schemas and routers for Prisma v6 ([8d841d2](https://github.com/omar-dulaimi/trpc-shield/commit/8d841d257ed05d764df98f8ec6a8a2e0163ebb86))

## [1.2.0](https://github.com/omar-dulaimi/trpc-shield/compare/v1.1.0...v1.2.0) (2025-07-23)


### 🚀 Features

* provide zipped distribution assets in GitHub releases ([a261891](https://github.com/omar-dulaimi/trpc-shield/commit/a261891d4f1c18d2ae0b7a996ae68d3239b075db))

## [1.1.0](https://github.com/omar-dulaimi/trpc-shield/compare/v1.0.0...v1.1.0) (2025-07-23)


### 🚀 Features

* re-enable git plugin now that branch protection is disabled ([d94f7b6](https://github.com/omar-dulaimi/trpc-shield/commit/d94f7b6ed93fa89c39f38380e013383e94b09f76))
* switch to semantic-release bot approach for releases ([ce61b2e](https://github.com/omar-dulaimi/trpc-shield/commit/ce61b2e2ba1073d26dcdb90d5769ebb1b6997f01))


### 🐛 Bug Fixes

* disable git plugin again due to protected branch restrictions ([bdfc0f1](https://github.com/omar-dulaimi/trpc-shield/commit/bdfc0f1fbbf1d711fac66e748a70eb3efb8dad41))

## 1.0.0-beta.1 (2025-07-19)


### 🚀 Features

* add comprehensive test suite with Vitest ([11d2cf5](https://github.com/omar-dulaimi/trpc-shield/commit/11d2cf58a13686bd2597e87b941fcd3284094f64))
* add tRPC context extension support ([fe2c5fd](https://github.com/omar-dulaimi/trpc-shield/commit/fe2c5fd6f42a31c043beee5ca4a2ab3a0cb986eb))
* configure ESLint 9 and code quality tools ([22d9e8e](https://github.com/omar-dulaimi/trpc-shield/commit/22d9e8e5a7bfbed42fff5a16b621a40517bf5569))
* configure semantic-release for automated versioning ([5b87e32](https://github.com/omar-dulaimi/trpc-shield/commit/5b87e3230f54d18a85eb3748584fe04b209ae99b))
* update shield middleware for tRPC v11 compatibility ([0ac978d](https://github.com/omar-dulaimi/trpc-shield/commit/0ac978d500604de83500d2ea22cd888a5ac2e7e5))
* upgrade to tRPC v11.4.3 and update dependencies ([2b57a23](https://github.com/omar-dulaimi/trpc-shield/commit/2b57a231671a091e042b3b57df7fb5fb98baa1db))


### 🐛 Bug Fixes

* alllow returning Error from rule ([7a208ed](https://github.com/omar-dulaimi/trpc-shield/commit/7a208ed2a3cd5458777c5076e2f25597270b7e4c))
* always use fallbackRule if rule not found ([e088936](https://github.com/omar-dulaimi/trpc-shield/commit/e088936b548925c61d3a325bf6a8163fc09a8664))
* **generator:** Respect namespace, prevent name collision ([8540088](https://github.com/omar-dulaimi/trpc-shield/commit/854008833b6cdcef690f1368de3cd674308a698d))
* resolve TypeScript type compatibility issues in context extension ([a608add](https://github.com/omar-dulaimi/trpc-shield/commit/a608add0aeba0505209682913d5cf3940af416c7))
* update package-lock.json to sync with new dependencies ([b1517fe](https://github.com/omar-dulaimi/trpc-shield/commit/b1517feb501bae5e14d850d20584d13087ffc357))


### ♻️ Code Refactoring

* improve GitHub workflows following industry best practices ([ed0bc07](https://github.com/omar-dulaimi/trpc-shield/commit/ed0bc07cdcd024089907e76bd7c8273e089be54a))
* streamline to essential workflows only ([cd2e09f](https://github.com/omar-dulaimi/trpc-shield/commit/cd2e09ff0f7c3a3fcb417fa6c73a55ec26caff98))


### 📚 Documentation

* comprehensive README overhaul with modern structure ([a208ab4](https://github.com/omar-dulaimi/trpc-shield/commit/a208ab4deadbfca364e26a2893754c1034e89f86))
* update documentation for tRPC v11 and development setup ([003b7e7](https://github.com/omar-dulaimi/trpc-shield/commit/003b7e7d738945cf628ab870a296c683e9d5ad92))

## 1.0.0-beta.1 (2025-07-19)


### 🚀 Features

* add comprehensive test suite with Vitest ([11d2cf5](https://github.com/omar-dulaimi/trpc-shield/commit/11d2cf58a13686bd2597e87b941fcd3284094f64))
* add tRPC context extension support ([fe2c5fd](https://github.com/omar-dulaimi/trpc-shield/commit/fe2c5fd6f42a31c043beee5ca4a2ab3a0cb986eb))
* configure ESLint 9 and code quality tools ([22d9e8e](https://github.com/omar-dulaimi/trpc-shield/commit/22d9e8e5a7bfbed42fff5a16b621a40517bf5569))
* configure semantic-release for automated versioning ([5b87e32](https://github.com/omar-dulaimi/trpc-shield/commit/5b87e3230f54d18a85eb3748584fe04b209ae99b))
* update shield middleware for tRPC v11 compatibility ([0ac978d](https://github.com/omar-dulaimi/trpc-shield/commit/0ac978d500604de83500d2ea22cd888a5ac2e7e5))
* upgrade to tRPC v11.4.3 and update dependencies ([2b57a23](https://github.com/omar-dulaimi/trpc-shield/commit/2b57a231671a091e042b3b57df7fb5fb98baa1db))


### 🐛 Bug Fixes

* alllow returning Error from rule ([7a208ed](https://github.com/omar-dulaimi/trpc-shield/commit/7a208ed2a3cd5458777c5076e2f25597270b7e4c))
* always use fallbackRule if rule not found ([e088936](https://github.com/omar-dulaimi/trpc-shield/commit/e088936b548925c61d3a325bf6a8163fc09a8664))
* **generator:** Respect namespace, prevent name collision ([8540088](https://github.com/omar-dulaimi/trpc-shield/commit/854008833b6cdcef690f1368de3cd674308a698d))
* resolve TypeScript type compatibility issues in context extension ([a608add](https://github.com/omar-dulaimi/trpc-shield/commit/a608add0aeba0505209682913d5cf3940af416c7))
* update package-lock.json to sync with new dependencies ([b1517fe](https://github.com/omar-dulaimi/trpc-shield/commit/b1517feb501bae5e14d850d20584d13087ffc357))


### ♻️ Code Refactoring

* improve GitHub workflows following industry best practices ([ed0bc07](https://github.com/omar-dulaimi/trpc-shield/commit/ed0bc07cdcd024089907e76bd7c8273e089be54a))
* streamline to essential workflows only ([cd2e09f](https://github.com/omar-dulaimi/trpc-shield/commit/cd2e09ff0f7c3a3fcb417fa6c73a55ec26caff98))


### 📚 Documentation

* comprehensive README overhaul with modern structure ([a208ab4](https://github.com/omar-dulaimi/trpc-shield/commit/a208ab4deadbfca364e26a2893754c1034e89f86))
* update documentation for tRPC v11 and development setup ([003b7e7](https://github.com/omar-dulaimi/trpc-shield/commit/003b7e7d738945cf628ab870a296c683e9d5ad92))

## 1.0.0-beta.1 (2025-07-19)


### 🚀 Features

* add comprehensive test suite with Vitest ([11d2cf5](https://github.com/omar-dulaimi/trpc-shield/commit/11d2cf58a13686bd2597e87b941fcd3284094f64))
* add tRPC context extension support ([fe2c5fd](https://github.com/omar-dulaimi/trpc-shield/commit/fe2c5fd6f42a31c043beee5ca4a2ab3a0cb986eb))
* configure ESLint 9 and code quality tools ([22d9e8e](https://github.com/omar-dulaimi/trpc-shield/commit/22d9e8e5a7bfbed42fff5a16b621a40517bf5569))
* configure semantic-release for automated versioning ([5b87e32](https://github.com/omar-dulaimi/trpc-shield/commit/5b87e3230f54d18a85eb3748584fe04b209ae99b))
* update shield middleware for tRPC v11 compatibility ([0ac978d](https://github.com/omar-dulaimi/trpc-shield/commit/0ac978d500604de83500d2ea22cd888a5ac2e7e5))
* upgrade to tRPC v11.4.3 and update dependencies ([2b57a23](https://github.com/omar-dulaimi/trpc-shield/commit/2b57a231671a091e042b3b57df7fb5fb98baa1db))


### 🐛 Bug Fixes

* alllow returning Error from rule ([7a208ed](https://github.com/omar-dulaimi/trpc-shield/commit/7a208ed2a3cd5458777c5076e2f25597270b7e4c))
* always use fallbackRule if rule not found ([e088936](https://github.com/omar-dulaimi/trpc-shield/commit/e088936b548925c61d3a325bf6a8163fc09a8664))
* **generator:** Respect namespace, prevent name collision ([8540088](https://github.com/omar-dulaimi/trpc-shield/commit/854008833b6cdcef690f1368de3cd674308a698d))
* resolve TypeScript type compatibility issues in context extension ([a608add](https://github.com/omar-dulaimi/trpc-shield/commit/a608add0aeba0505209682913d5cf3940af416c7))
* update package-lock.json to sync with new dependencies ([b1517fe](https://github.com/omar-dulaimi/trpc-shield/commit/b1517feb501bae5e14d850d20584d13087ffc357))


### ♻️ Code Refactoring

* improve GitHub workflows following industry best practices ([ed0bc07](https://github.com/omar-dulaimi/trpc-shield/commit/ed0bc07cdcd024089907e76bd7c8273e089be54a))
* streamline to essential workflows only ([cd2e09f](https://github.com/omar-dulaimi/trpc-shield/commit/cd2e09ff0f7c3a3fcb417fa6c73a55ec26caff98))


### 📚 Documentation

* update documentation for tRPC v11 and development setup ([003b7e7](https://github.com/omar-dulaimi/trpc-shield/commit/003b7e7d738945cf628ab870a296c683e9d5ad92))

## 1.0.0-beta.1 (2025-07-19)


### 🚀 Features

* add comprehensive test suite with Vitest ([11d2cf5](https://github.com/omar-dulaimi/trpc-shield/commit/11d2cf58a13686bd2597e87b941fcd3284094f64))
* add tRPC context extension support ([fe2c5fd](https://github.com/omar-dulaimi/trpc-shield/commit/fe2c5fd6f42a31c043beee5ca4a2ab3a0cb986eb))
* configure ESLint 9 and code quality tools ([22d9e8e](https://github.com/omar-dulaimi/trpc-shield/commit/22d9e8e5a7bfbed42fff5a16b621a40517bf5569))
* configure semantic-release for automated versioning ([5b87e32](https://github.com/omar-dulaimi/trpc-shield/commit/5b87e3230f54d18a85eb3748584fe04b209ae99b))
* update shield middleware for tRPC v11 compatibility ([0ac978d](https://github.com/omar-dulaimi/trpc-shield/commit/0ac978d500604de83500d2ea22cd888a5ac2e7e5))
* upgrade to tRPC v11.4.3 and update dependencies ([2b57a23](https://github.com/omar-dulaimi/trpc-shield/commit/2b57a231671a091e042b3b57df7fb5fb98baa1db))


### 🐛 Bug Fixes

* alllow returning Error from rule ([7a208ed](https://github.com/omar-dulaimi/trpc-shield/commit/7a208ed2a3cd5458777c5076e2f25597270b7e4c))
* always use fallbackRule if rule not found ([e088936](https://github.com/omar-dulaimi/trpc-shield/commit/e088936b548925c61d3a325bf6a8163fc09a8664))
* **generator:** Respect namespace, prevent name collision ([8540088](https://github.com/omar-dulaimi/trpc-shield/commit/854008833b6cdcef690f1368de3cd674308a698d))
* resolve TypeScript type compatibility issues in context extension ([a608add](https://github.com/omar-dulaimi/trpc-shield/commit/a608add0aeba0505209682913d5cf3940af416c7))
* update package-lock.json to sync with new dependencies ([b1517fe](https://github.com/omar-dulaimi/trpc-shield/commit/b1517feb501bae5e14d850d20584d13087ffc357))


### ♻️ Code Refactoring

* improve GitHub workflows following industry best practices ([ed0bc07](https://github.com/omar-dulaimi/trpc-shield/commit/ed0bc07cdcd024089907e76bd7c8273e089be54a))
* streamline to essential workflows only ([cd2e09f](https://github.com/omar-dulaimi/trpc-shield/commit/cd2e09ff0f7c3a3fcb417fa6c73a55ec26caff98))


### 📚 Documentation

* update documentation for tRPC v11 and development setup ([003b7e7](https://github.com/omar-dulaimi/trpc-shield/commit/003b7e7d738945cf628ab870a296c683e9d5ad92))
