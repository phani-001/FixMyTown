import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, MapPin, Upload, Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { api } from '../utils/supabase/client';
import type { ComplaintCategory } from '../App';

interface ReportProblemProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  user?: any;
}

export function ReportProblem({ onBack, onNavigate, user }: ReportProblemProps) {
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const categories = [
    { value: 'roads', label: 'Roads & Infrastructure' },
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'garbage', label: 'Garbage Collection' },
    { value: 'streetlight', label: 'Street Lighting' },
    { value: 'other', label: 'Other' }
  ];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoordinates(coords);
          setLocation(`Location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
          toast.success('Location captured successfully');
        },
        (error) => {
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!location.trim()) {
      toast.error('Please provide a location');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to submit a complaint');
      return;
    }

    setLoading(true);

    try {
      // Generate a better title from the description if not provided
      const title = description.length > 50 
        ? description.substring(0, 50) + '...' 
        : description;

      const complaintData = {
        title,
        description,
        category,
        location: {
          address: location,
          coordinates: coordinates || { lat: 17.6868, lng: 82.6109 }
        },
        images: [], // In a real app, you'd upload files first
        citizenId: user.id,
        priority: description.toLowerCase().includes('urgent') ? 'high' : 'medium'
      };

      const response = await api.submitComplaint(complaintData);
      setComplaintId(response.complaint.id);
      setShowSuccess(true);
      toast.success('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onNavigate('citizen-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-[#1E90FF] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-[#1E90FF]">
              FixMyTown <span className="text-gray-600">| Report Problem</span>
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
            <p className="text-sm text-gray-600">
              Help us improve Narsipatnam by reporting issues in your area
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div>
              <Label htmlFor="category">Problem Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ComplaintCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: Streetlight not working near Clock Tower Road. The area becomes very dark at night making it unsafe for pedestrians."
                className="mt-1 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload Photo/Video (Optional)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#1E90FF] transition-colors">
                <div className="space-y-1 text-center">
                  <div className="flex justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#1E90FF] hover:text-[#1873CC] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1E90FF]"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, MP4 up to 10MB (Max 5 files)
                  </p>
                </div>
              </div>
              
              {/* Display uploaded files */}
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="mt-1 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter address or landmark"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    variant="outline"
                    className="shrink-0"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Location
                  </Button>
                </div>
                
                {/* Mock Map Display */}
                <div className="h-32 bg-gray-100 border rounded-md flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Interactive Map</p>
                    {coordinates && (
                      <p className="text-xs">
                        Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !category || !description.trim() || !location.trim()}
              className="w-full bg-[#1E90FF] hover:bg-[#1873CC] transition-all duration-200 hover:scale-105"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle>Issue Submitted Successfully!</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Your issue has been submitted successfully.</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  Complaint ID: #{complaintId}
                </p>
              </div>
              <p className="text-sm">
                You can track its progress on the Tracking Board or in your dashboard.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => onNavigate('tracking-board')}
              variant="outline"
              className="flex-1"
            >
              View Tracking Board
            </Button>
            <Button
              onClick={handleSuccessClose}
              className="flex-1 bg-[#1E90FF] hover:bg-[#1873CC]"
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}