import { FC, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createCashInRequest, WalletTransaction } from '../utils/supabase';

interface NewCashInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: WalletTransaction) => void;
  userId: string;
}

const NewCashInModal: FC<NewCashInModalProps> = ({ isOpen, onClose, onSubmit, userId }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'GCash' | 'Bank' | 'PayPal'>('GCash');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountCents = Math.round(amountValue * 100);

    try {
      setIsSubmitting(true);

      // Create via Supabase and use the actual returned row
      const created = await createCashInRequest(userId, amountCents, method, referralCode || undefined);
      if (created) {
        onSubmit(created);
        resetForm();
        onClose();
      } else {
        setError('Failed to create cash-in request.');
      }
    } catch (err) {
      console.error('Error creating cash-in request:', err);
      setError('Failed to create cash-in request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod('GCash');
    setReferralCode('');
    setError('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    New Cash-In Request
                  </Dialog.Title>
                  <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₱)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      id="method"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as 'GCash' | 'Bank' | 'PayPal')}
                      required
                    >
                      <option value="GCash">GCash</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="referral"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={onClose} disabled={isSubmitting}>
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewCashInModal;
