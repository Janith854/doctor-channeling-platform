import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const user = await login(data.email.trim(), data.password);
      toast.success(`Welcome back, ${user.firstName || 'User'}!`);
      const destination =
        location.state?.from?.pathname ||
        (user.role?.name === 'ROLE_ADMIN'
          ? '/admin'
          : user.role?.name === 'ROLE_DOCTOR'
          ? '/doctor'
          : '/patient');
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      let realMessage = 'Invalid email or password. Please try again.';
      if (err.response?.status === 502 || err.response?.status === 503) {
        realMessage = 'Identity service is temporarily unavailable (502 Bad Gateway). Please try again shortly.';
      } else if (err.response?.data?.message) {
        realMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        realMessage = err.response.data.error;
      } else if (typeof err.response?.data === 'string' && !err.response.data.includes('<html')) {
        realMessage = err.response.data.trim();
      } else if (err.code === 'ERR_NETWORK') {
        realMessage = 'Cannot connect to Identity Service. Please check if the service is running.';
      } else if (err.message && !err.message.includes('<html')) {
        realMessage = err.message;
      }
      setServerError(realMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-navy-100 shadow-xl shadow-navy-100/40">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs sm:text-sm text-navy-400 mt-1">
            Access your secure healthcare consultation portal
          </p>
        </div>

        {serverError && <ErrorMessage message={serverError} className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address format',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />

          <div className="flex items-center justify-between text-xs text-navy-500 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-navy-300"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="mt-2 gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </form>

        <div className="mt-7 pt-5 border-t border-navy-100 text-center">
          <p className="text-xs sm:text-sm text-navy-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
            >
              Create account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
