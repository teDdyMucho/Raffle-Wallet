import { WalletTransaction } from './supabase';
import { format } from 'date-fns';

/**
 * Converts wallet transactions to CSV format and triggers a download
 */
export function exportTransactionsToCSV(transactions: WalletTransaction[], fileName: string = 'wallet-transactions'): void {
  // Define CSV headers
  const headers = [
    'User',
    'Amount (₱)',
    'Method',
    'Status',
    'Referral Code',
    'Date'
  ];
  
  // Format transaction data for CSV
  const data = transactions.map(transaction => {
    // Format amount from cents to pesos
    const amountPesos = (transaction.amount_cents / 100).toFixed(2);
    
    // Format date
    let formattedDate = transaction.created_at;
    try {
      formattedDate = format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return [
      transaction.user_name || transaction.user_id,
      amountPesos,
      transaction.method,
      transaction.status,
      transaction.referral_code || '',
      formattedDate
    ];
  });
  
  // Combine headers and data
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  // Append link to document
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
