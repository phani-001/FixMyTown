import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  LogOut, 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  Send,
  RefreshCw,
  Building2,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { OptimizedMapView } from './OptimizedMapView';
import { EnhancedIssueDetailsModal } from './EnhancedIssueDetailsModal';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { mockUsers } from './mockData';
import type { User, Complaint, ComplaintStatus, ComplaintPriority, Comment } from '../App';

interface EnhancedDepartmentDashboardProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const statusColors = {
  open: 'bg-blue-500',
  pending: 'bg-orange-500',
  in_progress: 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-700',
  escalated: 'bg-red-500',
  rejected: 'bg-gray-500'
};

const statusLabels = {
  open: 'Open',
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
  rejected: 'Rejected'
};

const priorityColors = {
  critical: 'bg-red-800 text-white animate-pulse',
  high: 'bg-red-600 text-white',
  medium: 'bg-orange-500 text-white',
  low: 'bg-blue-500 text-white'
};

export function EnhancedDepartmentDashboard({ user, onLogout, onNavigate }: EnhancedDepartmentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [fieldStaff, setFieldStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentComplaint, setCommentComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  const [progressUpdate, setProgressUpdate] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsResponse, staffResponse] = await Promise.all([
        api.getComplaints(),
        api.getStaffUsers()
      ]);

      // Filter complaints for department (in real app, this would be server-side)
      const departmentComplaints = complaintsResponse.complaints.filter(complaint => {
        // Map categories to departments based on user's department
        const categoryDepartmentMap: Record<string, string> = {
          'roads': 'Public Works',
          'water': 'Water Supply', 
          'electricity': 'Electrical',
          'garbage': 'Sanitation',
          'streetlight': 'Electrical',
          'other': 'Administration'
        };
        
        return user?.department && (
          complaint.assignedDepartment === user.department ||
          categoryDepartmentMap[complaint.category] === user.department
        );
      });

      setAllComplaints(departmentComplaints);
      setFieldStaff(staffResponse.users.filter(u => u.role === 'field_staff' && u.department === user?.department));

      // Calculate stats
      const calculatedStats = {
        total: departmentComplaints.length,
        open: departmentComplaints.filter(c => c.status === 'open').length,
        pending: departmentComplaints.filter(c => c.status === 'pending').length,
        inProgress: departmentComplaints.filter(c => c.status === 'in_progress').length,
        resolved: departmentComplaints.filter(c => c.status === 'resolved').length,
        closed: departmentComplaints.filter(c => c.status === 'closed').length,
        critical: departmentComplaints.filter(c => c.priority === 'critical').length,
        high: departmentComplaints.filter(c => c.priority === 'high').length,
        medium: departmentComplaints.filter(c => c.priority === 'medium').length,
        low: departmentComplaints.filter(c => c.priority === 'low').length,
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Filter complaints based on search and filters
  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    try {
      await api.assignComplaint(complaintId, staffId);
      const staff = fieldStaff.find(u => u.id === staffId);
      toast.success(`Issue #${complaintId} assigned to ${staff?.name}`);
      await fetchData();
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast.error('Failed to assign complaint');
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus, note?: string) => {
    try {
      await api.updateComplaint(complaintId, { status: newStatus, note });
      toast.success(`Issue #${complaintId} status updated to ${statusLabels[newStatus]}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handlePriorityChange = async (complaintId: string, newPriority: ComplaintPriority, note?: string) => {
    try {
      await api.updateComplaint(complaintId, { priority: newPriority, note });
      toast.success(`Issue #${complaintId} priority updated to ${newPriority}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating complaint priority:', error);
      toast.error('Failed to update complaint priority');
    }
  };

  const handleAddProgressUpdate = async () => {
    if (!commentComplaint || !progressUpdate.trim()) return;

    try {
      await api.addComment(commentComplaint.id, {
        content: progressUpdate,
        type: 'comment',
        userId: user?.id || '',
        userName: user?.name || ''
      });
      toast.success('Progress update added successfully');
      await fetchData();
      setShowCommentModal(false);
      setCommentComplaint(null);
      setProgressUpdate('');
    } catch (error) {
      console.error('Error adding progress update:', error);
      toast.error('Failed to add progress update');
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Chart data for trends
  const trendData = [
    { month: 'Jan', resolved: 12, new: 15 },
    { month: 'Feb', resolved: 18, new: 14 },
    { month: 'Mar', resolved: 22, new: 20 },
    { month: 'Apr', resolved: 16, new: 18 },
    { month: 'May', resolved: 25, new: 22 },
    { month: 'Jun', resolved: 20, new: 16 },
  ];

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
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Department Head Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchData}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-blue-50 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {user?.name} 
                </span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {user?.department}
                </span>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:border-red-300 border-gray-300 transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <BarChart3 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="issues" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Issues</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <MapPin className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Map View</span>
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <Users className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Team</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600 mt-1">All issues</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700">{stats.pending}</div>
                  <p className="text-xs text-orange-600 mt-1">Need attention</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-700">{stats.inProgress}</div>
                  <p className="text-xs text-yellow-600 mt-1">Being worked</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{stats.resolved}</div>
                  <p className="text-xs text-green-600 mt-1">Completed</p>
                </CardContent>
              </Card>

              {/* Priority Stats */}
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">{stats.critical}</div>
                  <p className="text-xs text-red-600 mt-1">Urgent</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    High
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.high}</div>
                  <p className="text-xs text-red-500 mt-1">Priority</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Medium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700">{stats.medium}</div>
                  <p className="text-xs text-orange-600 mt-1">Standard</p>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues Alert */}
            {stats.critical > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                    Critical Issues Requiring Immediate Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredComplaints
                      .filter(c => c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'closed')
                      .slice(0, 3)
                      .map((complaint) => (
                        <div key={complaint.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900">{complaint.title}</h4>
                            <p className="text-sm text-red-700">{complaint.location.address}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowDetailModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} name="Resolved" />
                    <Line type="monotone" dataKey="new" stroke="#EF4444" strokeWidth={3} name="New Issues" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Management Tab */}
          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Issue Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComplaintStatus | 'all')}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ComplaintPriority | 'all')}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Issues Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium">#{complaint.id}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{complaint.title}</p>
                              <p className="text-sm text-gray-500 truncate">{complaint.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {complaint.location.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[complaint.priority]}>
                              {complaint.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" 
                                   className={`${statusColors[complaint.status]} text-white`}>
                              {statusLabels[complaint.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {complaint.assignedTo ? (
                              <span className="text-sm">
                                {mockUsers.find(u => u.id === complaint.assignedTo)?.name || 'Unknown'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(complaint.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setShowDetailModal(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>

                              {/* Priority Controls */}
                              <Select onValueChange={(value) => handlePriorityChange(complaint.id, value as ComplaintPriority)}>
                                <SelectTrigger className="h-8 w-8 p-0 hover:bg-purple-50">
                                  {complaint.priority === 'critical' ? <AlertTriangle className="h-3 w-3 text-red-800" /> :
                                   complaint.priority === 'high' ? <ArrowUp className="h-3 w-3 text-red-600" /> :
                                   complaint.priority === 'medium' ? <Minus className="h-3 w-3 text-orange-500" /> :
                                   <ArrowDown className="h-3 w-3 text-blue-500" />}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="critical">Critical Priority</SelectItem>
                                  <SelectItem value="high">High Priority</SelectItem>
                                  <SelectItem value="medium">Medium Priority</SelectItem>
                                  <SelectItem value="low">Low Priority</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Assign Staff */}
                              <Select onValueChange={(value) => handleAssignStaff(complaint.id, value)}>
                                <SelectTrigger className="h-8 w-8 p-0 hover:bg-green-50">
                                  <UserPlus className="h-3 w-3" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldStaff.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                      {staff.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Status Change */}
                              <Select onValueChange={(value) => handleStatusChange(complaint.id, value as ComplaintStatus)}>
                                <SelectTrigger className="h-8 w-8 p-0 hover:bg-yellow-50">
                                  <Edit className="h-3 w-3" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Mark Pending</SelectItem>
                                  <SelectItem value="in_progress">Mark In Progress</SelectItem>
                                  <SelectItem value="resolved">Mark Resolved</SelectItem>
                                  <SelectItem value="escalated">Escalate</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Add Progress Update */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCommentComplaint(complaint);
                                  setShowCommentModal(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <OptimizedMapView 
              complaints={filteredComplaints}
              onComplaintSelect={(complaint) => {
                setSelectedComplaint(complaint);
                setShowDetailModal(true);
              }}
              selectedComplaint={selectedComplaint}
              currentUser={user}
              showDepartmentFilter={false}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fieldStaff.map((staff) => {
                    const assignedCount = allComplaints.filter(c => c.assignedTo === staff.id).length;
                    const resolvedCount = allComplaints.filter(c => c.assignedTo === staff.id && c.status === 'resolved').length;
                    
                    return (
                      <Card key={staff.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{staff.name}</h3>
                              <p className="text-sm text-gray-500">{staff.department}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Assigned:</span>
                              <span className="font-medium">{assignedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Resolved:</span>
                              <span className="font-medium text-green-600">{resolvedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Success Rate:</span>
                              <span className="font-medium">
                                {assignedCount > 0 ? Math.round((resolvedCount / assignedCount) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Progress Update Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
            <DialogDescription>
              Issue: {commentComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Progress Update</label>
              <Textarea
                value={progressUpdate}
                onChange={(e) => setProgressUpdate(e.target.value)}
                placeholder="Describe the progress made, next steps, or any challenges..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProgressUpdate}>
                <Send className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Issue Details Modal */}
      {selectedComplaint && (
        <EnhancedIssueDetailsModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          complaint={selectedComplaint}
          currentUser={user}
          onStatusUpdate={handleStatusChange}
          onPriorityUpdate={handlePriorityChange}
          onAssignToDepartment={() => {}} // Department heads can't reassign departments
          isAdmin={false}
          isDepartmentHead={true}
        />
      )}
    </div>
  );
}