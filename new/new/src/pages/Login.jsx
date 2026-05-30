import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/Context';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { register, handleSubmit, formState: { errors }, isSubmitting } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">
        
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-16 text-white relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl"></div>
          
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
              <h1 className="text-5xl font-bold mb-6">Welcome Back</h1>
              <p className="text-xl text-purple-200">Sign in to continue your podcast journey</p>
            </div>
            
            {/* Footer URL */}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 bg-white p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-10">Sign In</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-purple-600'
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
                      : 'border-gray-300 focus:border-purple-600'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting || loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CONTINUE</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
              >
                Create New Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
