import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

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
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        enrollmentId:enrollment_id (
          *,
          studentId:student_id (
            name,
            email
          )
        )
      `)
      .eq('id', params.id)
      .eq('school_id', auth.session.user.schoolId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(formatToCamelCase(payment));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updateData = {};
    
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.method !== undefined) updateData.method = body.method;
    
    // Auto-set paidAt if status is changing to paid and not already paid
    if (body.status === 'paid' && updateData.paid_at === undefined) {
       updateData.paid_at = new Date().toISOString();
    }

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .eq('id', params.id)
      .eq('school_id', auth.session.user.schoolId)
      .select()
      .single();

    if (error || !payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(formatToCamelCase(payment));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
