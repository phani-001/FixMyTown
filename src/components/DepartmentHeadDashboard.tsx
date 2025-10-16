import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  LogOut, 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  X, 
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
  Minus
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { mockUsers } from './mockData';
import type { User, Complaint, ComplaintStatus } from '../App';

interface DepartmentHeadDashboardProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
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

export function DepartmentHeadDashboard({ user, onLogout, onNavigate }: DepartmentHeadDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [fieldStaff, setFieldStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsResponse, staffResponse] = await Promise.all([
          api.getComplaints(),
          api.getStaffUsers()
        ]);

        setAllComplaints(complaintsResponse.complaints);
        setFieldStaff(staffResponse.users.filter(u => u.role === 'field_staff'));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show all complaints with filtering (not just department-specific)
  const departmentComplaints = allComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    try {
      await api.assignComplaint(complaintId, staffId);
      const staff = fieldStaff.find(u => u.id === staffId);
      toast.success(`Complaint #${complaintId} assigned to ${staff?.name}`);
      
      // Refresh complaints
      const response = await api.getComplaints();
      setAllComplaints(response.complaints);
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast.error('Failed to assign complaint');
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      await api.updateComplaint(complaintId, { status: newStatus });
      toast.success(`Complaint #${complaintId} status updated to ${statusLabels[newStatus]}`);
      
      // Refresh complaints
      const response = await api.getComplaints();
      setAllComplaints(response.complaints);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handleReject = async (complaintId: string) => {
    try {
      await api.updateComplaint(complaintId, { 
        status: 'rejected',
        note: 'Complaint rejected by department head'
      });
      toast.success(`Complaint #${complaintId} has been rejected`);
      
      // Refresh complaints
      const response = await api.getComplaints();
      setAllComplaints(response.complaints);
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      toast.error('Failed to reject complaint');
    }
  };

  const handlePriorityChange = async (complaintId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      await api.updateComplaint(complaintId, { priority: newPriority });
      toast.success(`Complaint #${complaintId} priority updated to ${newPriority}`);
      
      // Refresh complaints
      const response = await api.getComplaints();
      setAllComplaints(response.complaints);
    } catch (error) {
      console.error('Error updating complaint priority:', error);
      toast.error('Failed to update complaint priority');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

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
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{departmentComplaints.length}</div>
              <p className="text-xs text-blue-600 mt-1">All issues managed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {departmentComplaints.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {departmentComplaints.filter(c => c.status === 'in_progress').length}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Being worked on</p>
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
              <div className="text-3xl font-bold text-green-700">
                {departmentComplaints.filter(c => c.status === 'resolved').length}
              </div>
              <p className="text-xs text-green-600 mt-1">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complaint Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search complaints..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Complaints Table */}
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
                  {departmentComplaints.map((complaint) => (
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
                        <Badge variant="outline" 
                               className={complaint.priority === 'high' ? 'text-red-700 border-red-300' :
                                        complaint.priority === 'medium' ? 'text-yellow-700 border-yellow-300' :
                                        'text-blue-700 border-blue-300'}>
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
                              setShowDetailDialog(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>

                          {/* Priority Controls */}
                          <Select onValueChange={(value) => handlePriorityChange(complaint.id, value as 'low' | 'medium' | 'high')}>
                            <SelectTrigger className="h-8 w-8 p-0 hover:bg-purple-50">
                              {complaint.priority === 'high' ? <ArrowUp className="h-3 w-3 text-red-600" /> :
                               complaint.priority === 'medium' ? <Minus className="h-3 w-3 text-orange-500" /> :
                               <ArrowDown className="h-3 w-3 text-blue-500" />}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Assign Staff Dropdown */}
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

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(complaint.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
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
      </div>

      {/* Complaint Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Complaint #{selectedComplaint.id}</span>
                  <Badge variant="secondary" 
                         className={`${statusColors[selectedComplaint.status]} text-white`}>
                    {statusLabels[selectedComplaint.status]}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedComplaint.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Images */}
                {selectedComplaint.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Evidence Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.images.map((image, index) => (
                        <ImageWithFallback
                          key={index}
                          src={image}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedComplaint.location.address}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Coordinates: {selectedComplaint.location.coordinates.lat.toFixed(6)}, {selectedComplaint.location.coordinates.lng.toFixed(6)}
                  </div>
                </div>

                {/* Assignment */}
                <div>
                  <h4 className="font-medium mb-2">Assignment</h4>
                  {selectedComplaint.assignedTo ? (
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{mockUsers.find(u => u.id === selectedComplaint.assignedTo)?.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-3">
                    {selectedComplaint.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${statusColors[event.status]}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium capitalize">
                              {statusLabels[event.status]}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}