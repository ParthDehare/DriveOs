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

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;
  
  const schoolId = auth.session.user.schoolId;
  
  // Helper: conditionally apply school filter
  const withSchool = (query) => schoolId ? query.eq('school_id', schoolId) : query;

  try {
    const [{ count: totalStudents }, { count: totalInstructors }, { count: totalVehicles }] = await Promise.all([
      withSchool(supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true)),
      withSchool(supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instructor').eq('is_active', true)),
      withSchool(supabaseAdmin.from('vehicles').select('*', { count: 'exact', head: true }).eq('is_active', true))
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: todaySessions } = await withSchool(supabaseAdmin.from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .neq('status', 'cancelled'));

    const { data: allPaymentsData } = await withSchool(supabaseAdmin.from('payments').select('*'));
    const allPayments = formatToCamelCase(allPaymentsData || []);
    
    let pendingPayments = 0;
    let overduePayments = 0;
    let monthlyRevenue = 0;
    let totalPaid = 0;
    let totalDue = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allPayments.forEach(payment => {
      totalDue += payment.amount;
      
      if (payment.status === 'paid') {
        totalPaid += payment.amount;
        if (payment.paidAt) {
          const paidDate = new Date(payment.paidAt);
          if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
            monthlyRevenue += payment.amount;
          }
        }
      } else {
        if (new Date(payment.dueDate) < now) {
          overduePayments += payment.amount;
        } else if (payment.status === 'pending') {
          pendingPayments += payment.amount;
        }
      }
    });

    const collectionRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    const { data: recentEnrollmentsData } = await withSchool(supabaseAdmin.from('enrollments')
      .select(`
        *,
        studentId:student_id (name, email),
        packageId:package_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5));

    const recentEnrollments = formatToCamelCase(recentEnrollmentsData || []);

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      totalVehicles,
      todaySessions,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      collectionRate,
      recentEnrollments
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
