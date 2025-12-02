# Supabase Setup Guide

This guide walks you through setting up the Supabase backend for the Smart Classroom Management System.

## Prerequisites

- A Supabase account (sign up at https://supabase.com - free tier available)
- Node.js v16 or later (for running migration scripts)

## Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `smart-classroom-management`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

### Step 2: Get API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see three important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: A long JWT token (safe to use in frontend)
   - **service_role key**: Another JWT token (keep this secret!)

### Step 3: Configure Environment Variables

1. In the `backend` directory, the `.env` file should already be created with your credentials
2. If not, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase JavaScript client
- `dotenv` - Environment variable management
- `nodemon` - Development server with auto-reload

### Step 5: Run Database Migrations

You have three options to run the migrations:

#### Option A: Run All Migrations at Once (Recommended)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Open the file `backend/migrations/000_run_all_migrations.sql`
5. Copy the entire contents
6. Paste into the Supabase SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. You should see: "Database schema created successfully!"

#### Option B: Run Migrations Individually

If you prefer to run migrations one at a time:

1. Go to **SQL Editor** in Supabase Dashboard
2. For each migration file (in order):
   - `001_create_students_table.sql`
   - `002_create_attendance_logs_table.sql`
   - `003_create_rooms_table.sql`
   - `004_create_timetable_table.sql`
   - `005_create_users_table.sql`
3. Copy the file contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify success before moving to the next migration

#### Option C: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 6: Verify Database Schema

After running migrations, verify the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see 5 tables:
   - `students`
   - `attendance_logs`
   - `rooms`
   - `timetable`
   - `users`

Or run this SQL query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Step 7: Insert Sample Data (Optional)

For testing purposes, you can insert sample data:

```sql
-- Insert sample rooms
INSERT INTO rooms (room_no, is_busy) VALUES
('101', false),
('102', false),
('103', false),
('201', false),
('202', false);

-- Insert sample student
INSERT INTO students (name, uid, email, phone, dob, course) VALUES
('John Doe', 'A1B2C3D4', 'john@example.com', '1234567890', '2000-01-15', 'Computer Science');

-- Insert admin user
INSERT INTO users (email, role) VALUES
('admin@example.com', 'admin');

-- Insert student user (linked to the student above)
INSERT INTO users (email, role, student_uid) VALUES
('john@example.com', 'student', 'A1B2C3D4');
```

### Step 8: Configure Row Level Security (Optional but Recommended)

For production, enable Row Level Security (RLS):

1. Go to **Authentication** > **Policies**
2. Enable RLS for each table
3. Create policies for admin and student access

Example policy for students table (admin only):

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can do everything on students"
ON students
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Students can view their own data
CREATE POLICY "Students can view their own data"
ON students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.student_uid = students.uid
  )
);
```

## Verification Checklist

- [ ] Supabase project created
- [ ] API credentials copied to `.env` file
- [ ] Dependencies installed (`npm install`)
- [ ] All 5 migrations executed successfully
- [ ] All 5 tables visible in Table Editor
- [ ] Sample data inserted (optional)
- [ ] RLS policies configured (optional)

## Troubleshooting

### Error: "relation already exists"

This means the table was already created. You can either:
- Drop the table and re-run: `DROP TABLE table_name CASCADE;`
- Or skip that migration if the table is correct

### Error: "permission denied"

Make sure you're using the correct API key:
- For migrations: Use `SUPABASE_SERVICE_ROLE_KEY`
- For frontend: Use `SUPABASE_ANON_KEY`

### Error: "foreign key constraint violation"

Ensure migrations are run in the correct order:
1. students (no dependencies)
2. attendance_logs (depends on students)
3. rooms (no dependencies)
4. timetable (depends on rooms)
5. users (depends on students)

### Can't connect to Supabase

- Verify your `SUPABASE_URL` is correct
- Check your internet connection
- Ensure the Supabase project is active (not paused)

## Next Steps

After completing the setup:

1. **Test the connection**: Run a simple query to verify connectivity
2. **Set up the frontend**: Configure frontend to use the same Supabase credentials
3. **Implement API endpoints**: Create backend API routes (Task 4)
4. **Test with ESP32**: Configure ESP32 to send attendance data

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check the Supabase Dashboard logs
2. Review the migration files for syntax errors
3. Consult the Supabase documentation
4. Check the project README for additional help
