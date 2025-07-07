# Supabase Setup Guide for Myetician

## 🎯 Current Status
Your Supabase integration is **already implemented** in the code! You just need to complete the database setup.

## 📋 Setup Checklist

### 1. Database Setup (Required)
You need to run the database migrations to create the required tables:

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/jbisreetszynsmrevkmg/sql)
2. Copy and paste the contents of each migration file in order:
   - First: `supabase/migrations/20250705143659_bronze_cottage.sql`
   - Second: `supabase/migrations/20250705143710_delicate_star.sql`
3. Click "Run" for each migration

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jbisreetszynsmrevkmg

# Run migrations
supabase db push
```

### 2. Authentication Setup (Required)
Configure Google OAuth in your Supabase dashboard:

1. Go to [Authentication > Providers](https://supabase.com/dashboard/project/jbisreetszynsmrevkmg/auth/providers)
2. Enable **Google** provider
3. Add these URLs to your Google OAuth configuration:
   - **Authorized JavaScript origins**: `http://localhost:3000`, `https://your-domain.com`
   - **Authorized redirect URIs**: 
     - `https://jbisreetszynsmrevkmg.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback`

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add the redirect URIs mentioned above
4. Copy Client ID and Client Secret to Supabase

### 4. Test the Integration
Once setup is complete, test these features:
- ✅ User registration/login with Google
- ✅ Profile creation during onboarding
- ✅ Meal logging and deletion
- ✅ AI meal analysis
- ✅ Data persistence across sessions

## 🔧 What's Already Implemented

### Database Schema
- **users table**: Stores user profiles and preferences
- **meals table**: Stores logged meals with nutritional data
- **Row Level Security**: Users can only access their own data

### Authentication
- Google OAuth integration
- Automatic user profile creation
- Session management
- Protected routes

### Features
- Complete onboarding flow
- Meal logging (manual and AI-powered)
- Calorie and macro tracking
- Weekly summaries
- Settings management

## 🚨 Troubleshooting

### If you see "Supabase Not Configured" warning:
- Ensure `.env.local` file exists with correct variables
- Restart the development server: `npm run dev`

### If authentication fails:
- Check Google OAuth configuration
- Verify redirect URIs are correct
- Check browser console for errors

### If database operations fail:
- Ensure migrations have been run
- Check RLS policies are active
- Verify user is authenticated

## 🎉 You're Ready!
Once you complete steps 1-3 above, your Myetician app will be fully functional with Supabase!