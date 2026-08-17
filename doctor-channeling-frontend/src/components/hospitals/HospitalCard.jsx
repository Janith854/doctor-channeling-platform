import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import Card from '../common/Card';

export default function HospitalCard({ hospital }) {
  if (!hospital) return null;

  return (
    <Card hover className="bg-white border border-navy-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-navy-900 text-base line-clamp-1">{hospital.name}</h4>
            {hospital.city && (
              <p className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500" /> {hospital.city}, {hospital.district || ''}
              </p>
            )}
          </div>
        </div>

        {hospital.address && (
          <p className="text-xs text-navy-600 mt-2 line-clamp-2 bg-navy-50 p-2.5 rounded-xl">
            {hospital.address}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-navy-100 text-xs text-navy-500 space-y-1">
        {hospital.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-navy-400" />
            <span>{hospital.phone}</span>
          </div>
        )}
        {hospital.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-navy-400" />
            <span className="truncate">{hospital.email}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
