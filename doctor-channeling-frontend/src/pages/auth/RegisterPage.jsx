import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone ? data.phone.trim() : '',
      };

      await registerUser(payload);
      toast.success('Registration successful! Please sign in to continue.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error details:', err);
      const realMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' && err.response.data.trim()) ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to Identity Service. Please verify service availability.'
          : err.message) ||
        'Registration failed. Please check your details and try again.';

      setServerError(realMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-navy-100 shadow-xl shadow-navy-100/40">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Create New Account</h2>
          <p className="text-xs sm:text-sm text-navy-400 mt-1">
            Join MediChannel to book appointments and consult specialists
          </p>
        </div>

        {serverError && <ErrorMessage message={serverError} className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              type="text"
              icon={User}
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />

            <Input
              label="Last Name"
              type="text"
              icon={User}
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
          </div>

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
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="+94 77 123 4567"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[+]?[0-9\s-]{9,15}$/,
                message: 'Invalid phone number',
              },
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="mt-2 gap-2"
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </Button>
        </form>

        <div className="mt-7 pt-5 border-t border-navy-100 text-center">
          <p className="text-xs sm:text-sm text-navy-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
