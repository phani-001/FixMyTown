import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, MapPin, Calendar, User, LogOut, MessageSquare, Eye, RefreshCw, Bell, TrendingUp, AlertCircle, CheckCircle, Trash2, Edit, RotateCcw, Users, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner';
import type { User, Complaint } from '../App';

interface CitizenDashboardProps {
  user: User | null;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const statusColors = {
  pending: 'bg-red-500',
  in_progress: 'bg-yellow-500', 
  resolved: 'bg-green-500',
  escalated: 'bg-orange-500',
  rejected: 'bg-gray-500'
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved', 
  escalated: 'Escalated',
  rejected: 'Rejected'
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export function CitizenDashboard({ user, onNavigate, onLogout }: CitizenDashboardProps) {
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [activeTab, setActiveTab] = useState('my-complaints');

  const fetchUserComplaints = async () => {
    if (!user?.id) return;
    
    try {
      const [userResponse, allResponse] = await Promise.all([
        api.getComplaints({ citizenId: user.id }),
        api.getComplaints()
      ]);
      
      const userCompData = userResponse.complaints || [];
      const allCompData = allResponse.complaints || [];
      
      setUserComplaints(userCompData);
      setAllComplaints(allCompData);
      
      // Calculate user stats
      const userStats = {
        total: userCompData.length,
        pending: userCompData.filter(c => c.status === 'pending').length,
        inProgress: userCompData.filter(c => c.status === 'in_progress').length,
        resolved: userCompData.filter(c => c.status === 'resolved').length
      };
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserComplaints();
  }, [user?.id]);

  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchUserComplaints();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    try {
      await api.deleteComplaint(complaintId);
      toast.success('Complaint deleted successfully');
      await fetchUserComplaints(); // Refresh the data
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const handleVerifyFix = async (complaintId: string) => {
    try {
      await api.updateComplaint(complaintId, { 
        status: 'resolved',
        note: 'Fix verified by citizen'
      });
      toast.success('Fix verified successfully');
      await fetchUserComplaints();
    } catch (error) {
      console.error('Error verifying fix:', error);
      toast.error('Failed to verify fix');
    }
  };

  const handleReopenIssue = async (complaintId: string) => {
    try {
      await api.updateComplaint(complaintId, { 
        status: 'pending',
        note: 'Issue reopened by citizen'
      });
      toast.success('Issue reopened successfully');
      await fetchUserComplaints();
    } catch (error) {
      console.error('Error reopening issue:', error);
      toast.error('Failed to reopen issue');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const renderComplaintCard = (complaint: Complaint, isUserComplaint: boolean) => (
    <Card key={complaint.id} className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${isUserComplaint ? 'border-l-blue-500' : 'border-l-green-500'} bg-white overflow-hidden`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
              {complaint.title}
            </CardTitle>
            <div className="flex items-center flex-wrap gap-2">
              <Badge 
                className={`${statusColors[complaint.status]} text-white font-medium px-3 py-1`}
              >
                {complaint.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                {complaint.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                {statusLabels[complaint.status]}
              </Badge>
              <Badge variant="outline" className={`${priorityColors[complaint.priority]} font-medium px-3 py-1`}>
                {complaint.priority.toUpperCase()} PRIORITY
              </Badge>
              {!isUserComplaint && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Community Issue
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {complaint.images && complaint.images.length > 0 && (
          <div className="mb-4 relative overflow-hidden rounded-lg">
            <ImageWithFallback
              src={complaint.images[0]}
              alt="Complaint image"
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {complaint.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{complaint.images.length - 1} more
              </div>
            )}
          </div>
        )}
        
        <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">
          {complaint.description}
        </p>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span className="truncate font-medium">{complaint.location.address}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span>Submitted on {formatDate(complaint.submittedAt)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-bold text-sm">
              ID: #{complaint.id}
            </span>
          </div>
        </div>

        {/* Action Buttons - Only show for user's own complaints */}
        {isUserComplaint && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {complaint.status === 'resolved' && (
                  <Button 
                    onClick={() => handleVerifyFix(complaint.id)}
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-8 px-3 text-green-600 border-green-300 hover:bg-green-50 hover:scale-105 transition-all"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verify Fix
                  </Button>
                )}
                {complaint.status === 'resolved' && (
                  <Button 
                    onClick={() => handleReopenIssue(complaint.id)}
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-8 px-3 text-orange-600 border-orange-300 hover:bg-orange-50 hover:scale-105 transition-all"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reopen Issue
                  </Button>
                )}
                {complaint.status === 'in_progress' && (
                  <div className="flex items-center text-xs text-orange-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    In Progress
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(complaint.updatedAt)}
                </span>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-8 px-3 text-red-600 border-red-300 hover:bg-red-50 hover:scale-105 transition-all"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this complaint? This action cannot be undone.
                        The complaint will be removed from your dashboard, tracking board, and map.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteComplaint(complaint.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Complaint
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-blue-600">
                FixMyTown
              </h1>
              <span className="hidden sm:inline text-gray-600 text-sm">Citizen Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={refreshData}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {user?.name || 'Citizen'}
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name || 'Citizen'}! 👋
                </h2>
                <p className="text-lg text-gray-600">
                  Track your reported issues and help make Narsipatnam better.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-500">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-sm text-gray-500">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Issues</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">{stats.inProgress}</div>
              <div className="text-sm text-orange-600">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
              <div className="text-sm text-green-600">Resolved</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105" 
                onClick={() => onNavigate('report-problem')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Report New Issue</h3>
              <p className="text-gray-600">Submit a new civic problem in your area</p>
              <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-700">
                Get Started →
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-400 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105"
                onClick={() => onNavigate('tracking-board')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track All Issues</h3>
              <p className="text-gray-600">View all reported issues in Narsipatnam</p>
              <div className="mt-4 text-green-600 font-medium group-hover:text-green-700">
                View Map →
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Complaints</h3>
              <p className="text-gray-600">
                {stats.total} total complaint{stats.total !== 1 ? 's' : ''} submitted
              </p>
              <div className="mt-4 text-purple-600 font-medium group-hover:text-purple-700">
                View Details →
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Section with Tabs */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="my-complaints" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Complaints
                </TabsTrigger>
                <TabsTrigger value="all-complaints" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  All Complaints
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="sm:hidden hover:bg-blue-50 hover:text-blue-600"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => onNavigate('tracking-board')}
                  className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </div>
            </div>

            <TabsContent value="my-complaints" className="space-y-6">
              {userComplaints.length === 0 ? (
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                  <CardContent className="p-12 text-center">
                    <div className="bg-gray-200 rounded-full p-6 w-fit mx-auto mb-6">
                      <MessageSquare className="h-16 w-16 text-gray-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">No complaints yet</h4>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      You haven't reported any issues yet. Help improve your community by reporting civic problems.
                    </p>
                    <Button
                      onClick={() => onNavigate('report-problem')}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 hover:scale-105 transition-all"
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      Report Your First Issue
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {userComplaints.map((complaint) => renderComplaintCard(complaint, true))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all-complaints" className="space-y-6">
              {allComplaints.length === 0 ? (
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <div className="bg-gray-200 rounded-full p-6 w-fit mx-auto mb-6">
                      <Globe className="h-16 w-16 text-gray-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">No complaints found</h4>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      There are currently no complaints in the system.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allComplaints.map((complaint) => renderComplaintCard(complaint, complaint.citizenId === user?.id))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          onClick={() => onNavigate('report-problem')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl rounded-full w-16 h-16 group hover:scale-110 transition-all"
        >
          <Plus className="h-7 w-7 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Add some bottom padding for mobile FAB */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}