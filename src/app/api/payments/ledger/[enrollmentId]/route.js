import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStudentLedger } from "@/services/payments";

function formatToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => formatToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const finalKey = camelKey === 'id' ? '_id' : camelKey;
      result[finalKey] = formatToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export async function GET(request, { params }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = params;

  try {
    // Check permissions
    if (session.user.role === 'student') {
      const { data: enrollment, error } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .eq('student_id', session.user.id)
        .single();
        
      if (error || !enrollment) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const ledger = await getStudentLedger(enrollmentId);
    return NextResponse.json(formatToCamelCase(ledger));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
