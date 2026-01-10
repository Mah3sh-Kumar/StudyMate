# StudyMate Database SQL Files

This directory contains the SQL script needed to set up the StudyMate database in Supabase.

## 📁 File Structure

- **`00_complete_setup.sql`** - Complete, production-ready setup script (USE THIS!)

## 🚀 Quick Start

### Complete Setup (Recommended)

Run `00_complete_setup.sql` in Supabase SQL Editor to set up everything at once.

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `00_complete_setup.sql`
5. Click **Run** (or press `Ctrl+Enter`)
6. Wait ~30 seconds for completion
7. View the summary output to verify everything was created

### ✨ What Gets Created

The script automatically creates:

**Tables (9)**
- `profiles` - User profiles linked to Supabase auth
- `study_groups` - Study groups for collaboration
- `group_members` - Members of study groups
- `study_sessions` - Individual study session tracking
- `flashcard_decks` - Collections of flashcards
- `flashcards` - Individual flashcard items
- `study_materials` - User-uploaded study materials
- `ai_generated_content` - AI-generated content storage
- `group_messages` - Messages within study groups

**Performance Features**
- 28 Indexes for fast queries
- Optimized for common search patterns

**Security Features**
- Row Level Security (RLS) enabled on all tables
- 38 Security policies for data protection
- Users can only access their own data
- Public content properly shared
- Group members can access group data

**Advanced Features**
- ✅ Auto-create user profiles on signup
- ✅ Auto-update timestamps on record changes
- ✅ Username validation (3-30 chars, alphanumeric)
- ✅ Data integrity constraints
- ✅ Realtime subscriptions for chat/groups
- ✅ 6 Triggers for automation
- ✅ 3 Helper functions

### 🔄 Re-running the Script

The script is **fully idempotent** - you can safely run it multiple times:
- First run: Creates everything
- Subsequent runs: Updates functions, refreshes policies
- No errors on existing objects

### 📊 Verify Setup

After running the script, you'll see a summary like:

```
📊 DATABASE SETUP SUMMARY
─────────────────────────────────
📁 Tables Created: 9
🔍 Indexes Created: 28
🔒 Policies Created: 38
⚡ Triggers Created: 6
🛠️ Functions Created: 3
✅ Constraints Created: 5
─────────────────────────────────
🎉 Status: SETUP COMPLETE!
```

You can also run anytime:
```sql
SELECT * FROM public.show_database_summary();
```

## 🔒 Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data
- Public content (groups, decks) is accessible to all authenticated users
- Group members can access group-related data
- Social features allow viewing profiles of group members

## ⚠️ Important Notes

1. **Run once per database** - The script sets up everything you need
2. **Safe to re-run** - Won't cause errors if objects already exist
3. **Backup first** - If you have existing data, backup before running
4. **Check the summary** - Verify all objects were created successfully

## 🔧 Troubleshooting

### "permission denied" error
- Make sure you're running as a database admin
- Check your Supabase project permissions

### "auth.uid() is null" error
- This is normal when testing policies
- Policies work correctly when users are authenticated in the app

### Objects not created
- Check the summary output at the end
- Look for any error messages in the SQL editor
- Ensure you're in the correct Supabase project

## 📝 Next Steps

After running the SQL script:

1. ✅ Verify tables in Supabase Dashboard → Table Editor
2. ✅ Test authentication in your app
3. ✅ Try creating a profile, flashcard deck, or study session
4. ✅ Check that data persists between app sessions
5. ✅ Test group features and real-time chat

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify your Supabase credentials in `lib/supabase.js`
3. Ensure users are authenticated before database operations
4. Run `SELECT * FROM public.show_database_summary();` to see what exists

---

**Your StudyMate database is ready! 🎉**

