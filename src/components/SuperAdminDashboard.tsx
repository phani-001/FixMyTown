import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Users, 
  LogOut, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Trash2,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api } from '../utils/supabase/client';
import { MapView } from './MapView';
import { IssueDetailsModal } from './IssueDetailsModal';
import { toast } from 'sonner';
import type { User, Complaint, ComplaintStatus, ComplaintCategory } from '../App';

interface SuperAdminDashboardProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export function SuperAdminDashboard({ user, onLogout, onNavigate }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0, rejected: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, categoryResponse, trendsResponse, complaintsResponse] = await Promise.all([
        api.getStats(),
        api.getCategoryStats(),
        api.getTrendData(),
        api.getComplaints()
      ]);

      setStats(statsResponse.stats);
      setCategoryData(categoryResponse.categories);
      setTrendData(trendsResponse.trends);
      setComplaints(complaintsResponse.complaints);
      setFilteredComplaints(complaintsResponse.complaints);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter complaints based on search and filters
  useEffect(() => {
    let filtered = complaints;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const handleComplaintSelect = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    try {
      await api.deleteComplaint(complaintId);
      toast.success('Complaint deleted successfully');
      await fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus, note?: string) => {
    try {
      await api.updateComplaint(complaintId, { status: newStatus, note });
      toast.success(`Complaint status updated to ${newStatus.replace('_', ' ')}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const refreshData = async () => {
    await fetchData();
    toast.success('Data refreshed successfully');
  };

  const avgResolutionTime = 3.5; // days
  const resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : '0';

  // Color scheme for charts
  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

  const getStatusBadgeColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'escalated': return 'bg-red-500 text-white';
      case 'rejected': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityBadgeColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-blue-600">
                FixMyTown
              </h1>
              <span className="hidden sm:inline text-gray-600 text-sm">Super Admin Dashboard</span>
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
                <span className="text-sm text-gray-600 hidden md:block">
                  Welcome, {user?.name}
                </span>
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

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <LayoutDashboard className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <MapPin className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Map View</span>
              </TabsTrigger>
              <TabsTrigger 
                value="complaints" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Issues</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <BarChart3 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <Users className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Staff</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Issues</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600 mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    All time count
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Pending</CardTitle>
                  <Clock className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">{stats.pending}</div>
                  <p className="text-xs text-red-600 mt-1">
                    Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">In Progress</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-700">{stats.inProgress}</div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Being worked on
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{stats.resolved}</div>
                  <p className="text-xs text-green-600 mt-1">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Resolution Rate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">{resolutionRate}%</div>
                  <p className="text-xs text-purple-600 mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Overall performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart - Complaints by Category */}
              <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Issues by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="category" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart - Status Distribution */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: stats.pending, color: '#EF4444' },
                          { name: 'In Progress', value: stats.inProgress, color: '#F59E0B' },
                          { name: 'Resolved', value: stats.resolved, color: '#10B981' },
                          { name: 'Escalated', value: stats.escalated, color: '#8B5CF6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        fontSize={12}
                      >
                        {[
                          { name: 'Pending', value: stats.pending, color: '#EF4444' },
                          { name: 'In Progress', value: stats.inProgress, color: '#F59E0B' },
                          { name: 'Resolved', value: stats.resolved, color: '#10B981' },
                          { name: 'Escalated', value: stats.escalated, color: '#8B5CF6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Line Chart - Resolution Trend */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Resolution Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="complaints" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      name="New Issues" 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Resolved" 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <MapView 
              complaints={complaints}
              onComplaintSelect={handleComplaintSelect}
              selectedComplaint={selectedComplaint}
              showDepartmentFilter={true}
            />
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-900">All Issues ({filteredComplaints.length})</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onNavigate('tracking-board')}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Public Board
                  </Button>
                  <Button
                    onClick={refreshData}
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                    className="hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="roads">Roads</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="streetlight">Street Light</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="w-full hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Issues List */}
            <div className="grid gap-4">
              {filteredComplaints.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg text-gray-600 mb-2">No issues found</h3>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredComplaints.map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer" 
                          onClick={() => handleComplaintSelect(complaint)}
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">#{complaint.id}</Badge>
                            <Badge className={getStatusBadgeColor(complaint.status)}>
                              {complaint.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(complaint.priority)}>
                              {complaint.priority} priority
                            </Badge>
                            <Badge variant="secondary">{complaint.category}</Badge>
                          </div>
                          <h4 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">{complaint.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {complaint.location.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(complaint.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplaintSelect(complaint);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>

                          {/* Quick Status Actions */}
                          {complaint.status === 'pending' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(complaint.id, 'in_progress', 'Started working on the issue');
                              }}
                              size="sm"
                              variant="outline"
                              className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 transition-all"
                            >
                              Start Work
                            </Button>
                          )}

                          {complaint.status === 'in_progress' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(complaint.id, 'resolved', 'Issue has been resolved');
                              }}
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all"
                            >
                              Resolve
                            </Button>
                          )}

                          {/* Delete Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 hover:scale-105 transition-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This issue will be permanently removed from the system, dashboards, and maps. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteComplaint(complaint.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-900">Analytics & Reports</h3>
              <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-blue-800">Average Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{avgResolutionTime} days</div>
                  <p className="text-xs text-blue-600 mt-1">Across all categories</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-green-800">Citizen Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">87%</div>
                  <p className="text-xs text-green-600 mt-1">Based on feedback</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-orange-800">Escalation Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700">12%</div>
                  <p className="text-xs text-orange-600 mt-1">Issues escalated</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-purple-800">Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">+18%</div>
                  <p className="text-xs text-purple-600 mt-1">Issues reported</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Staff Management</h3>
              <p className="text-gray-600 mb-6">
                Manage municipal staff, departments, and assign responsibilities
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                View Staff Directory
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Issue Details Modal */}
      {selectedComplaint && (
        <IssueDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          complaint={selectedComplaint}
          currentUser={user}
        />
      )}
    </div>
  );
}