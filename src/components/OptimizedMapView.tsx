import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Navigation, Filter, Eye } from 'lucide-react';
import type { Complaint, User } from '../App';

interface OptimizedMapViewProps {
  complaints: Complaint[];
  onComplaintSelect: (complaint: Complaint) => void;
  selectedComplaint?: Complaint | null;
  currentUser?: User | null;
  showDepartmentFilter?: boolean;
}

// Narsipatnam coordinates
const NARSIPATNAM_CENTER = { lat: 17.6676, lng: 82.6116 };

export function OptimizedMapView({ 
  complaints, 
  onComplaintSelect, 
  selectedComplaint, 
  currentUser,
  showDepartmentFilter = false 
}: OptimizedMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Initialize lightweight map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const loadMap = async () => {
      try {
        // Add Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
        
        // Fix marker icons
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
          preferCanvas: true, // Better performance for many markers
        });

        // Add lightweight tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          updateWhenZooming: false,
          updateWhenIdle: true, // Optimize for performance
        }).addTo(mapInstance);

        // Add zoom control
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance);

        setMap(mapInstance);
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapRef.current]);

  // Filter complaints
  const filteredComplaints = React.useMemo(() => {
    let filtered = complaints;
    
    if (selectedDepartment !== 'all') {
      const categoryDepartmentMap: Record<string, string> = {
        'roads': 'Public Works',
        'water': 'Water Supply',
        'electricity': 'Electrical',
        'garbage': 'Sanitation',
        'streetlight': 'Electrical',
        'other': 'Administration'
      };
      
      filtered = filtered.filter(complaint => 
        complaint.assignedDepartment === selectedDepartment ||
        categoryDepartmentMap[complaint.category] === selectedDepartment
      );
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === selectedStatus);
    }
    
    return filtered;
  }, [complaints, selectedDepartment, selectedPriority, selectedStatus]);

  // Update markers efficiently
  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));

    const newMarkers: any[] = [];

    // Create marker clusters for better performance
    const markerCluster = L.markerClusterGroup ? L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
    }) : null;

    filteredComplaints.forEach((complaint) => {
      const getMarkerColor = () => {
        if (complaint.priority === 'critical') return '#DC2626'; // red-600
        if (complaint.status === 'resolved') return '#10B981'; // emerald-500
        if (complaint.status === 'in_progress') return '#F59E0B'; // amber-500
        if (complaint.status === 'escalated') return '#EF4444'; // red-500
        if (complaint.priority === 'high') return '#DC2626'; // red-600
        if (complaint.priority === 'medium') return '#F97316'; // orange-500
        return '#6B7280'; // gray-500
      };

      const getMarkerSize = () => {
        if (complaint.priority === 'critical') return 14;
        if (complaint.priority === 'high') return 12;
        if (complaint.priority === 'medium') return 10;
        return 8;
      };

      const getPrioritySymbol = () => {
        if (complaint.priority === 'critical') return '⚠';
        if (complaint.priority === 'high') return '!';
        if (complaint.priority === 'medium') return '•';
        return '·';
      };

      // Use coordinates if available, otherwise generate realistic ones
      const coords = complaint.location.coordinates?.lat && complaint.location.coordinates?.lng 
        ? [complaint.location.coordinates.lat, complaint.location.coordinates.lng]
        : [
            NARSIPATNAM_CENTER.lat + (Math.random() - 0.5) * 0.02,
            NARSIPATNAM_CENTER.lng + (Math.random() - 0.5) * 0.02
          ];

      // Dynamic import for Leaflet in effect
      import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js').then((L) => {
        const customIcon = L.divIcon({
          className: 'custom-marker-optimized',
          html: `
            <div style="
              background-color: ${getMarkerColor()};
              width: ${getMarkerSize() * 2}px;
              height: ${getMarkerSize() * 2}px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${getMarkerSize()}px;
              color: white;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            " 
            onmouseover="this.style.transform='scale(1.2)'"
            onmouseout="this.style.transform='scale(1)'"
            >
              ${getPrioritySymbol()}
            </div>
          `,
          iconSize: [getMarkerSize() * 2, getMarkerSize() * 2],
          iconAnchor: [getMarkerSize(), getMarkerSize()]
        });

        const marker = L.marker(coords as [number, number], { icon: customIcon });
        
        // Minimal tooltip with essential info only
        const tooltipContent = `
          <div style="padding: 4px 8px; font-size: 12px; max-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 2px;">${complaint.title}</div>
            <div style="color: ${getMarkerColor()}; font-size: 10px;">${complaint.status.replace('_', ' ').toUpperCase()} • ${complaint.priority.toUpperCase()}</div>
          </div>
        `;
        
        marker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'optimized-tooltip'
        });

        // Lightweight popup with minimal details
        const popupContent = `
          <div style="min-width: 180px; max-width: 220px; font-size: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${complaint.title}</div>
            <div style="color: #6b7280; margin-bottom: 2px;">ID: #${complaint.id}</div>
            <div style="margin-bottom: 4px;">
              <span style="color: ${getMarkerColor()}; font-weight: bold;">${complaint.status.replace('_', ' ')}</span>
              • <strong>${complaint.priority}</strong>
            </div>
            <div style="color: #4b5563; font-size: 11px; margin-bottom: 6px;">${complaint.location.address}</div>
            <button 
              onclick="window.selectComplaint('${complaint.id}')" 
              style="
                background: #1E90FF; 
                color: white; 
                border: none; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 11px; 
                cursor: pointer; 
                width: 100%;
              "
            >
              <span style="margin-right: 4px;">👁</span> View Details
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 240,
          className: 'optimized-popup'
        });

        marker.on('click', () => {
          onComplaintSelect(complaint);
        });

        if (markerCluster) {
          markerCluster.addLayer(marker);
        } else {
          marker.addTo(map);
        }
        
        newMarkers.push(marker);
      });
    });

    if (markerCluster) {
      map.addLayer(markerCluster);
    }

    setMarkers(newMarkers);
  }, [map, filteredComplaints, mapLoaded]);

  // Global function for popup buttons
  useEffect(() => {
    (window as any).selectComplaint = (id: string) => {
      const complaint = filteredComplaints.find(c => c.id === id);
      if (complaint) {
        onComplaintSelect(complaint);
      }
    };

    return () => {
      delete (window as any).selectComplaint;
    };
  }, [filteredComplaints, onComplaintSelect]);

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
                  Narsipatnam Town - Optimized Issue Map
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Compact Filters */}
                  <div className="flex gap-2">
                    {showDepartmentFilter && (
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
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
                    
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                    <p className="text-gray-600">Loading optimized map...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend & Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Priority Legend */}
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Priority</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">⚠</div>
                      <span>Critical</span>
                    </div>
                    <Badge variant="destructive" className="text-xs h-4">{getPriorityCount('critical')}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">!</div>
                      <span>High</span>
                    </div>
                    <Badge variant="secondary" className="text-xs h-4">{getPriorityCount('high')}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">•</div>
                      <span>Medium</span>
                    </div>
                    <Badge variant="secondary" className="text-xs h-4">{getPriorityCount('medium')}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">·</div>
                      <span>Low</span>
                    </div>
                    <Badge variant="outline" className="text-xs h-4">{getPriorityCount('low')}</Badge>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Status Overview</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-center p-1 bg-green-50 rounded">
                    <div className="font-bold text-green-700">{getStatusCount('resolved')}</div>
                    <div className="text-green-600">Resolved</div>
                  </div>
                  <div className="text-center p-1 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-700">{getStatusCount('in_progress')}</div>
                    <div className="text-yellow-600">Active</div>
                  </div>
                  <div className="text-center p-1 bg-blue-50 rounded">
                    <div className="font-bold text-blue-700">{getStatusCount('open')}</div>
                    <div className="text-blue-600">Open</div>
                  </div>
                  <div className="text-center p-1 bg-orange-50 rounded">
                    <div className="font-bold text-orange-700">{getStatusCount('pending')}</div>
                    <div className="text-orange-600">Pending</div>
                  </div>
                </div>
              </div>

              {/* Map Instructions */}
              <div className="p-2 bg-blue-50 rounded-lg">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Quick Guide</h4>
                <ul className="text-xs text-blue-600 space-y-0.5">
                  <li>• Hover for preview</li>
                  <li>• Click for details</li>
                  <li>• Larger = higher priority</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Info */}
        <div className="text-center text-xs text-gray-500">
          Showing {filteredComplaints.length} of {complaints.length} issues • Optimized for performance
        </div>
      </div>

      {/* Optimized CSS for markers and tooltips */}
      <style jsx global>{`
        .optimized-tooltip {
          background: rgba(0, 0, 0, 0.85) !important;
          border: none !important;
          border-radius: 4px !important;
          color: white !important;
          font-size: 11px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
          padding: 4px 8px !important;
        }
        .optimized-tooltip::before {
          border-top-color: rgba(0, 0, 0, 0.85) !important;
        }
        .optimized-popup .leaflet-popup-content-wrapper {
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          padding: 8px !important;
        }
        .optimized-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .optimized-popup .leaflet-popup-tip {
          background: white !important;
        }
        .custom-marker-optimized {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  );
}