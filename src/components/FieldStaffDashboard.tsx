import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  LogOut, 
  MapPin, 
  Camera, 
  Play, 
  CheckCircle, 
  Upload,
  Calendar,
  Clock,
  User,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getComplaintsByAssignee, mockUsers } from './mockData';
import { toast } from 'sonner@2.0.3';
import type { User, Complaint } from '../App';

interface FieldStaffDashboardProps {
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

export function FieldStaffDashboard({ user, onLogout, onNavigate }: FieldStaffDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [workNote, setWorkNote] = useState('');
  const [fixImages, setFixImages] = useState<File[]>([]);

  // Get complaints assigned to current user
  const assignedComplaints = getComplaintsByAssignee(user?.id || '').filter(c => 
    c.status === 'pending' || c.status === 'in_progress'
  );

  const handleStartWork = (complaintId: string) => {
    toast.success(`Started working on complaint #${complaintId}`);
  };

  const handleUploadFix = (complaintId: string) => {
    if (fixImages.length === 0) {
      toast.error('Please upload at least one photo of the completed work');
      return;
    }
    toast.success(`Fix uploaded for complaint #${complaintId}. Marked as resolved.`);
    setShowUploadDialog(false);
    setFixImages([]);
    setWorkNote('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFixImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysAgo = (date: Date) => {
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-green-600">
                FixMyTown
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Field Staff Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-green-50 rounded-lg">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {user?.name}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
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

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">
            You have {assignedComplaints.length} assigned complaint{assignedComplaints.length !== 1 ? 's' : ''} to work on.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Assigned to Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{assignedComplaints.length}</div>
              <p className="text-xs text-blue-600 mt-1">Active assignments</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {assignedComplaints.filter(c => c.status === 'in_progress').length}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Currently working on</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {assignedComplaints.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-xs text-red-600 mt-1">Waiting to start</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedComplaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg text-gray-900 mb-2">No pending assignments</h3>
                <p>Great job! You have no pending complaints assigned to you at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedComplaints.map((complaint) => (
                  <Card key={complaint.id} className="border-l-4 border-l-[#1E90FF]">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="outline">#{complaint.id}</Badge>
                            <Badge
                              variant="secondary"
                              className={`${statusColors[complaint.status]} text-white`}
                            >
                              {statusLabels[complaint.status]}
                            </Badge>
                            <Badge variant="outline" 
                                   className={complaint.priority === 'high' ? 'text-red-700 border-red-300' :
                                            complaint.priority === 'medium' ? 'text-yellow-700 border-yellow-300' :
                                            'text-blue-700 border-blue-300'}>
                              {complaint.priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {complaint.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                      </div>

                      {/* Location and Images */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Location */}
                        <div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="font-medium">Location:</span>
                          </div>
                          <p className="text-sm text-gray-600">{complaint.location.address}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            GPS: {complaint.location.coordinates.lat.toFixed(6)}, {complaint.location.coordinates.lng.toFixed(6)}
                          </p>
                        </div>

                        {/* Timeline Info */}
                        <div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Timeline:</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Submitted: {formatDate(complaint.submittedAt)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getDaysAgo(complaint.submittedAt)} days ago
                          </p>
                        </div>
                      </div>

                      {/* Evidence Photos */}
                      {complaint.images.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Evidence Photos:</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {complaint.images.slice(0, 4).map((image, index) => (
                              <ImageWithFallback
                                key={index}
                                src={image}
                                alt={`Evidence ${index + 1}`}
                                className="w-full h-20 object-cover rounded-md border"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDetailDialog(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {complaint.status === 'pending' && (
                          <Button
                            onClick={() => handleStartWork(complaint.id)}
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Work
                          </Button>
                        )}

                        {complaint.status === 'in_progress' && (
                          <Button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowUploadDialog(true);
                            }}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Fix Photo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedComplaint.location.address}</span>
                  </div>
                </div>

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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Fix Photo Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Fix Documentation</DialogTitle>
            <DialogDescription>
              Upload photos of the completed work and mark as resolved
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Work Completion Notes</label>
              <Textarea
                value={workNote}
                onChange={(e) => setWorkNote(e.target.value)}
                placeholder="Describe the work completed..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Upload Photos *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="fix-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#1E90FF] hover:text-[#1873CC]"
                    >
                      <span>Upload files</span>
                      <input
                        id="fix-upload"
                        name="fix-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>

              {fixImages.length > 0 && (
                <div className="mt-2 space-y-2">
                  {fixImages.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <button
                        onClick={() => setFixImages(fixImages.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowUploadDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedComplaint && handleUploadFix(selectedComplaint.id)}
                disabled={fixImages.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}