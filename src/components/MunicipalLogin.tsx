import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/supabase/client';
import type { User } from '../App';

interface MunicipalLoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export function MunicipalLogin({ onLogin, onBack }: MunicipalLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await api.authenticateStaff(username, password);
      toast.success(`Welcome, ${response.user.name}!`);
      onLogin(response.user);
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Invalid credentials. Please try again.');
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
              className="flex items-center text-gray-600 hover:text-[#1E90FF] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-[#1E90FF]">
              FixMyTown <span className="text-gray-600">| Narsipatnam Municipality</span>
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#1E90FF] rounded-full p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl text-gray-900">
          Municipal Staff Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the municipal dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Staff Authentication</CardTitle>
            <CardDescription>
              Please enter your municipal credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading || !username.trim() || !password.trim()}
                className="w-full bg-[#1E90FF] hover:bg-[#1873CC]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            {/* Demo Credentials */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials:</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Super Admin:</span>
                  <span>admin / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span>Department Head:</span>
                  <span>depthead / dept123</span>
                </div>
                <div className="flex justify-between">
                  <span>Field Staff:</span>
                  <span>fieldstaff / field123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}