import { useState, useEffect } from 'react';
import { doctorApi, specializationApi, hospitalApi, affiliationApi } from '../../api/directoryApi';
import DoctorCard from '../../components/doctors/DoctorCard';
import SearchBar from '../../components/doctors/SearchBar';
import FilterPanel from '../../components/doctors/FilterPanel';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Stethoscope } from 'lucide-react';

const extractDataList = (res) => {
  if (!res) return [];
  const body = res?.data !== undefined ? res.data : res;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.doctors)) return body.doctors;
  if (Array.isArray(body?.specializations)) return body.specializations;
  if (Array.isArray(body?.hospitals)) return body.hospitals;
  if (Array.isArray(body?.affiliations)) return body.affiliations;
  return [];
};

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [docRes, specRes, hospRes, affRes] = await Promise.allSettled([
        doctorApi.getAll(),
        specializationApi.getAll(),
        hospitalApi.getAll(),
        affiliationApi.getAll(),
      ]);

      if (docRes.status === 'fulfilled') {
        const docList = extractDataList(docRes.value);
        setDoctors(docList);
      } else {
        console.error('Failed to load doctors:', docRes.reason);
        setError(
          docRes.reason?.response?.data?.message ||
          docRes.reason?.message ||
          'Failed to connect to Directory Service at http://localhost:8082'
        );
      }

      if (specRes.status === 'fulfilled') {
        setSpecializations(extractDataList(specRes.value));
      }

      if (hospRes.status === 'fulfilled') {
        setHospitals(extractDataList(hospRes.value));
      }

      if (affRes.status === 'fulfilled') {
        setAffiliations(extractDataList(affRes.value));
      }
    } catch (err) {
      console.error('Error fetching doctor directory data:', err);
      setError('An unexpected error occurred while loading doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedHospital('');
  };

  const filteredDoctors = doctors.filter((doc) => {
    const docName =
      doc.fullName ||
      (doc.firstName ? `${doc.firstName} ${doc.lastName || ''}`.trim() : '') ||
      doc.name ||
      '';
    const docQual = doc.qualifications || '';
    const docSpecName =
      doc.specialization?.name ||
      doc.specializationName ||
      (typeof doc.specialization === 'string' ? doc.specialization : '') ||
      '';

    const matchesSearch =
      !searchQuery ||
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docQual.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docSpecName.toLowerCase().includes(searchQuery.toLowerCase());

    const docSpecId =
      doc.specialization?.id ||
      doc.specializationId ||
      doc.specialization;

    const matchesSpec =
      !selectedSpecialization ||
      docSpecId === selectedSpecialization ||
      String(docSpecId) === String(selectedSpecialization) ||
      (doc.specialization?.name && doc.specialization.name === selectedSpecialization);

    const docId = doc.id || doc.doctorId;
    const matchesHospital =
      !selectedHospital ||
      (doc.hospitalAffiliations &&
        doc.hospitalAffiliations.some(
          (h) => h.hospitalId === selectedHospital || h.id === selectedHospital
        )) ||
      doc.hospitalId === selectedHospital ||
      affiliations.some(
        (a) =>
          (a.doctorId === docId || a.doctor?.id === docId) &&
          (a.hospitalId === selectedHospital || a.hospital?.id === selectedHospital)
      );

    return matchesSearch && matchesSpec && matchesHospital;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Find Specialists & Doctors</h1>
        <p className="text-sm text-navy-500 mt-1">
          Search and book consultations with certified healthcare professionals
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} className="mb-4" />}

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by doctor name, qualification, or field..."
        />

        <FilterPanel
          specializations={specializations}
          hospitals={hospitals}
          selectedSpecialization={selectedSpecialization}
          onSpecializationChange={setSelectedSpecialization}
          selectedHospital={selectedHospital}
          onHospitalChange={setSelectedHospital}
          onReset={handleReset}
        />
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Searching doctors directory..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors match your criteria"
          description={
            doctors.length === 0
              ? 'No doctors found in the directory. Please check if doctors are registered.'
              : 'Try clearing filters or searching with different keywords.'
          }
          actionLabel={doctors.length === 0 ? 'Refresh Directory' : 'Clear Filters'}
          onAction={doctors.length === 0 ? fetchData : handleReset}
        />
      ) : (
        <div>
          <div className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-4">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <DoctorCard key={doc.id || doc.doctorId || doc.userId} doctor={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
