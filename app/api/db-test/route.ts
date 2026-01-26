import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' 
        }, 
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Attempt to select one row from the 'contractors' table
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      status: "connected", 
      database: "Ambient Twin Prod" 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error",
        message: error.message || 'Unknown database error'
      }, 
      { status: 500 }
    );
  }
}