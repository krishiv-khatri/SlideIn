-- Create user_resumes table for storing resume information
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id) -- Each user can only have one resume
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON public.user_resumes(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_resumes_updated_at
    BEFORE UPDATE ON public.user_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_user_resumes_updated_at();

-- Add RLS policies
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own resume
CREATE POLICY "Users can view their own resume"
    ON public.user_resumes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own resume
CREATE POLICY "Users can insert their own resume"
    ON public.user_resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own resume
CREATE POLICY "Users can update their own resume"
    ON public.user_resumes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own resume
CREATE POLICY "Users can delete their own resume"
    ON public.user_resumes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.user_resumes TO authenticated; 