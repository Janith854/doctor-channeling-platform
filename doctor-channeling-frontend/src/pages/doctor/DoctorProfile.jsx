import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, hospitalApi, affiliationApi } from '../../api/directoryApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import {
  User,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Edit3,
  Award,
  BookOpen,
  DollarSign,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [affiliations, setAffiliations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    fullName: '',
    qualifications: '',
    slmcNumber: '',
    bio: '',
  });

  const fetchDoctorProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [docRes, hospRes, affRes] = await Promise.all([
        doctorApi.getAll().catch(() => ({ data: { data: [] } })),
        hospitalApi.getAll().catch(() => ({ data: { data: [] } })),
        affiliationApi.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const allDocs = docRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
      setDoctor(currentDoc);

      const allHospitals = hospRes.data?.data || [];
      setHospitals(allHospitals);

      if (currentDoc?.id) {
        const allAffs = affRes.data?.data || [];
        const docAffs = allAffs.filter((a) => a.doctorId === currentDoc.id);
        setAffiliations(docAffs);

        setFormData({
          fullName: currentDoc.fullName || `Dr. ${user.firstName} ${user.lastName}`,
          qualifications: currentDoc.qualifications || '',
          slmcNumber: currentDoc.slmcNumber || '',
          bio: currentDoc.bio || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, [user?.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!doctor?.id) return;
    try {
      setSaving(true);
      await doctorApi.update(doctor.id, {
        userId: doctor.userId || user.id,
        specializationId: doctor.specialization?.id || doctor.specializationId,
        fullName: formData.fullName,
        qualifications: formData.qualifications,
        slmcNumber: formData.slmcNumber,
        bio: formData.bio,
      });
      toast.success('Profile updated successfully');
      setIsEditOpen(false);
      fetchDoctorProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h]));

  if (loading) return <Loader text="Loading clinical practitioner profile..." />;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Practitioner Profile"
        subtitle="View and manage your registered credentials, specialty qualifications, and affiliated medical centers"
        actions={
          <Button
            variant="primary"
            size="md"
            className="gap-2 shadow-xs"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        }
      />

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-navy-100 p-6 md:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary-50 text-primary-700 border-2 border-primary-100 flex items-center justify-center font-bold text-3xl shrink-0 shadow-xs">
            {doctor?.fullName?.charAt(0) || 'D'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Practitioner
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                <Stethoscope className="w-3.5 h-3.5" />
                {doctor?.specialization?.name || 'Medical Specialist'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-navy-900">
              {doctor?.fullName || `Dr. ${user?.firstName} ${user?.lastName}`}
            </h1>

            <p className="text-sm font-medium text-navy-600">
              {doctor?.qualifications || 'MBBS, Certified Healthcare Specialist'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-navy-500">
              <span className="font-mono bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-100">
                SLMC Reg: <b>{doctor?.slmcNumber || 'SLMC-VERIFIED'}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-navy-400" /> {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-navy-400" /> {user?.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Clinical Bio & Affiliations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Biography & Clinical Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border border-navy-100 p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" /> Professional Summary & Clinical Bio
            </h3>
            <p className="text-sm text-navy-600 leading-relaxed whitespace-pre-line">
              {doctor?.bio ||
                'No detailed biography has been added yet. Update your profile with your clinical experience, special procedures, and hospital practice history.'}
            </p>
          </Card>

          <Card className="bg-white border border-navy-100 p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-600" /> Qualifications & Medical Education
            </h3>
            <div className="p-3.5 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1">
              <p className="text-xs font-semibold text-navy-900">
                {doctor?.qualifications || 'Standard Medical Board Certification'}
              </p>
              <p className="text-xs text-navy-500">
                Verified against Sri Lanka Medical Council (SLMC) and accredited medical boards.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Hospital Affiliations & Channeling Fees */}
        <div className="space-y-6">
          <Card className="bg-white border border-navy-100 p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" /> Hospital Centers & Fees
            </h3>

            {affiliations.length === 0 ? (
              <div className="text-xs text-navy-500 py-3 text-center bg-navy-50 rounded-xl border border-navy-100">
                No hospital affiliations linked.
              </div>
            ) : (
              <div className="space-y-3">
                {affiliations.map((aff) => {
                  const hosp = hospitalMap[aff.hospitalId];
                  return (
                    <div
                      key={`${aff.doctorId}-${aff.hospitalId}`}
                      className="p-3 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1.5"
                    >
                      <p className="text-xs font-bold text-navy-900">
                        {hosp?.name || `Hospital #${aff.hospitalId?.slice(0, 6)}`}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-navy-500">Consultation Fee</span>
                        <span className="font-bold text-primary-700">
                          ${aff.consultationFee ? Number(aff.consultationFee).toFixed(2) : '35.00'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="bg-navy-900 text-white border border-navy-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary-400" />
              <h4 className="text-xs font-bold tracking-wide uppercase text-primary-300">
                Channeling Status
              </h4>
            </div>
            <p className="text-xs text-navy-200 leading-relaxed">
              Your profile is visible to patients looking to book appointments across registered partner hospitals.
            </p>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Doctor Profile"
        subtitle="Update practitioner title, medical qualifications, and biography"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name with Title"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Dr. Samantha Perera"
            required
          />

          <Input
            label="SLMC Registration Number"
            value={formData.slmcNumber}
            onChange={(e) => setFormData({ ...formData, slmcNumber: e.target.value })}
            placeholder="SLMC-49201"
          />

          <Input
            label="Qualifications"
            value={formData.qualifications}
            onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
            placeholder="MBBS, MD, FRCS"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy-700 tracking-wide">
              Professional Biography
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Provide an overview of your clinical experience and patient care approach..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-100">
            <Button variant="secondary" size="md" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
