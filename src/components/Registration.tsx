// Registration form with Stripe checkout integration - Enhanced with comprehensive logging
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Shield, Clock, Loader2, CheckCircle } from 'lucide-react';
import { stripeProducts } from '../stripe-config';

interface RegistrationProps {
  onComplete: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  experience: string;
}

export const Registration: React.FC<RegistrationProps> = ({ 
  onComplete, 
  onBack, 
  isDarkMode, 
  toggleDarkMode 
}) => {
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    experience: 'beginner'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Get the masterclass product
  const masterclassProduct = stripeProducts[0];

  // Environment variables debugging
  useEffect(() => {
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log('Environment mode:', import.meta.env.MODE);
    console.log('All env vars:', import.meta.env);
    
    // Test if we can construct the API URL
    const testApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
    console.log('Constructed API URL:', testApiUrl);
    
    // Check if URL looks valid
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.error('❌ VITE_SUPABASE_URL is missing!');
      setMessage({ type: 'error', text: 'Configuration error: Missing Supabase URL. Please check environment variables.' });
    } else if (!import.meta.env.VITE_SUPABASE_URL.startsWith('https://')) {
      console.error('❌ VITE_SUPABASE_URL does not look like a valid URL!');
      setMessage({ type: 'error', text: 'Configuration error: Invalid Supabase URL format.' });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const createCheckoutSession = async (userInfo: UserInfo) => {
    try {
      console.log('=== CHECKOUT SESSION CREATION START ===');
      console.log('Current window.location.origin:', window.location.origin);
      console.log('Supabase URL from env:', import.meta.env.VITE_SUPABASE_URL);
      
      const requestData = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
        company: userInfo.company,
        experience: userInfo.experience,
        priceId: masterclassProduct.priceId,
        successUrl: `${window.location.origin}?success=true`,
        cancelUrl: `${window.location.origin}?canceled=true`,
      };
      
      console.log('Request payload:', {
        ...requestData,
        email: '[REDACTED]' // Don't log actual email
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      console.log('Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));
      console.log('- URL:', response.url);
      console.log('- Type:', response.type);
      console.log('- Redirected:', response.redirected);

      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        if (responseText) {
          result = JSON.parse(responseText);
          console.log('Parsed response data:', result);
        } else {
          console.error('Empty response body received');
          throw new Error('Empty response from server');
        }
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        const errorMessage = result?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Checkout session creation failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!result.url) {
        console.error('No checkout URL in response. Full result:', result);
        throw new Error('No checkout URL received from server');
      }

      console.log('Checkout session created successfully:');
      console.log('- Session ID:', result.sessionId);
      console.log('- Checkout URL:', result.url);
      console.log('- URL domain:', new URL(result.url).hostname);
      console.log('=== CHECKOUT SESSION CREATION SUCCESS ===');

      return result;
    } catch (error: any) {
      console.error('=== CHECKOUT SESSION CREATION FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error detected - likely connectivity issue');
        throw new Error('Unable to connect to payment service. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('500')) {
        console.error('Server error detected');
        throw new Error('Payment service is temporarily unavailable. Please try again in a few minutes.');
      }
      
      if (error.message.includes('400')) {
        console.error('Bad request error detected');
        throw new Error('Invalid registration data. Please check your information and try again.');
      }
      
      throw new Error(error.message || 'Failed to create checkout session');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form data:', {
      ...formData,
      email: formData.email ? '[REDACTED]' : 'empty'
    });
    
    setIsProcessing(true);
    setMessage(null);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      console.error('Validation failed - missing required fields');
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsProcessing(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error('Validation failed - invalid email format');
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setIsProcessing(false);
      return;
    }

    console.log('Form validation passed, starting checkout process...');

    try {
      // Create checkout session and redirect to Stripe
      const { url } = await createCheckoutSession(formData);
      
      if (url) {
        console.log('=== REDIRECT TO STRIPE START ===');
        console.log('Redirecting to URL:', url);
        console.log('Current location before redirect:', window.location.href);
        console.log('User agent:', navigator.userAgent);
        console.log('Redirect method: window.location.href assignment');
        
        // Add a small delay to ensure logging is captured
        setTimeout(() => {
          console.log('Executing redirect now...');
          window.location.href = url;
        }, 100);
      } else {
        console.error('No URL received from checkout session creation');
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('=== CHECKOUT PROCESS FAILED ===');
      console.error('Final error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to start checkout process. Please try again.' 
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-primary-500/20 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-inter">Back to Masterclass</span>
            </button>
            
            <h1 className="font-orbitron font-bold text-xl tracking-wider">
              REGISTRATION
            </h1>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Course Summary */}
          <div className="space-y-8">
            <div>
              <h2 className="font-orbitron font-bold text-2xl mb-6 text-electric-400">
                COURSE OVERVIEW
              </h2>
              
              <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
                <h3 className="font-orbitron font-bold text-xl mb-4">
                  {masterclassProduct.name}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {masterclassProduct.description}
                </p>
                
                <div className="space-y-3 text-gray-300 mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-electric-400" />
                    <span>July 24, 2025 • 3:00 PM - 6:00 PM EST</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-electric-400" />
                    <span>Lifetime access to recordings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-electric-400" />
                    <span>Bonus materials and templates included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-electric-400" />
                    <span>Live Q&A session with instructor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-electric-400" />
                    <span>Private community access</span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span className="text-electric-400">{formatPrice(masterclassProduct.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
              <h4 className="font-orbitron font-bold text-lg mb-4 text-electric-400">
                SECURE REGISTRATION
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-400" />
                  <span>Powered by Stripe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>No spam - we respect your privacy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <h2 className="font-orbitron font-bold text-2xl mb-6 text-electric-400">
              REGISTRATION DETAILS
            </h2>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                message.type === 'error' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                  : 'bg-green-500/10 border-green-500/20 text-green-300'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Automation Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-gray-600 rounded-lg focus:border-electric-400 focus:outline-none transition-colors duration-200"
                >
                  <option value="beginner">Complete Beginner</option>
                  <option value="some">Some Experience</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-electric-500 to-violet-500 rounded-xl font-orbitron font-bold text-lg tracking-wider hover:from-electric-400 hover:to-violet-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  'SECURE YOUR SPOT'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By registering, you agree to our Terms of Service and Privacy Policy. 
                You'll receive email confirmations and course materials. Secure payment processed by Stripe.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};