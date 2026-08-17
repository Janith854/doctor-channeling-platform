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
  const { login, getRolePath } = useAuth();
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
      const destination = location.state?.from?.pathname || (
        user.role?.name === 'ROLE_ADMIN' ? '/admin' :
        user.role?.name === 'ROLE_DOCTOR' ? '/doctor' : '/patient'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      const realMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' && err.response.data.trim()) ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to Identity Service at http://localhost:8081. Please check if the backend is running and CORS is enabled.'
          : err.message) ||
        'Invalid email or password. Please try again.';
      setServerError(realMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-3xl border border-navy-100 shadow-xl shadow-navy-100/50">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-navy-900">Sign In to Your Account</h2>
          <p className="text-sm text-navy-400 mt-1">Access your healthcare portal securely</p>
        </div>

        {serverError && <ErrorMessage message={serverError} className="mb-5" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
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
          </div>

          <div>
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
          </div>

          <div className="flex items-center justify-between text-xs text-navy-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-primary-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2 gap-2">
            <LogIn className="w-5 h-5" /> Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-navy-100 text-center">
          <p className="text-sm text-navy-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1">
              Create an account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
