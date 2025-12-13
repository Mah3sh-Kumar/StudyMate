# StudyMate Database SQL Files

This directory contains all SQL scripts needed to set up the StudyMate database in Supabase.

## 📁 File Structure

- **`00_complete_setup.sql`** - Complete setup script (run this for quick setup)
- **`01_schema.sql`** - Database schema (tables only)
- **`02_indexes.sql`** - Database indexes for performance
- **`03_rls.sql`** - Row Level Security policies

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)

Run `00_complete_setup.sql` in Supabase SQL Editor to set up everything at once.

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `00_complete_setup.sql`
5. Click **Run** (or press `Ctrl+Enter`)

### Option 2: Step-by-Step Setup

If you prefer to run scripts individually:

1. Run `01_schema.sql` - Creates all tables
2. Run `02_indexes.sql` - Creates indexes for better performance
3. Run `03_rls.sql` - Enables security and creates policies

## 📊 Database Schema

The database includes the following tables:

- **profiles** - User profiles linked to Supabase auth
- **study_groups** - Study groups for collaboration
- **group_members** - Members of study groups
- **study_sessions** - Individual study session tracking
- **flashcard_decks** - Collections of flashcards
- **flashcards** - Individual flashcard items
- **study_materials** - User-uploaded study materials
- **ai_generated_content** - AI-generated content storage
- **group_messages** - Messages within study groups

## 🔒 Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data
- Public content (groups, decks) is accessible to all authenticated users
- Group members can access group-related data

## ⚠️ Important Notes

1. **Run scripts in order** if using step-by-step setup
2. **Don't run scripts multiple times** - They use `IF NOT EXISTS` but may cause issues
3. **Backup your database** before running if you have existing data
4. **Test in a development environment** first

## 🔧 Troubleshooting

### "relation already exists" error
- Tables already exist. You can either:
  - Drop existing tables (⚠️ will delete data)
  - Skip table creation and only run indexes/RLS scripts

### "permission denied" error
- Make sure you're running scripts as a database admin
- Check that you have proper Supabase project permissions

### "auth.uid() is null" error
- This is normal when testing policies
- Policies will work correctly when users are authenticated in the app

## 📝 Next Steps

After running the SQL scripts:

1. ✅ Verify tables were created in Supabase Dashboard → Table Editor
2. ✅ Test authentication in your app
3. ✅ Try creating a profile, flashcard deck, or study session
4. ✅ Check that data persists between app sessions

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify your Supabase credentials in `lib/supabase.js`
3. Ensure your app is properly authenticated before database operations

---

**Your StudyMate database is ready! 🎉**

