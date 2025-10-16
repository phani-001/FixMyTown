import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { OTPLogin } from './components/OTPLogin';
import { ReportProblem } from './components/ReportProblem';
import { CitizenDashboard } from './components/CitizenDashboard';
import { TrackingBoard } from './components/TrackingBoard';
import { MunicipalLogin } from './components/MunicipalLogin';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { DepartmentHeadDashboard } from './components/DepartmentHeadDashboard';
import { FieldStaffDashboard } from './components/FieldStaffDashboard';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'citizen' | 'super_admin' | 'department_head' | 'field_staff';
export type ComplaintStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed' | 'escalated' | 'rejected';
export type ComplaintCategory = 'roads' | 'water' | 'electricity' | 'garbage' | 'streetlight' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high';



export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  citizenId: string;
  assignedTo?: string;
  submittedAt: Date;
  updatedAt: Date;
  timeline: {
    status: ComplaintStatus;
    timestamp: Date;
    note?: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  department?: string;
}

type Screen = 
  | 'landing'
  | 'otp-login' 
  | 'citizen-login'
  | 'report-problem'
  | 'citizen-dashboard'
  | 'tracking-board'
  | 'municipal-login'
  | 'super-admin'
  | 'department-head'
  | 'field-staff';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(['landing']);

  const navigateTo = (screen: Screen) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else {
      // Fallback navigation based on user role
      if (currentUser) {
        switch (currentUser.role) {
          case 'citizen':
            setCurrentScreen('citizen-dashboard');
            break;
          case 'super_admin':
            setCurrentScreen('super-admin');
            break;
          case 'department_head':
            setCurrentScreen('department-head');
            break;
          case 'field_staff':
            setCurrentScreen('field-staff');
            break;
          default:
            setCurrentScreen('landing');
        }
      } else {
        setCurrentScreen('landing');
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Navigate based on user role
    switch (user.role) {
      case 'citizen':
        navigateTo('citizen-dashboard');
        break;
      case 'super_admin':
        navigateTo('super-admin');
        break;
      case 'department_head':
        navigateTo('department-head');
        break;
      case 'field_staff':
        navigateTo('field-staff');
        break;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNavigationHistory(['landing']);
    setCurrentScreen('landing');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={navigateTo} />;
      case 'otp-login':
      case 'citizen-login':
        return <OTPLogin onLogin={handleLogin} onBack={goBack} />;
      case 'report-problem':
        return <ReportProblem onBack={goBack} onNavigate={navigateTo} user={currentUser} />;
      case 'citizen-dashboard':
        return <CitizenDashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} />;
      case 'tracking-board':
        return <TrackingBoard onBack={goBack} currentUser={currentUser} />;
      case 'municipal-login':
        return <MunicipalLogin onLogin={handleLogin} onBack={goBack} />;
      case 'super-admin':
        return <SuperAdminDashboard user={currentUser} onLogout={handleLogout} onNavigate={navigateTo} />;
      case 'department-head':
        return <DepartmentHeadDashboard user={currentUser} onLogout={handleLogout} onNavigate={navigateTo} />;
      case 'field-staff':
        return <FieldStaffDashboard user={currentUser} onLogout={handleLogout} onNavigate={navigateTo} />;
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentScreen()}
      <Toaster />
    </div>
  );
}