import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Users, 
  LogOut, 
  TrendingUp,
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
  Edit,
  UserPlus,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Building2,
  Send,
  History,
  Tag,
  User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api } from '../utils/supabase/client';
import { OptimizedMapView } from './OptimizedMapView';
import { EnhancedIssueDetailsModal } from './EnhancedIssueDetailsModal';
import { toast } from 'sonner@2.0.3';
import type { User, Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority, Department, Comment } from '../App';

interface EnhancedAdminDashboardProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

// Mock departments data
const mockDepartments: Department[] = [
  { id: 'dept_001', name: 'Public Works', head: 'dept_head_001', staff: ['field_staff_001', 'field_staff_002'] },
  { id: 'dept_002', name: 'Water Supply', head: 'dept_head_002', staff: ['field_staff_003'] },
  { id: 'dept_003', name: 'Electrical', head: 'dept_head_003', staff: ['field_staff_004', 'field_staff_005'] },
  { id: 'dept_004', name: 'Sanitation', head: 'dept_head_004', staff: ['field_staff_006'] },
  { id: 'dept_005', name: 'Administration', head: 'super_admin_001', staff: [] },
];

export function EnhancedAdminDashboard({ user, onLogout, onNavigate }: EnhancedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ 
    total: 0, open: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0, escalated: 0, rejected: 0,
    critical: 0, high: 0, medium: 0, low: 0
  });
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
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  // Assignment modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentComplaint, setAssignmentComplaint] = useState<Complaint | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');

  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentComplaint, setCommentComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, categoryResponse, trendsResponse, complaintsResponse] = await Promise.all([
        api.getStats(),
        api.getCategoryStats(),
        api.getTrendData(),
        api.getComplaints()
      ]);

      // Enhanced stats calculation
      const enhancedStats = {
        total: complaintsResponse.complaints.length,
        open: complaintsResponse.complaints.filter(c => c.status === 'open').length,
        pending: complaintsResponse.complaints.filter(c => c.status === 'pending').length,
        inProgress: complaintsResponse.complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaintsResponse.complaints.filter(c => c.status === 'resolved').length,
        closed: complaintsResponse.complaints.filter(c => c.status === 'closed').length,
        escalated: complaintsResponse.complaints.filter(c => c.status === 'escalated').length,
        rejected: complaintsResponse.complaints.filter(c => c.status === 'rejected').length,
        critical: complaintsResponse.complaints.filter(c => c.priority === 'critical').length,
        high: complaintsResponse.complaints.filter(c => c.priority === 'high').length,
        medium: complaintsResponse.complaints.filter(c => c.priority === 'medium').length,
        low: complaintsResponse.complaints.filter(c => c.priority === 'low').length,
      };

      setStats(enhancedStats);
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

  // Enhanced filtering
  useEffect(() => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.assignedDepartment === departmentFilter);
    }

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter, departmentFilter]);

  const handleComplaintSelect = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsModalOpen(true);
  };

  const handleAssignToDepartment = async () => {
    if (!assignmentComplaint || !selectedDepartment) return;

    try {
      await api.assignComplaint(assignmentComplaint.id, selectedStaff || null, selectedDepartment, assignmentNote);
      toast.success(`Issue assigned to ${selectedDepartment}`);
      await fetchData();
      setShowAssignmentModal(false);
      setAssignmentComplaint(null);
      setSelectedDepartment('');
      setSelectedStaff('');
      setAssignmentNote('');
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast.error('Failed to assign complaint');
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus, note?: string) => {
    try {
      await api.updateComplaint(complaintId, { status: newStatus, note });
      toast.success(`Issue status updated to ${newStatus.replace('_', ' ')}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handlePriorityUpdate = async (complaintId: string, newPriority: ComplaintPriority, note?: string) => {
    try {
      await api.updateComplaint(complaintId, { priority: newPriority, note });
      toast.success(`Issue priority updated to ${newPriority}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating complaint priority:', error);
      toast.error('Failed to update complaint priority');
    }
  };

  const handleAddComment = async () => {
    if (!commentComplaint || !newComment.trim()) return;

    try {
      await api.addComment(commentComplaint.id, {
        content: newComment,
        type: 'comment',
        userId: user?.id || '',
        userName: user?.name || ''
      });
      toast.success('Comment added successfully');
      await fetchData();
      setShowCommentModal(false);
      setCommentComplaint(null);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusBadgeColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-700 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'escalated': return 'bg-red-500 text-white';
      case 'rejected': return 'bg-gray-500 text-white';
      case 'open': return 'bg-blue-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityBadgeColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-800 text-white animate-pulse';
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getDepartmentByComplaint = (complaint: Complaint) => {
    return mockDepartments.find(dept => dept.id === complaint.assignedDepartment)?.name || 'Unassigned';
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
              <span className="hidden sm:inline text-gray-600 text-sm">Enhanced Admin Dashboard</span>
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <LayoutDashboard className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="issues" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Manage Issues</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <MapPin className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Map View</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all hover:bg-blue-50"
              >
                <BarChart3 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {/* Status Cards */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Open</CardTitle>
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.open}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">In Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
                </CardContent>
              </Card>

              {/* Priority Cards */}
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Critical</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">High</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.high}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Medium</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{stats.medium}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Low</CardTitle>
                  <Tag className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.low}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Critical Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Issues Requiring Immediate Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredComplaints
                    .filter(c => c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'closed')
                    .slice(0, 5)
                    .map((complaint) => (
                      <div key={complaint.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900">{complaint.title}</h4>
                          <p className="text-sm text-red-700">{complaint.location.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-600 text-white">
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleComplaintSelect(complaint)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  {filteredComplaints.filter(c => c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'closed').length === 0 && (
                    <p className="text-center text-gray-500 py-4">No critical issues at the moment</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Management Tab */}
          <TabsContent value="issues" className="space-y-6">
            {/* Advanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Management & Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
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

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {mockDepartments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Issues Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono text-sm">#{complaint.id}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{complaint.title}</p>
                              <p className="text-sm text-gray-500 truncate">{complaint.location.address}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityBadgeColor(complaint.priority)}>
                              {complaint.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(complaint.status)}>
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getDepartmentByComplaint(complaint)}</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(complaint.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplaintSelect(complaint)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAssignmentComplaint(complaint);
                                  setShowAssignmentModal(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Building2 className="h-3 w-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCommentComplaint(complaint);
                                  setShowCommentModal(true);
                                }}
                                className="h-8 w-8 p-0"
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
              onComplaintSelect={handleComplaintSelect}
              selectedComplaint={selectedComplaint}
              showDepartmentFilter={true}
              currentUser={user}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: stats.critical, color: '#DC2626' },
                          { name: 'High', value: stats.high, color: '#EF4444' },
                          { name: 'Medium', value: stats.medium, color: '#F97316' },
                          { name: 'Low', value: stats.low, color: '#3B82F6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Critical', value: stats.critical, color: '#DC2626' },
                          { name: 'High', value: stats.high, color: '#EF4444' },
                          { name: 'Medium', value: stats.medium, color: '#F97316' },
                          { name: 'Low', value: stats.low, color: '#3B82F6' }
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Department Assignment Modal */}
      <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Issue to Department</DialogTitle>
            <DialogDescription>
              Issue: {assignmentComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Staff Member (Optional)</label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Assign to Department Head</SelectItem>
                  {/* Add staff members based on selected department */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Assignment Note</label>
              <Textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="Add any specific instructions..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAssignmentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignToDepartment}>
                <Building2 className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Issue: {commentComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment or notes..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddComment}>
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Issue Details Modal */}
      {selectedComplaint && (
        <EnhancedIssueDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          complaint={selectedComplaint}
          currentUser={user}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          onAssignToDepartment={(complaintId, dept, staff, note) => {
            setAssignmentComplaint(selectedComplaint);
            setSelectedDepartment(dept);
            setSelectedStaff(staff || '');
            setAssignmentNote(note || '');
            setShowAssignmentModal(true);
          }}
          isAdmin={true}
        />
      )}
    </div>
  );
}