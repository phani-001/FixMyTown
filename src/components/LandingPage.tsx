import React from 'react';
import { Button } from './ui/button';
import { MapPin, MessageSquare, Smartphone } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onNavigate: (screen: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-[#1E90FF]">
                  FixMyTown <span className="text-gray-600">| Narsipatnam Municipality</span>
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <button
                onClick={() => onNavigate('municipal-login')}
                className="text-sm text-gray-600 hover:text-[#1E90FF] transition-colors"
              >
                Municipal Staff Login →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h2 className="text-4xl tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">FixMyTown –</span>{' '}
                  <span className="block text-[#1E90FF] xl:inline">Report, Track & Solve</span>
                  <span className="block xl:inline">Civic Issues in Narsipatnam</span>
                </h2>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Help make your city better by reporting civic issues directly to the municipality.
                  Track progress in real-time and get your problems solved faster.
                </p>
                
                {/* Action Buttons */}
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button
                      onClick={() => onNavigate('citizen-login')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base rounded-md text-white bg-[#1E90FF] hover:bg-[#1873CC] md:py-4 md:text-lg md:px-10 transition-all duration-200 hover:scale-105"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Report a Problem
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      onClick={() => onNavigate('tracking-board')}
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 border border-[#1E90FF] text-base rounded-md text-[#1E90FF] bg-white hover:bg-[#1E90FF] hover:text-white md:py-4 md:text-lg md:px-10 transition-all duration-200 hover:scale-105"
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Track Problems
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-10 sm:mt-12">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Smartphone className="h-6 w-6 text-[#1E90FF]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Easy mobile reporting</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-[#1E90FF]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">GPS location tracking</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-[#1E90FF]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">Real-time updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 sm:h-72 md:h-96 lg:h-full w-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <img
              src="/images/municipal-logo.png"
              alt="Commissioner and Director of Municipal Administration Logo"
              className="max-w-xl max-h-xl sm:max-w-2xl sm:max-h-2xl lg:max-w-3xl lg:max-h-3xl object-contain opacity-90 drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Mobile Municipal Staff Login */}
      <div className="md:hidden fixed bottom-4 right-4">
        <Button
          onClick={() => onNavigate('municipal-login')}
          variant="outline"
          className="shadow-lg bg-white border-[#1E90FF] text-[#1E90FF] hover:bg-[#1E90FF] hover:text-white"
        >
          Staff Login
        </Button>
      </div>
    </div>
  );
}