import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare,
  Send,
  Edit,
  Building2,
  AlertTriangle,
  UserPlus,
  FileText,
  History,
  Save,
  X
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import type { Complaint, User as UserType, ComplaintStatus, ComplaintPriority, Comment } from '../App';

interface EnhancedIssueDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: Complaint;
  currentUser?: UserType | null;
  onStatusUpdate?: (id: string, status: ComplaintStatus, note?: string) => void;
  onPriorityUpdate?: (id: string, priority: ComplaintPriority, note?: string) => void;
  onAssignToDepartment?: (id: string, department: string, staff?: string, note?: string) => void;
  isAdmin?: boolean;
  isDepartmentHead?: boolean;
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

const categoryLabels = {
  roads: 'Roads & Infrastructure',
  water: 'Water Supply',
  electricity: 'Electricity',
  garbage: 'Waste Management',
  streetlight: 'Street Lighting',
  other: 'Other'
};

const departments = [
  'Public Works',
  'Water Supply',
  'Electrical',
  'Sanitation',
  'Administration'
];

export function EnhancedIssueDetailsModal({ 
  open, 
  onOpenChange, 
  complaint, 
  currentUser,
  onStatusUpdate,
  onPriorityUpdate,
  onAssignToDepartment,
  isAdmin = false,
  isDepartmentHead = false
}: EnhancedIssueDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'actions'>('details');
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [newPriority, setNewPriority] = useState<ComplaintPriority>(complaint.priority);
  const [statusNote, setStatusNote] = useState('');
  const [priorityNote, setPriorityNote] = useState('');
  const [assignmentDepartment, setAssignmentDepartment] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');

  const formatDate = (dateString: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',  
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatDateShort = (dateString: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const isUserComplaint = currentUser && complaint.citizenId === currentUser.id;

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'escalated':
        return <AlertCircle className="w-4 h-4" />;
      case 'closed':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = () => {
    if (onStatusUpdate && newStatus !== complaint.status) {
      onStatusUpdate(complaint.id, newStatus, statusNote);
      setStatusNote('');
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
    }
  };

  const handlePriorityUpdate = () => {
    if (onPriorityUpdate && newPriority !== complaint.priority) {
      onPriorityUpdate(complaint.id, newPriority, priorityNote);
      setPriorityNote('');
      toast.success(`Priority updated to ${newPriority}`);
    }
  };

  const handleAssignToDepartment = () => {
    if (onAssignToDepartment && assignmentDepartment) {
      onAssignToDepartment(complaint.id, assignmentDepartment, '', assignmentNote);
      setAssignmentDepartment('');
      setAssignmentNote('');
      toast.success(`Assigned to ${assignmentDepartment}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            Issue Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 line-clamp-3">
                  {complaint.title}
                </h2>
                {isUserComplaint && (
                  <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 whitespace-nowrap">
                    Your Complaint
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge 
                  className={`${statusColors[complaint.status]} text-white font-medium px-3 py-1 flex items-center gap-1`}
                >
                  {getStatusIcon(complaint.status)}
                  {statusLabels[complaint.status]}
                </Badge>
                <Badge className={`${priorityColors[complaint.priority]} font-medium px-3 py-1`}>
                  {complaint.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge variant="secondary" className="font-medium px-3 py-1">
                  {categoryLabels[complaint.category] || complaint.category}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-semibold">Complaint ID:</span>
                <span className="text-blue-600 font-mono">#{complaint.id}</span>
              </div>
            </div>

            <Separator />

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['details', 'timeline', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'details' && <FileText className="w-4 h-4 mr-2" />}
                  {tab === 'timeline' && <History className="w-4 h-4 mr-2" />}
                  {tab === 'comments' && <MessageSquare className="w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              {(isAdmin || isDepartmentHead) && (
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'actions' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Actions
                </button>
              )}
            </div>

            {/* Tab Contents */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Images */}
                {complaint.images && complaint.images.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {complaint.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative group">
                          <ImageWithFallback
                            src={image}
                            alt={`Complaint image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          {index === 3 && complaint.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold">
                                +{complaint.images.length - 4} more
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-gray-700">{complaint.location.address}</p>
                          {complaint.location.coordinates?.lat && complaint.location.coordinates?.lng && (
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {complaint.location.coordinates.lat.toFixed(4)}, {complaint.location.coordinates.lng.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                      {complaint.location.coordinates?.lat && complaint.location.coordinates?.lng && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            const lat = complaint.location.coordinates!.lat;
                            const lng = complaint.location.coordinates!.lng;
                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Maps
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Assignment Info */}
                {complaint.assignedTo && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Assignment</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium text-gray-900">{complaint.assignedTo}</span>
                        </div>
                        {complaint.assignedDepartment && (
                          <div className="flex items-center gap-2 mt-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-600">Department:</span>
                            <span className="font-medium text-gray-900">{complaint.assignedDepartment}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {complaint.timeline && complaint.timeline.length > 0 ? (
                        complaint.timeline.map((entry, index) => (
                          <div key={index} className="flex gap-3 relative">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${statusColors[entry.status]} flex items-center justify-center`}>
                              {getStatusIcon(entry.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {statusLabels[entry.status]}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatDate(entry.timestamp)}
                                </span>
                                {entry.userName && (
                                  <span className="text-sm text-gray-600">
                                    by {entry.userName}
                                  </span>
                                )}
                              </div>
                              {entry.note && (
                                <p className="text-sm text-gray-600">{entry.note}</p>
                              )}
                            </div>
                            {index < complaint.timeline.length - 1 && (
                              <div className="absolute left-[15px] mt-8 w-0.5 h-6 bg-gray-200"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No timeline events yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Comments & Updates</h3>
                  <Badge variant="secondary">
                    {complaint.comments?.length || 0} comments
                  </Badge>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4">
                  {complaint.comments && complaint.comments.length > 0 ? (
                    complaint.comments.map((comment, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{comment.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.userRole.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No comments yet. Start the conversation!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Add Comment */}
                {(isAdmin || isDepartmentHead) && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Add Comment</label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment or update..."
                          rows={3}
                        />
                        <Button 
                          onClick={() => {
                            if (newComment.trim()) {
                              // Handle add comment
                              setNewComment('');
                              toast.success('Comment added successfully');
                            }
                          }}
                          disabled={!newComment.trim()}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'actions' && (isAdmin || isDepartmentHead) && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Administrative Actions</h3>
                
                {/* Status Update */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">New Status</label>
                        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ComplaintStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status Note</label>
                        <Input
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Add a note about this status change"
                        />
                      </div>
                    </div>
                    <Button onClick={handleStatusUpdate} disabled={newStatus === complaint.status}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </CardContent>
                </Card>

                {/* Priority Update */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">New Priority</label>
                        <Select value={newPriority} onValueChange={(value) => setNewPriority(value as ComplaintPriority)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority Note</label>
                        <Input
                          value={priorityNote}
                          onChange={(e) => setPriorityNote(e.target.value)}
                          placeholder="Add a note about this priority change"
                        />
                      </div>
                    </div>
                    <Button onClick={handlePriorityUpdate} disabled={newPriority === complaint.priority}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Update Priority
                    </Button>
                  </CardContent>
                </Card>

                {/* Department Assignment (Admin only) */}
                {isAdmin && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Assign to Department</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Department</label>
                          <Select value={assignmentDepartment} onValueChange={setAssignmentDepartment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Assignment Note</label>
                          <Input
                            value={assignmentNote}
                            onChange={(e) => setAssignmentNote(e.target.value)}
                            placeholder="Add instructions or notes"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAssignToDepartment} disabled={!assignmentDepartment}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Assign to Department
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <p className="font-medium">{formatDateShort(complaint.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <p className="font-medium">{formatDateShort(complaint.updatedAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Category:</span>
                    <p className="font-medium">{categoryLabels[complaint.category]}</p>
                  </div>
                  {complaint.assignedDepartment && (
                    <div>
                      <span className="text-sm text-gray-600">Department:</span>
                      <p className="font-medium">{complaint.assignedDepartment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {(isAdmin || isDepartmentHead) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => onStatusUpdate?.(complaint.id, 'in_progress', 'Started working on this issue')}
                    disabled={complaint.status === 'in_progress'}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => onStatusUpdate?.(complaint.id, 'resolved', 'Issue has been resolved')}
                    disabled={complaint.status === 'resolved'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => onStatusUpdate?.(complaint.id, 'escalated', 'Escalated for higher priority')}
                      disabled={complaint.status === 'escalated'}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate Issue
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}