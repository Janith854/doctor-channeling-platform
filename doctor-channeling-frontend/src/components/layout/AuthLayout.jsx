import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary-400 blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-accent-400 blur-[100px]" />
        </div>
        <div className="relative text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Stethoscope className="w-10 h-10 text-primary-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Medi<span className="text-primary-300">Channel</span>
          </h1>
          <p className="text-lg text-navy-300 leading-relaxed">
            Your trusted platform for seamless doctor appointments. Connect with top specialists instantly.
          </p>
          <div className="flex gap-8 justify-center mt-10 text-navy-300">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm">Doctors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-sm">Hospitals</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm">Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-navy-50">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
