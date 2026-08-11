import { supabaseAdmin } from '@/lib/supabase';

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

export async function checkStudentPaymentStatus(enrollmentId) {
  const { data: paymentsData, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('tranche_number', { ascending: true });
    
  if (error) throw error;
  
  const payments = formatToCamelCase(paymentsData || []);
  
  let totalPaid = 0;
  let totalPending = 0;
  let totalDue = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  
  payments.forEach(payment => {
    totalDue += payment.amount;
    
    if (payment.status === 'paid') {
      totalPaid += payment.amount;
    } else {
      totalPending += payment.amount;
    }
    
    if (payment.status === 'overdue') {
      overdueCount++;
      overdueAmount += payment.amount;
    }
  });
  
  return {
    hasOverdue: overdueCount > 0,
    overdueCount,
    overdueAmount,
    totalPaid,
    totalPending,
    totalDue,
    payments
  };
}

export async function markOverduePayments() {
  const today = new Date().toISOString();
  
  const { data, error, count } = await supabaseAdmin
    .from('payments')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', today)
    .select('*', { count: 'exact' });
    
  if (error) throw error;
  return count || 0;
}

export async function recordManualPayment(paymentId, method, transactionId) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      method,
      transaction_id: transactionId
    })
    .eq('id', paymentId)
    .select()
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Payment not found');
  
  return formatToCamelCase(data);
}

export async function getSchoolPaymentSummary(schoolId) {
  const { data: paymentsData, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  const payments = formatToCamelCase(paymentsData || []);
  
  let totalRevenue = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  
  payments.forEach(payment => {
    totalRevenue += payment.amount;
    if (payment.status === 'paid') {
      totalCollected += payment.amount;
    } else if (payment.status === 'pending') {
      totalPending += payment.amount;
    } else if (payment.status === 'overdue') {
      totalOverdue += payment.amount;
    }
  });
  
  const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
  
  return {
    totalRevenue,
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate
  };
}

export async function getStudentLedger(enrollmentId) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, enrollmentId:enrollments!enrollment_id(*, studentId:users!student_id(*))')
    .eq('enrollment_id', enrollmentId)
    .order('tranche_number', { ascending: true });
    
  if (error) throw error;
  return formatToCamelCase(data || []);
}
