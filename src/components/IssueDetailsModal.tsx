import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { MapPin, Calendar, User, Clock, AlertCircle, CheckCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Complaint, User as UserType } from '../App';

interface IssueDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: Complaint;
  currentUser?: UserType | null;
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

const categoryLabels = {
  roads: 'Roads & Infrastructure',
  water: 'Water Supply',
  electricity: 'Electricity',
  garbage: 'Waste Management',
  streetlight: 'Street Lighting',
  other: 'Other'
};

export function IssueDetailsModal({ open, onOpenChange, complaint, currentUser }: IssueDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatDateShort = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const isUserComplaint = currentUser && complaint.citizenId === currentUser.id;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'escalated':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            Issue Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <Badge variant="outline" className={`${priorityColors[complaint.priority]} font-medium px-3 py-1`}>
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

          <Separator />

          {/* Location & Timing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Location
                </h4>
                <p className="text-gray-700">{complaint.location.address}</p>
                {complaint.location.coordinates?.lat && complaint.location.coordinates?.lng && (
                  <p className="text-xs text-gray-500 font-mono">
                    {complaint.location.coordinates.lat.toFixed(4)}, {complaint.location.coordinates.lng.toFixed(4)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <span className="ml-2 font-medium">{formatDateShort(complaint.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 font-medium">{formatDateShort(complaint.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {complaint.timeline && complaint.timeline.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {complaint.timeline.map((entry, index) => (
                      <div key={index} className="flex gap-3">
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
                          </div>
                          {entry.note && (
                            <p className="text-sm text-gray-600">{entry.note}</p>
                          )}
                        </div>
                        {index < complaint.timeline.length - 1 && (
                          <div className="absolute left-[15px] mt-8 w-0.5 h-4 bg-gray-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Close
            </Button>
            {complaint.location.coordinates?.lat && complaint.location.coordinates?.lng && (
              <Button 
                onClick={() => {
                  const lat = complaint.location.coordinates!.lat;
                  const lng = complaint.location.coordinates!.lng;
                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Maps
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}