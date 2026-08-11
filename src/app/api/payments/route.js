import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { recordManualPayment, markOverduePayments } from "@/services/payments";

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

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const enrollmentId = searchParams.get('enrollmentId');

  try {
    let query = supabaseAdmin
      .from('payments')
      .select(`
        *,
        enrollmentId:enrollments!enrollment_id (
          *,
          studentId:users!student_id (
            name,
            email
          )
        )
      `)
      .eq('school_id', auth.session.user.schoolId)
      .order('due_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (enrollmentId) query = query.eq('enrollment_id', enrollmentId);

    const { data: payments, error } = await query;
    
    if (error) throw error;

    return NextResponse.json(formatToCamelCase(payments));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    if (body.action === 'record_payment') {
      const payment = await recordManualPayment(body.paymentId, body.method, body.transactionId);
      return NextResponse.json(payment);
    } else if (body.action === 'mark_overdue') {
      const count = await markOverduePayments();
      return NextResponse.json({ message: 'Overdue payments marked', count });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
