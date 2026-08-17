import Select from '../common/Select';
import Button from '../common/Button';
import { RotateCcw } from 'lucide-react';

export default function FilterPanel({
  specializations = [],
  hospitals = [],
  selectedSpecialization,
  onSpecializationChange,
  selectedHospital,
  onHospitalChange,
  onReset,
}) {
  const specOptions = specializations.map((s) => ({ value: s.id, label: s.name }));
  const hospitalOptions = hospitals.map((h) => ({ value: h.id, label: h.name }));

  return (
    <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
      <Select
        label="Specialization"
        options={specOptions}
        value={selectedSpecialization}
        onChange={(e) => onSpecializationChange(e.target.value)}
        placeholder="All Specializations"
      />

      <Select
        label="Hospital / Clinic"
        options={hospitalOptions}
        value={selectedHospital}
        onChange={(e) => onHospitalChange(e.target.value)}
        placeholder="All Hospitals"
      />

      <div>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onReset}
          className="text-navy-600 border border-navy-200 gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Reset Filters
        </Button>
      </div>
    </div>
  );
}
