# Storage Bucket Setup for Plain Theory

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `documents`
5. Keep it as **Private** (we'll set custom policies)
6. Click **"Create bucket"**

## Step 2: Set Storage Policies

Go to the **Policies** tab for the `documents` bucket and add these policies:

### Policy 1: Allow Users to Upload Their Own Files

```sql
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**What this does:** Allows authenticated users to upload files to folders named after their user ID.

---

### Policy 2: Allow Users to View Their Own Files

```sql
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**What this does:** Allows users to view files in their own user ID folder.

---

### Policy 3: Allow Users to Delete Their Own Files

```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**What this does:** Allows users to delete files from their own user ID folder.

---

## Step 3: Make Bucket Public (Alternative Simple Setup)

If the above policies don't work, you can make the bucket public:

1. Go to Storage > documents bucket
2. Click the settings (gear icon)
3. Toggle **"Public bucket"** to ON
4. Click **"Save"**

**Note:** With a public bucket, files are accessible via public URLs, but database RLS policies still protect who can insert/delete document records.

---

## Step 4: Verify Setup

Run this SQL in the SQL Editor to check your policies:

```sql
-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'documents';
```

---

## Troubleshooting

### Error: "new row violates row-level security policy"

**Cause:** The INSERT policy for the documents table or storage bucket is not correctly configured.

**Fix:**
1. Re-run the updated `supabase-schema.sql` file
2. Make sure storage bucket policies are set (see above)
3. Verify user is authenticated: `SELECT auth.uid();` should return a UUID, not NULL

### Error: "Failed to upload file"

**Cause:** Storage bucket doesn't exist or policies are missing.

**Fix:**
1. Create the `documents` bucket in Supabase Storage
2. Add the storage policies above, or make the bucket public
3. Check browser console for detailed error messages

### Files upload but can't be downloaded

**Cause:** Bucket is private and storage SELECT policy is missing.

**Fix:**
1. Add the "view their own documents" policy above
2. Or make the bucket public

---

## Quick Public Setup (Easiest)

If you want the simplest setup:

1. Create bucket named `documents`
2. Make it **Public**
3. No storage policies needed
4. Database RLS policies still protect your data

This is perfect for testing and MVP!
