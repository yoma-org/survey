# Deferred Items — Phase 03

## Pre-existing issues (out of scope for 03-01)

### i18n test references wrong filename
- **File:** `__tests__/lib/i18n.test.ts`
- **Issue:** Line 4 imports `../../messages/mm.json` but file is named `messages/my.json`
- **Status:** Pre-existing failure before plan 03-01 began
- **Impact:** 1 test suite fails with ERR_MODULE_NOT_FOUND
- **Fix:** Rename import to `../../messages/my.json` and update describe block label
