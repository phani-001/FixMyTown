import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, Filter } from 'lucide-react';
import { IssueDetailsModal } from './IssueDetailsModal';
import type { Complaint, User } from '../App';

interface MapViewProps {
  complaints: Complaint[];
  onComplaintSelect: (complaint: Complaint) => void;
  selectedComplaint?: Complaint | null;
  currentUser?: User | null;
  showDepartmentFilter?: boolean;
}

// Narsipatnam coordinates (Andhra Pradesh, India)
const NARSIPATNAM_CENTER = { lat: 17.6676, lng: 82.6116 };

export function MapView({ 
  complaints, 
  onComplaintSelect, 
  selectedComplaint, 
  currentUser,
  showDepartmentFilter = false 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalComplaint, setModalComplaint] = useState<Complaint | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Load Leaflet dynamically
    const loadMap = async () => {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
      
      // Fix marker icons issue
      delete (L as any).Icon.Default.prototype._getIconUrl;
      (L as any).Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const mapInstance = L.map(mapRef.current!, {
        center: [NARSIPATNAM_CENTER.lat, NARSIPATNAM_CENTER.lng],
        zoom: 14,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstance);

      setMap(mapInstance);
      setMapLoaded(true);
    };

    loadMap().catch(console.error);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapRef.current]);

  // Filter complaints based on department
  const filteredComplaints = React.useMemo(() => {
    if (!showDepartmentFilter || selectedDepartment === 'all') {
      return complaints;
    }
    
    // Map categories to departments
    const categoryDepartmentMap = {
      'roads': 'Public Works',
      'water': 'Water Supply',
      'electricity': 'Electrical',
      'garbage': 'Sanitation',
      'streetlight': 'Electrical',
      'other': 'Administration'
    };
    
    return complaints.filter(complaint => 
      categoryDepartmentMap[complaint.category] === selectedDepartment
    );
  }, [complaints, selectedDepartment, showDepartmentFilter]);

  // Update markers when complaints change
  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));

    const newMarkers: any[] = [];

    filteredComplaints.forEach((complaint) => {
      // Create custom icon based on status and priority
      const getMarkerColor = () => {
        if (complaint.status === 'resolved') return '#10B981'; // green
        if (complaint.status === 'in_progress') return '#F59E0B'; // amber
        if (complaint.status === 'escalated') return '#EF4444'; // red
        if (complaint.priority === 'high') return '#DC2626'; // dark red
        if (complaint.priority === 'medium') return '#F97316'; // orange
        return '#6B7280'; // gray
      };

      const getMarkerSize = () => {
        return complaint.priority === 'high' ? 12 : complaint.priority === 'medium' ? 10 : 8;
      };

      // Check if this is user's own complaint for blue outline
      const isUserComplaint = currentUser && complaint.citizenId === currentUser.id;

      // Use actual coordinates if available, otherwise generate realistic ones around Narsipatnam
      const coords = complaint.location.coordinates?.lat && complaint.location.coordinates?.lng 
        ? [complaint.location.coordinates.lat, complaint.location.coordinates.lng]
        : [
            NARSIPATNAM_CENTER.lat + (Math.random() - 0.5) * 0.02, // ±0.01 degrees (about 1km)
            NARSIPATNAM_CENTER.lng + (Math.random() - 0.5) * 0.02
          ];

      // Dynamic import for Leaflet in effect
      import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js').then((L) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${getMarkerColor()};
              width: ${getMarkerSize() * 2}px;
              height: ${getMarkerSize() * 2}px;
              border-radius: 50%;
              border: ${isUserComplaint ? '3px solid #1E90FF' : '2px solid white'};
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
              position: relative;
            ">
              ${complaint.priority === 'high' ? '!' : complaint.priority === 'medium' ? '•' : '·'}
              ${isUserComplaint ? '<div style="position: absolute; top: -2px; right: -2px; width: 6px; height: 6px; background-color: #1E90FF; border-radius: 50%; border: 1px solid white;"></div>' : ''}
            </div>
          `,
          iconSize: [getMarkerSize() * 2, getMarkerSize() * 2],
          iconAnchor: [getMarkerSize(), getMarkerSize()]
        });

        const marker = L.marker(coords as [number, number], { icon: customIcon }).addTo(map);
        
        // Add tooltip on hover
        const tooltipContent = `
          <div style="padding: 8px; min-width: 180px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937; font-size: 14px;">${complaint.title}</h4>
            <p style="margin: 0; font-size: 12px; color: ${getMarkerColor()}; font-weight: bold;">${complaint.status.replace('_', ' ').toUpperCase()}</p>
          </div>
        `;
        
        marker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip'
        });

        // Add popup with detailed complaint info
        const popupContent = `
          <div style="min-width: 250px; max-width: 300px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${complaint.title}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">ID: #${complaint.id}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Category:</strong> ${complaint.category}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Status:</strong> 
              <span style="color: ${getMarkerColor()}; font-weight: bold;">${complaint.status.replace('_', ' ')}</span>
            </p>
            <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Priority:</strong> ${complaint.priority}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #4b5563;">${complaint.location.address}</p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; line-height: 1.3;">${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</p>
            <button onclick="window.selectComplaint('${complaint.id}')" 
                    style="background: #1E90FF; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 100%; margin-top: 4px;">
              View Full Details
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup'
        });

        marker.on('click', () => {
          setModalComplaint(complaint);
          setShowDetailsModal(true);
          onComplaintSelect(complaint);
        });

        newMarkers.push(marker);
      });
    });

    setMarkers(newMarkers);
  }, [map, filteredComplaints, mapLoaded, currentUser]);

  // Global function for popup buttons
  useEffect(() => {
    (window as any).selectComplaint = (id: string) => {
      const complaint = filteredComplaints.find(c => c.id === id);
      if (complaint) {
        setModalComplaint(complaint);
        setShowDetailsModal(true);
        onComplaintSelect(complaint);
      }
    };

    return () => {
      delete (window as any).selectComplaint;
    };
  }, [filteredComplaints, onComplaintSelect]);

  // Center map on selected complaint
  useEffect(() => {
    if (!map || !selectedComplaint || !mapLoaded) return;

    const coords = selectedComplaint.location.coordinates?.lat && selectedComplaint.location.coordinates?.lng 
      ? [selectedComplaint.location.coordinates.lat, selectedComplaint.location.coordinates.lng]
      : [NARSIPATNAM_CENTER.lat, NARSIPATNAM_CENTER.lng];

    map.setView(coords, 16);
  }, [map, selectedComplaint, mapLoaded]);

  const centerOnNarsipatnam = () => {
    if (map) {
      map.setView([NARSIPATNAM_CENTER.lat, NARSIPATNAM_CENTER.lng], 14);
    }
  };

  const getStatusCount = (status: string) => {
    return filteredComplaints.filter(c => c.status === status).length;
  };

  const getPriorityCount = (priority: string) => {
    return filteredComplaints.filter(c => c.priority === priority).length;
  };

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Public Works', label: 'Public Works' },
    { value: 'Water Supply', label: 'Water Supply' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Sanitation', label: 'Sanitation' },
    { value: 'Administration', label: 'Administration' }
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Map Controls and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Narsipatnam Town - Issue Map
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  {showDepartmentFilter && (
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px] h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button 
                    onClick={centerOnNarsipatnam}
                    variant="outline" 
                    size="sm"
                    className="h-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Center
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef} 
                className="w-full h-96 rounded-lg border-2 border-gray-200 bg-gray-50"
                style={{ minHeight: '400px' }}
              />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend and Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User's Own Complaints Legend */}
              {currentUser && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Your Complaints</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600 relative">
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                    </div>
                    <span className="text-xs">Blue outline markers</span>
                  </div>
                </div>
              )}

              {/* Status Legend */}
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Resolved</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{getStatusCount('resolved')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-xs">In Progress</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{getStatusCount('in_progress')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs">Escalated</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{getStatusCount('escalated')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-xs">Pending</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{getStatusCount('pending')}</Badge>
                  </div>
                </div>
              </div>

              {/* Priority Legend */}
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Priority</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">!</div>
                      <span className="text-xs">High</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">{getPriorityCount('high')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">•</div>
                      <span className="text-xs">Medium</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{getPriorityCount('medium')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">·</div>
                      <span className="text-xs">Low</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{getPriorityCount('low')}</Badge>
                  </div>
                </div>
              </div>

              {/* Map Instructions */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-xs font-medium text-blue-800 mb-2">Map Interaction</h4>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Hover over pins for quick preview</li>
                  <li>• Click pins for full details</li>
                  <li>• Blue outlined pins are your complaints</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issue Details Modal */}
      {modalComplaint && (
        <IssueDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          complaint={modalComplaint}
          currentUser={currentUser}
        />
      )}

      {/* Add custom CSS for tooltips */}
      <style jsx global>{`
        .custom-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          border: none !important;
          border-radius: 6px !important;
          color: white !important;
          font-size: 12px !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(0, 0, 0, 0.8) !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </>
  );
}