import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';
import connectDB from '@/lib/mongodb';

export async function checkStudentPaymentStatus(enrollmentId) {
  await connectDB();
  const payments = await Payment.find({ enrollmentId }).sort({ trancheNumber: 1 });
  
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
  await connectDB();
  const today = new Date();
  
  const result = await Payment.updateMany(
    { 
      status: 'pending',
      dueDate: { $lt: today }
    },
    {
      $set: { status: 'overdue' }
    }
  );
  
  return result.modifiedCount;
}

export async function recordManualPayment(paymentId, method, transactionId) {
  await connectDB();
  
  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    {
      status: 'paid',
      paidAt: new Date(),
      method,
      transactionId
    },
    { new: true }
  );
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  return payment;
}

export async function getSchoolPaymentSummary(schoolId) {
  await connectDB();
  
  const payments = await Payment.find({ schoolId });
  
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
  await connectDB();
  
  const payments = await Payment.find({ enrollmentId })
    .populate({
      path: 'enrollmentId',
      populate: {
        path: 'studentId'
      }
    })
    .sort({ trancheNumber: 1 });
    
  return payments;
}
