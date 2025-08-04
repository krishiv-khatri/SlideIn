import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for resumes
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  try {
    if (file.type === 'text/plain') {
      return buffer.toString('utf-8');
    }
    
    if (file.type === 'application/pdf') {
      // For PDF extraction, we'll use a simple approach for now
      // In production, you might want to use a library like pdf-parse
      const text = buffer.toString('utf-8');
      // Extract readable text from PDF (basic implementation)
      const textLines = text.split('\n').filter(line => 
        line.trim().length > 0 && 
        /[a-zA-Z0-9]/.test(line) &&
        !line.includes('%%PDF') &&
        !line.includes('/Type') &&
        !line.includes('stream')
      );
      return textLines.join('\n').substring(0, 10000); // Limit to 10k chars
    }
    
    if (file.type.includes('word') || file.type.includes('document')) {
      // For Word documents, extract text (basic implementation)
      // In production, you might want to use mammoth or similar library
      const text = buffer.toString('utf-8');
      // Basic text extraction - remove non-printable characters
      return text.replace(/[^\x20-\x7E\n\r]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 10000); // Limit to 10k chars
    }
    
    return 'Unable to extract text from this file type';
  } catch (error) {
    console.error('Error extracting text:', error);
    return 'Error extracting text from file';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // The set method will throw in middleware or when cookies are static
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch {
              // The delete method will throw in middleware or when cookies are static
            }
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, Word document, or text file.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Extract text from the file
    const extractedText = await extractTextFromFile(file);

    // Create file path for storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `resume_${session.user.id}_${Date.now()}.${fileExtension}`;
    const filePath = `resumes/${session.user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Delete existing resume if any
    await supabase
      .from('user_resumes')
      .delete()
      .eq('user_id', session.user.id);

    // Save resume metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('user_resumes')
      .insert({
        user_id: session.user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        extracted_text: extractedText
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabase.storage
        .from('user-files')
        .remove([filePath]);
      
      return NextResponse.json(
        { error: 'Failed to save resume information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: dbData.id,
        fileName: dbData.file_name,
        fileSize: dbData.file_size,
        mimeType: dbData.mime_type,
        uploadedAt: dbData.created_at,
        textLength: extractedText.length
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 