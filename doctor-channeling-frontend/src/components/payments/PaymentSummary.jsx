import Card from '../common/Card';
import { DollarSign, ShieldCheck, Check } from 'lucide-react';

export default function PaymentSummary({
  doctorFee = 15.00,
  hospitalFee = 5.00,
  bookingFee = 2.00,
  currency = 'USD',
}) {
  const total = Number(doctorFee) + Number(hospitalFee) + Number(bookingFee);

  return (
    <Card className="bg-navy-50/70 border border-navy-200 p-5 rounded-2xl">
      <h4 className="font-bold text-navy-900 text-base mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-accent-600" /> Payment Summary
      </h4>

      <div className="space-y-2.5 text-sm text-navy-600">
        <div className="flex justify-between items-center">
          <span>Doctor Consultation Fee</span>
          <span className="font-semibold text-navy-800">${Number(doctorFee).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Hospital Charges</span>
          <span className="font-semibold text-navy-800">${Number(hospitalFee).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Platform & Booking Fee</span>
          <span className="font-semibold text-navy-800">${Number(bookingFee).toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-navy-200 flex justify-between items-center text-base font-extrabold text-navy-900">
          <span>Total Amount</span>
          <span className="text-primary-700 text-lg">${total.toFixed(2)} {currency}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-navy-200/60 flex items-center gap-2 text-xs text-accent-700 font-medium">
        <ShieldCheck className="w-4 h-4" /> 100% Refund guarantee upon valid cancellation
      </div>
    </Card>
  );
}
