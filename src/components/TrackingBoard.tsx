import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, List, Map, Search, Filter, MapPin, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapView } from './MapView';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner';
import type { ComplaintStatus, ComplaintCategory, Complaint, User } from '../App';

interface TrackingBoardProps {
  onBack: () => void;
  currentUser?: User | null;
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

export function TrackingBoard({ onBack, currentUser }: TrackingBoardProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.getComplaints();
      setAllComplaints(response.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const handleComplaintSelect = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const isUserComplaint = (complaint: Complaint) => {
    return currentUser && complaint.citizenId === currentUser.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-[#1E90FF] transition-colors hover:bg-blue-50 px-3 py-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1E90FF]">
              <span className="hidden md:inline">FixMyTown | </span>
              <span className="text-gray-600">Public Tracking Board</span>
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Header with View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Civic Issues in Narsipatnam
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Track and monitor civic problems reported by citizens
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm hover:bg-gray-50' : 'hover:bg-gray-200'}`}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                onClick={() => setViewMode('map')}
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm hover:bg-gray-50' : 'hover:bg-gray-200'}`}
              >
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by location, description, or keywords..."
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
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ComplaintCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="roads">Roads</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="garbage">Garbage</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing <strong>{filteredComplaints.length}</strong> of <strong>{allComplaints.length}</strong> issues
              {currentUser && (
                <span className="ml-2 text-blue-600">
                  ({filteredComplaints.filter(c => isUserComplaint(c)).length} yours)
                </span>
              )}
            </span>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                variant="ghost"
                size="sm"
                className="text-[#1E90FF] hover:text-[#1873CC] hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((complaint) => (
              <Card 
                key={complaint.id} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
                  isUserComplaint(complaint) 
                    ? 'border-l-blue-500 bg-blue-50/30' 
                    : 'border-l-gray-200'
                } hover:scale-105`}
                onClick={() => handleComplaintSelect(complaint)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[complaint.category]}
                      </Badge>
                      {isUserComplaint(complaint) && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50">
                          Your Report
                        </Badge>
                      )}
                    </div>
                    <Badge
                      className={`${statusColors[complaint.status]} text-white text-xs font-medium`}
                    >
                      {statusLabels[complaint.status]}
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 hover:text-blue-600 transition-colors">
                    {complaint.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="mb-3 relative overflow-hidden rounded-md">
                      <ImageWithFallback
                        src={complaint.images[0]}
                        alt="Issue image"
                        className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                      />
                      {complaint.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          +{complaint.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {complaint.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{complaint.location.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                        <span>{formatDate(complaint.submittedAt)}</span>
                      </div>
                      <Badge variant="outline" className={`${priorityColors[complaint.priority]} text-xs`}>
                        {complaint.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[#1E90FF] font-medium text-xs font-mono">
                      ID: #{complaint.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Enhanced Map View */
          <MapView
            complaints={filteredComplaints}
            onComplaintSelect={handleComplaintSelect}
            selectedComplaint={selectedComplaint}
            currentUser={currentUser}
            showDepartmentFilter={false}
          />
        )}

        {filteredComplaints.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find relevant issues.
              {currentUser && " You can also report a new issue to help your community."}
            </p>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}