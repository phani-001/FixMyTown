import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/supabase/client';
import type { User } from '../App';

interface OTPLoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export function OTPLogin({ onLogin, onBack }: OTPLoginProps) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await api.sendOTP(mobile);
      setShowOTP(true);
      toast.success('OTP sent successfully to +91 ' + mobile);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOTP(mobile, otp);
      toast.success('Login successful!');
      onLogin(response.user);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <nav className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-[#1E90FF] transition-colors p-2 -ml-2 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1E90FF]">
              <span className="hidden md:inline">FixMyTown | </span>
              <span className="text-gray-600">Narsipatnam</span>
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </nav>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#1E90FF] rounded-full p-3">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl text-gray-900">
          Citizen Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-4">
          Enter your mobile number to receive OTP
        </p>
        {!showOTP && (
          <p className="mt-1 text-center text-xs text-blue-600 px-4">
            Demo OTP: <strong>123456</strong>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {!showOTP ? 'Enter Mobile Number' : 'Verify OTP'}
            </CardTitle>
            <CardDescription>
              {!showOTP 
                ? 'We\'ll send you a verification code' 
                : `Enter the 6-digit code sent to +91 ${mobile}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showOTP ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">+91</span>
                    </div>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="pl-12"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSendOTP}
                  disabled={loading || mobile.length !== 10}
                  className="w-full bg-[#1E90FF] hover:bg-[#1873CC] h-12 text-base"
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowOTP(false)}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    Change Number
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 bg-[#1E90FF] hover:bg-[#1873CC] h-12 text-base"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
                <div className="text-center">
                  <button
                    onClick={handleSendOTP}
                    className="text-sm text-[#1E90FF] hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}