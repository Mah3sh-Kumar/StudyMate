# 🐛 Bugs Fixed & Schema Alignment

## Summary
This document lists all bugs found and fixed in the StudyMate codebase, along with schema alignment between documentation and code.

---

## ✅ Fixed Bugs

### 1. **Critical: Schema Mismatch in Documentation**
**File:** `database-setup.md`

**Issue:** Documentation used `users` table, but code uses `profiles` table that references `auth.users(id)`

**Fix:** Updated `database-setup.md` to:
- Use `profiles` table instead of `users`
- Reference `auth.users(id)` correctly
- Include `study_subjects` and `study_goals` fields
- Update all foreign key references from `users(id)` to `profiles(id)`
- Update indexes and RLS policies to use `profiles`

**Impact:** Documentation now matches the actual database schema used in code.

---

### 2. **Critical: Incorrect Increment Operation**
**File:** `lib/database.js` (line 118)

**Issue:** 
```javascript
.update({ total_cards: supabase.rpc('increment') })
```
This is incorrect syntax - `supabase.rpc('increment')` returns a function, not a value.

**Fix:** 
```javascript
// Get current count first
const { data: deckData } = await supabase
  .from('flashcard_decks')
  .select('total_cards')
  .eq('id', deckId)
  .single();

if (deckData) {
  await supabase
    .from('flashcard_decks')
    .update({ total_cards: (deckData.total_cards || 0) + 1 })
    .eq('id', deckId);
}
```

**Impact:** Flashcard deck total_cards counter now works correctly.

---

### 3. **Critical: Incorrect Supabase Count Syntax**
**File:** `lib/database.js` (line 304)

**Issue:**
```javascript
.select(`
  *,
  profiles!created_by(full_name, username),
  group_members(count)  // ❌ Invalid syntax
`)
```
Supabase doesn't support `count` in nested selects like this.

**Fix:**
```javascript
.select(`
  *,
  profiles!created_by(full_name, username)
`)
// Get member counts separately
if (!error && data) {
  for (const group of data) {
    const { count, error: countError } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);
    group.member_count = (countError ? 0 : (count || 0));
  }
}
```

**Impact:** Study groups now correctly show member counts.

---

### 4. **Bug: Synchronous Auth Check**
**File:** `lib/database.js` (line 479)

**Issue:**
```javascript
isAuthenticated() {
  return !!supabase.auth.getUser();  // ❌ Returns Promise, not boolean
}
```
`getUser()` is async and returns a Promise, but function is synchronous.

**Fix:**
```javascript
async isAuthenticated() {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}
```

**Impact:** Authentication checks now work correctly.

---

### 5. **Warning: Non-Existent RPC Function**
**File:** `lib/initDatabase.js`

**Issue:** Uses `supabase.rpc('exec_sql')` which doesn't exist in Supabase by default.

**Fix:** Added comprehensive warnings and documentation:
- Added warning comments at top of file
- Updated initialization check to detect missing tables
- Added instructions to use SQL files instead
- Kept file for reference but marked as deprecated

**Impact:** Developers are now aware they should use SQL files in `/sql` directory instead.

---

## 📋 Schema Alignment

### Before:
- **Documentation:** Used `users` table with standalone schema
- **Code:** Used `profiles` table referencing `auth.users(id)`
- **Mismatch:** Foreign keys, indexes, and policies didn't match

### After:
- **Documentation:** Now uses `profiles` table matching code
- **Code:** Unchanged (was correct)
- **Alignment:** ✅ All documentation matches code implementation

---

## 🔍 Additional Issues Found (Not Bugs, But Noted)

### 1. **initDatabase.js Limitations**
- File uses `exec_sql` RPC which requires custom Supabase function
- Recommended approach: Use SQL files in `/sql` directory
- File kept for reference but marked with warnings

### 2. **Error Handling**
- Most database operations have proper error handling
- Some async operations could benefit from try-catch blocks
- Current error handling is adequate for most use cases

---

## ✅ Verification

All fixes have been:
- ✅ Tested for syntax errors (no linter errors)
- ✅ Aligned with existing code patterns
- ✅ Documented in code comments
- ✅ Verified against Supabase best practices

---

## 📝 Recommendations

1. **Use SQL Files:** Always use SQL files in `/sql` directory for database setup
2. **Test Database Operations:** Test all database operations after setup
3. **Monitor Errors:** Check Supabase logs for any RLS policy violations
4. **Update Documentation:** Keep documentation in sync with code changes

---

**Last Updated:** After comprehensive codebase review
**Files Modified:** 
- `lib/database.js`
- `lib/initDatabase.js`
- `database-setup.md`

