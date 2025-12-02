-- ============================================
-- CREATE PENDING SCANS TABLE
-- ============================================
-- This table stores unregistered RFID UIDs
-- When a card is scanned but the student doesn't exist,
-- the UID is stored here for admin to register later
-- ============================================

-- 1. Create pending_scans table
CREATE TABLE IF NOT EXISTS public.pending_scans (
    id SERIAL PRIMARY KEY,
    uid TEXT NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'ignored')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_scans_uid ON public.pending_scans(uid);
CREATE INDEX IF NOT EXISTS idx_pending_scans_status ON public.pending_scans(status);
CREATE INDEX IF NOT EXISTS idx_pending_scans_scanned_at ON public.pending_scans(scanned_at DESC);

-- 3. Disable RLS for development
ALTER TABLE public.pending_scans DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON public.pending_scans TO authenticated;
GRANT ALL ON public.pending_scans TO anon;
GRANT ALL ON public.pending_scans TO service_role;

-- 5. Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE pending_scans_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE pending_scans_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE pending_scans_id_seq TO service_role;

-- 6. Verify table was created
SELECT 
    '✅ pending_scans table created!' as status,
    COUNT(*) as pending_count
FROM public.pending_scans;

-- 7. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_scans'
ORDER BY ordinal_position;

-- ============================================
-- USAGE:
-- ============================================
-- When an unregistered card is scanned:
-- 1. UID is automatically stored in this table
-- 2. Admin can view pending UIDs in admin panel
-- 3. Admin registers the student
-- 4. Status is updated to 'registered'
--
-- Query pending scans:
-- SELECT * FROM pending_scans WHERE status = 'pending' ORDER BY scanned_at DESC;
-- ============================================
