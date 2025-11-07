# Supabase Setup & Troubleshooting

## Initial Setup

### 1. Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project or select your existing project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Restart your dev server after updating `.env.local`

## Common Issues

### "Database error saving new user" Error

This error occurs when Supabase can't create the user in the database. Here are the most common causes:

#### 1. **Authentication Table Not Set Up**

**Solution:** Enable Email Authentication in Supabase

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. Configure email settings (you can use the default for development)

#### 2. **RLS Policies Blocking User Creation**

**Solution:** Check Row Level Security (RLS) policies

The `auth.users` table is managed by Supabase and should work automatically, but if you have custom tables:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Make sure there are no overly restrictive policies
3. For development, you can temporarily disable RLS on custom tables:

```sql
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### 3. **Email Confirmation Required**

By default, Supabase requires email confirmation. For development, you can disable this:

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Scroll to **Email Auth**
3. Disable **Confirm email** (for development only)
4. **Important:** Re-enable this for production!

#### 4. **Missing User Metadata Table**

If you have a custom profile or user metadata table, make sure it's set up correctly.

**Check if you have a profiles table:**

```sql
-- Check if table exists
SELECT * FROM profiles LIMIT 1;
```

**If you need a profiles table, create it:**

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 5. **Database Triggers Failing**

If you have database triggers that run on user creation, they might be failing.

**Solution:** Check your database triggers

1. Go to **Database** → **Functions** in Supabase
2. Look for any functions that run on user creation
3. Check the logs in **Database** → **Logs** for errors

### Other Common Errors

#### "Invalid login credentials"

- User doesn't exist or wrong password
- Check if email confirmation is required and user hasn't confirmed

#### "Email not confirmed"

- User needs to click confirmation link in email
- For development, disable email confirmation (see above)

#### "Email rate limit exceeded"

- Too many signup/login attempts
- Wait 1-2 minutes before trying again
- Check Supabase rate limit settings in **Authentication** → **Settings**

## Testing Your Setup

### Quick Test

1. Try signing up with a new email
2. Check the Supabase dashboard under **Authentication** → **Users**
3. You should see the new user listed

### Check Logs

1. Go to **Logs** → **Explorer** in Supabase dashboard
2. Run this query to see recent auth events:

```sql
SELECT * FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 10;
```

## Development Mode Settings

For easier development, configure these settings in Supabase:

1. **Disable Email Confirmation:**
   - **Authentication** → **Settings**
   - Disable "Confirm email" under Email Auth

2. **Extend Session Duration:**
   - **Authentication** → **Settings**
   - Increase JWT expiry (default is fine for dev)

3. **Test Email Provider:**
   - Supabase provides a built-in test email provider for development
   - Check emails at **Authentication** → **Email Templates** → **Test**

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmation
- [ ] Set up a real email provider (SendGrid, AWS SES, etc.)
- [ ] Configure proper RLS policies
- [ ] Set up password strength requirements
- [ ] Enable MFA (optional but recommended)
- [ ] Set appropriate rate limits
- [ ] Review and test all database triggers
- [ ] Set up proper error monitoring

## Need More Help?

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Discord](https://discord.supabase.com)
- Check the browser console for detailed error messages
- Check Supabase dashboard **Logs** for server-side errors
