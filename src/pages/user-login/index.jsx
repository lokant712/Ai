import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import AlternativeActions from './components/AlternativeActions';

const UserLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt to play video (workaround for autoplay policies)
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const userData = JSON.parse(userSession);
      setUser(userData);
      
      // Redirect to appropriate dashboard
      const roleRoutes = {
        donor: '/donor-dashboard',
        hospital: '/hospital-dashboard',
        admin: '/hospital-dashboard'
      };
      navigate(roleRoutes?.[userData?.role] || '/donor-dashboard');
    }
  }, [navigate]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <>
      <Helmet>
        <title>Sign In - BloodLink | Connect to Save Lives</title>
        <meta name="description" content="Sign in to BloodLink - Connect with blood donors and hospitals for life-saving donations." />
      </Helmet>
      
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/assets/BACKGROUND.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg">
                <Icon name="Droplets" size={32} color="white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                BloodLink
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">
              Welcome Back
            </h2>
            <p className="text-gray-200 drop-shadow-md">
              Sign in to continue saving lives
            </p>
          </div>

          {/* Login Card - Glass Morphism */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <LoginForm onLogin={handleLogin} />
            
            <div className="mt-6">
              <AlternativeActions />
            </div>

            {/* Info Note - Glass Morphism */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/20 backdrop-blur-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={16} className="text-blue-300" />
                <p className="text-sm text-white">
                  Use your registered email and password to sign in. 
                  <Link to="/user-registration" className="text-blue-300 underline ml-1 hover:text-blue-200 transition-colors">
                    Create an account
                  </Link> if you don't have one.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-300 drop-shadow-md">
              © {new Date().getFullYear()} BloodLink. Connecting lives through blood donation.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserLogin;