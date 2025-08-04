import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

    // Get user's resume
    const { data: resume, error } = await supabase
      .from('user_resumes')
      .select('id, file_name, file_size, mime_type, created_at, updated_at')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resume: resume || null
    });

  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    // Get resume info first to get file path
    const { data: resume, error: fetchError } = await supabase
      .from('user_resumes')
      .select('file_path')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to find resume' },
        { status: 500 }
      );
    }

    if (resume) {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([resume.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete record from database
      const { error: deleteError } = await supabase
        .from('user_resumes')
        .delete()
        .eq('user_id', session.user.id);

      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete resume' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Resume deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 