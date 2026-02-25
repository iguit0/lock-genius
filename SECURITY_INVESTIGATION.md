# Investigation: minimatch ReDoS via Repeated Wildcards (CVE-2026-26996)

## Summary

`minimatch@3.1.2` is present in lock-genius as a **transitive devDependency only** (via Jest's `glob@7.2.3`). It is confirmed vulnerable to CVE-2026-26996 (ReDoS via repeated wildcards). However, the **exploitability is negligible** in this project because minimatch is never imported in application source code, never included in the production bundle, and never exposed to user-controlled input.

## Vulnerability Details

| Field | Value |
|-------|-------|
| **CVE** | CVE-2026-26996 |
| **GHSA** | GHSA-3ppc-4f35-3m26 |
| **Severity** | High (CVSS 7.5) |
| **Type** | CWE-1333: Inefficient Regular Expression Complexity (ReDoS) |
| **Affected** | minimatch ≤ 10.2.0 |
| **Fixed in** | 3.1.3, 4.2.4, 5.1.7, 6.2.1, 7.4.7, 8.0.5, 9.0.6, 10.2.1 |
| **Installed** | minimatch@3.1.2 (**VULNERABLE**) |

### Technical Mechanism

When minimatch compiles a glob pattern, each `*` becomes `[^/]*?` in the generated regex. For a pattern with N consecutive wildcards (e.g., `***************X***`):

```regex
/^(?!\.)[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?X[^/]*?[^/]*?[^/]*?$/
```

When the test string doesn't contain the literal character (`X`), the regex engine must try every possible way to distribute characters across all `[^/]*?` groups — exponential O(4^N) time complexity.

- N=15: ~2 seconds per call
- N=34: hangs indefinitely

## Symptoms

- Any call to `minimatch(string, pattern)` where `pattern` contains many consecutive `*` wildcards followed by a non-matching literal causes extreme CPU usage
- Can cause full Node.js process hang (event loop blocked)

## Investigation Log

### Phase 1 — Dependency Analysis
**Hypothesis:** minimatch might be a direct dependency or used in application code
**Findings:**
- minimatch is NOT in `package.json` (neither dependencies nor devDependencies)
- It is a **transitive dependency** brought in exclusively through the Jest testing ecosystem
- Only one version exists in the lockfile: `minimatch@3.1.2`

**Evidence:** `package.json` (no minimatch entry), `pnpm-lock.yaml:2819` (single resolution)

**Conclusion:** Transitive devDependency only ✅

### Phase 2 — Dependency Chain Tracing
**Hypothesis:** Multiple packages might bring in minimatch through different paths

**Findings — Complete dependency chain:**
```
jest (devDep)
  ├── @jest/reporters@29.7.0 → glob@7.2.3 → minimatch@3.1.2
  ├── jest-config@29.7.0     → glob@7.2.3 → minimatch@3.1.2
  └── jest-runtime@29.7.0    → glob@7.2.3 → minimatch@3.1.2

babel-plugin-istanbul@6.1.1 (jest coverage)
  └── test-exclude@6.0.0
        ├── glob@7.2.3 → minimatch@3.1.2
        └── minimatch@3.1.2 (direct dep)
```

**All paths originate from devDependencies (test-time only).**

**Other glob libraries in the project (NOT minimatch):**
- `micromatch@4.0.8` — used by jest-config (uses picomatch, not minimatch)
- `fast-glob@3.3.3` — used by next-sitemap (build-time only)

**Conclusion:** All minimatch usage is confined to Jest test execution ✅

### Phase 3 — Source Code Analysis
**Hypothesis:** Application code might import or use minimatch/glob directly

**Findings:**
- **Zero** imports/requires of `minimatch`, `glob`, `fast-glob`, or `micromatch` in any file under `src/`
- No file-system glob matching exists in application code
- All API routes handle password data (strings, booleans, integers) — none accept glob patterns

**API endpoints analyzed:**
| Endpoint | User Input | Glob-related? |
|----------|-----------|---------------|
| `POST /api/v1/passwords/generate` | length, character flags | ❌ No |
| `POST /api/v1/passwords` | password string, metadata | ❌ No |
| `GET /api/v1/passwords` | Session cookie only | ❌ No |
| `DELETE /api/v1/passwords/[id]` | URL path param (ID) | ❌ No |
| `[...nextauth]` routes | OAuth tokens | ❌ No |

**Evidence:** Content search for `minimatch|glob` in `src/` returned 0 results

**Conclusion:** No application code uses minimatch — CONFIRMED ✅

### Phase 4 — Production Bundle Analysis
**Hypothesis:** minimatch might end up in the Next.js production bundle

**Findings:**
- minimatch comes from `devDependencies` (Jest)
- Next.js only bundles `dependencies` in the production output
- Jest, glob, and minimatch never run in production — only during `pnpm test`
- The only patterns minimatch processes are hardcoded developer strings in `jest.config.js` (e.g., `collectCoverageFrom: ['./src/**']`)

**Conclusion:** Not in production bundle — CONFIRMED ✅

## Root Cause

The vulnerable code is in **minimatch's glob-to-regex compiler** which fails to collapse consecutive `*` wildcards. Each `*` produces a separate `[^/]*?` regex group. When the match fails, V8's regex engine backtracks exponentially across all possible character distributions.

**This is an upstream library bug, not a bug in lock-genius.**

## Risk Assessment

| Factor | Assessment |
|--------|------------|
| Is minimatch in the production bundle? | ❌ No — devDependency only |
| Does it run at runtime? | ❌ No — only during `jest` test execution |
| Can an attacker supply a malicious pattern? | ❌ No — all patterns are hardcoded in config |
| Can an attacker supply a malicious filename? | ❌ No — glob runs against local filesystem at test-time |
| Network-reachable attack vector? | ❌ None exists |
| CI/CD risk? | ⚠️ Theoretical — compromised config could cause test hangs (requires repo write access) |

### Verdict: 🟢 NOT EXPLOITABLE in this project

## Recommendations

### Option A: pnpm Override to 3.1.3 (✅ Recommended — safe, minimal change)
Add to the existing `pnpm.overrides` in `package.json`:
```jsonc
"pnpm": {
  "overrides": {
    // ... existing overrides ...
    "minimatch": "~3.1.3"
  }
}
```
This bumps to the patched version in the same 3.x line (`~` ensures it stays within 3.1.x), which is fully compatible with `glob@7.2.3`. No breaking changes.

⚠️ **Do NOT use `>=3.1.3`** — pnpm will resolve to the latest minimatch (v10+), which has a completely different API and breaks `test-exclude@6.0.0` / Jest coverage collection.

### Option B: Upgrade glob consumers (Proper long-term fix)
The root cause is `glob@7.2.3` (deprecated). Upgrading to **Jest 30+** (which uses `glob@10+` and `minimatch@9+`) would eliminate the transitive dependency. Requires compatibility testing with `next/jest`.

### Option C: Accept the risk
Document the finding and mark as accepted risk:
- The vulnerability is not exploitable in production
- Only affects local development/CI test execution
- Patterns are developer-controlled, not user-controlled
- Monitor for Jest 30 compatibility with Next.js 15

## Preventive Measures

1. **Existing practice**: The project already uses `pnpm.overrides` for security patches — continue this pattern
2. **Consider**: Adding `pnpm audit` to CI pipeline to catch future transitive dependency vulnerabilities early
3. **Track**: Jest 30 release for Next.js 15 compatibility (will resolve this transitively)
4. **Policy**: Never pass user-controlled input to glob/minimatch pattern arguments in any future code
