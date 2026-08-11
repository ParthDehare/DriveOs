export async function sendNotification(userId, message, channel = 'whatsapp') {
  console.log(`[NOTIFICATION -> User ${userId} via ${channel}]: ${message}`);
  return true;
}
