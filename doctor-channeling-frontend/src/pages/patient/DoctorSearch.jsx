import { useState, useEffect } from 'react';
import { doctorApi, specializationApi, hospitalApi, affiliationApi } from '../../api/directoryApi';
import DoctorCard from '../../components/doctors/DoctorCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Search, SlidersHorizontal, X, Stethoscope } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);

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
        setDoctors(extractDataList(docRes.value));
      } else {
        setError(
          docRes.reason?.response?.data?.message ||
          docRes.reason?.message ||
          'Failed to connect to Directory Service'
        );
      }

      if (specRes.status === 'fulfilled') setSpecializations(extractDataList(specRes.value));
      if (hospRes.status === 'fulfilled') setHospitals(extractDataList(hospRes.value));
      if (affRes.status === 'fulfilled') setAffiliations(extractDataList(affRes.value));
    } catch (err) {
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

  const hasActiveFilters = selectedSpecialization || selectedHospital;

  const filteredDoctors = doctors.filter((doc) => {
    const docName =
      doc.fullName ||
      (doc.firstName ? `${doc.firstName} ${doc.lastName || ''}`.trim() : '') ||
      doc.name ||
      '';
    const docSpecName =
      doc.specialization?.name ||
      doc.specializationName ||
      (typeof doc.specialization === 'string' ? doc.specialization : '') ||
      '';

    const matchesSearch =
      !searchQuery ||
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.qualifications || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      docSpecName.toLowerCase().includes(searchQuery.toLowerCase());

    const docSpecId =
      doc.specialization?.id || doc.specializationId || doc.specialization;

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Find the right doctor for you</h1>
        <p className="text-sm text-navy-500 mt-1">
          Search certified medical practitioners and book instant channeling slots
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Search + Filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
            <input
              id="doctor-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor name or specialization..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle filters */}
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              hasActiveFilters || showFilters
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-navy-700 border-navy-200 hover:border-primary-400 hover:text-primary-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-white/25 text-xs font-bold flex items-center justify-center">
                {[selectedSpecialization, selectedHospital].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-navy-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs animate-slide-down">
            <div>
              <label className="block text-xs font-semibold text-navy-500 mb-1.5">Specialization</label>
              <select
                id="filter-specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 bg-white text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-500 mb-1.5">Hospital / Clinic</label>
              <select
                id="filter-hospital"
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 bg-white text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Hospitals</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                id="btn-clear-filters"
                onClick={handleReset}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 bg-navy-50 text-sm font-semibold text-navy-600 hover:bg-navy-100 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Searching doctor directory..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors match your criteria"
          description={
            doctors.length === 0
              ? 'No doctors have been registered in the directory yet.'
              : 'Try clearing selected filters or searching with different keywords.'
          }
          actionLabel={doctors.length === 0 ? 'Refresh Directory' : 'Clear Filters'}
          onAction={doctors.length === 0 ? fetchData : handleReset}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'specialist' : 'specialists'}
          </p>
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
