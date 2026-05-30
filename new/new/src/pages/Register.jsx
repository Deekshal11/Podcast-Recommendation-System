import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/Context';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic } from 'lucide-react';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().required('Please select a role')
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, isSubmitting } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">
        
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 p-16 text-white relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl"></div>
          
          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">PodcastHub</span>
            </div>
            
            {/* Welcome Text */}
            <div className="mt-32">
              <h1 className="text-5xl font-bold mb-6">Join Us Today</h1>
              <p className="text-xl text-blue-200">Create your account and start your podcast experience</p>
            </div>
            
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 bg-white p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-10">Create Account</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  {...register('name')}
                  type="text"
                  className={`w-full px-4 py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                    errors.name 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full px-4 py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="Create password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  {...register('role')}
                  className={`w-full px-4 py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                    errors.role 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="LISTENER">Listener</option>
                  <option value="CREATOR">Creator</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
