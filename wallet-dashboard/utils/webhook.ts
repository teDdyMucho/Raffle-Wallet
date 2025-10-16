import { WalletTransaction } from './supabase';

/**
 * Sends a webhook notification when a transaction status is updated
 * In a real application, this would call an actual webhook endpoint
 */
export async function triggerWebhook(
  transaction: WalletTransaction,
  newStatus: 'approved' | 'pending' | 'rejected'
): Promise<boolean> {
  // This is a mock implementation
  // In a real app, you would make an API call to your webhook endpoint
  
  console.log(`[WEBHOOK] Transaction ${transaction.id} status changed to ${newStatus}`);
  
  try {
    // Simulate API call
    const webhookUrl = 'https://primary-production-6722.up.railway.app/webhook/raffle-balance';
    
    // In a real implementation, you would make an actual fetch call
    // For demo purposes, we're just logging the payload
    const payload = {
      event: 'transaction_status_updated',
      transaction_id: transaction.id,
      user_id: transaction.user_id,
      previous_status: transaction.status,
      new_status: newStatus,
      amount_cents: transaction.amount_cents,
      method: transaction.method,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[WEBHOOK] Payload: ${JSON.stringify(payload)}`);
    console.log(`[WEBHOOK] Would send to: ${webhookUrl}`);
    
    // Only send webhook for Approved or Rejected status
    if (newStatus === 'approved' || newStatus === 'rejected') {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
      // Ignore the response body; endpoint may return no content
    }
    
    return true;
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return false;
  }
}
