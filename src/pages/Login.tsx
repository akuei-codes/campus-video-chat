import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/supabase';
import { User } from '@/types';

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-ivy">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col md:flex-row">
        <div className="flex-1 p-6 md:p-10 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-ivy mb-6">Welcome to the Ivy League Network</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with fellow students through video conversations. Share ideas, make friends, and network across prestigious institutions.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Exclusive to Ivy League students</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Meaningful 1-on-1 video conversations</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Build your academic and professional network</span>
              </li>
            </ul>
            <p className="text-sm text-gray-500">
              Sign in with your university email to get started.
            </p>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 p-6 md:p-10 lg:p-16 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800">
              <path fill="#2C5E1A" fillOpacity="0.05" d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63"></path>
              <path fill="#2C5E1A" fillOpacity="0.05" d="M-31 229L237 261 390 382 731 737M-31 229L237 261 390 382 731 737M-31 229L237 261 390 382 731 737"></path>
              <path fill="#2C5E1A" fillOpacity="0.05" d="M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880"></path>
              <path fill="#2C5E1A" fillOpacity="0.05" d="M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382"></path>
              <path fill="#2C5E1A" fillOpacity="0.05" d="M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-31 229 126.5 79.5"></path>
            </svg>
          </div>
          <div className="z-10 w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
