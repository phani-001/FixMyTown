import type { Complaint, User, Comment } from '../App';

export const mockComplaints: Complaint[] = [
  {
    id: 'FMT001',
    title: 'Streetlight not working near Clock Tower',
    description: 'The streetlight near Clock Tower Road has been non-functional for the past week. The area becomes very dark at night making it unsafe for pedestrians and vehicles.',
    category: 'streetlight',
    status: 'in_progress',
    priority: 'high',
    location: {
      address: 'Clock Tower Road, Narsipatnam',
      coordinates: { lat: 17.6868, lng: 82.6109 }
    },
    images: ['https://images.unsplash.com/photo-1646620990701-6ad6af24d32b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMHN0cmVldCUyMHJvYWQlMjBpbmZyYXN0cnVjdHVyZXxlbnwxfHx8fDE3NTgwMzA1MDF8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    citizenId: 'citizen_9876543210',
    assignedTo: 'field_staff_001',
    assignedDepartment: 'Electrical',
    submittedAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-16T14:20:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-15T10:30:00'), note: 'Complaint submitted', userId: 'citizen_9876543210', userName: 'Rajesh Kumar' },
      { status: 'in_progress', timestamp: new Date('2024-01-16T14:20:00'), note: 'Assigned to field staff for inspection', userId: 'dept_head_003', userName: 'Smt. Lakshmi Devi' }
    ],
    comments: [
      {
        id: 'c1',
        complaintId: 'FMT001',
        userId: 'field_staff_001',
        userName: 'Ravi Kumar',
        userRole: 'field_staff',
        content: 'Inspected the area. The streetlight pole has electrical issues. Replacement parts needed.',
        timestamp: new Date('2024-01-16T16:30:00'),
        type: 'comment'
      }
    ]
  },
  {
    id: 'FMT002',
    title: 'Major pothole on Main Road causing accidents',
    description: 'Large pothole on Main Road near the bus stand is causing traffic congestion and vehicle damage. Multiple vehicles have been affected. This is a critical safety hazard that needs immediate attention.',
    category: 'roads',
    status: 'open',
    priority: 'critical',
    location: {
      address: 'Main Road, Near Bus Stand, Narsipatnam',
      coordinates: { lat: 17.6875, lng: 82.6115 }
    },
    images: [],
    citizenId: 'citizen_9876543211',
    assignedDepartment: 'Public Works',
    submittedAt: new Date('2024-01-16T09:15:00'),
    updatedAt: new Date('2024-01-16T09:15:00'),
    timeline: [
      { status: 'open', timestamp: new Date('2024-01-16T09:15:00'), note: 'Critical safety hazard reported', userId: 'citizen_9876543211', userName: 'Priya Sharma' }
    ],
    comments: []
  },
  {
    id: 'FMT003',  
    title: 'Water supply irregular in Residential Area',
    description: 'Water supply has been irregular for the past month in Phase 2 residential area. Residents are facing severe water shortage.',
    category: 'water',
    status: 'escalated',
    priority: 'high',
    location: {
      address: 'Phase 2 Residential Area, Narsipatnam',
      coordinates: { lat: 17.6855, lng: 82.6095 }
    },
    images: [],
    citizenId: 'citizen_9876543212',
    assignedTo: 'dept_head_002',
    assignedDepartment: 'Water Supply',
    submittedAt: new Date('2024-01-10T16:45:00'),
    updatedAt: new Date('2024-01-15T11:30:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-10T16:45:00'), note: 'Complaint submitted', userId: 'citizen_9876543212', userName: 'Arjun Reddy' },
      { status: 'in_progress', timestamp: new Date('2024-01-12T10:00:00'), note: 'Investigation started', userId: 'field_staff_003', userName: 'Suresh Babu' },
      { status: 'escalated', timestamp: new Date('2024-01-15T11:30:00'), note: 'Escalated to department head due to complexity', userId: 'field_staff_003', userName: 'Suresh Babu' }
    ],
    comments: [
      {
        id: 'c2',
        complaintId: 'FMT003',
        userId: 'dept_head_002',
        userName: 'Sri. Venkat Rao',
        userRole: 'department_head',
        content: 'Issue requires pipeline infrastructure upgrade. Coordinating with municipal budget committee.',
        timestamp: new Date('2024-01-15T14:00:00'),
        type: 'comment'
      }
    ]
  },
  {
    id: 'FMT004',
    title: 'Garbage not collected for 3 days',
    description: 'Garbage collection has been missed for the past 3 days in Ward 5. The accumulated waste is creating hygiene issues.',
    category: 'garbage',
    status: 'resolved',
    priority: 'medium',
    location: {
      address: 'Ward 5, Narsipatnam',
      coordinates: { lat: 17.6845, lng: 82.6120 }
    },
    images: [],
    citizenId: 'citizen_9876543213',
    assignedTo: 'field_staff_002',
    assignedDepartment: 'Sanitation',
    submittedAt: new Date('2024-01-12T08:00:00'),
    updatedAt: new Date('2024-01-14T17:30:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-12T08:00:00'), note: 'Complaint submitted', userId: 'citizen_9876543213', userName: 'Meena Devi' },
      { status: 'in_progress', timestamp: new Date('2024-01-13T09:00:00'), note: 'Garbage collection team notified', userId: 'field_staff_002', userName: 'Suresh Babu' },
      { status: 'resolved', timestamp: new Date('2024-01-14T17:30:00'), note: 'Garbage collected and schedule normalized', userId: 'field_staff_002', userName: 'Suresh Babu' }
    ],
    comments: [
      {
        id: 'c3',
        complaintId: 'FMT004',
        userId: 'field_staff_002',
        userName: 'Suresh Babu',
        userRole: 'field_staff',
        content: 'Garbage collection completed. Route optimization implemented to prevent future delays.',
        timestamp: new Date('2024-01-14T17:45:00'),
        type: 'comment'
      }
    ]
  },
  {
    id: 'FMT005',
    title: 'Power outage in Commercial Area',
    description: 'Frequent power outages in the commercial area affecting business operations. Power cuts lasting 2-3 hours daily.',
    category: 'electricity',
    status: 'in_progress',
    priority: 'high',
    location: {
      address: 'Commercial Area, Narsipatnam',
      coordinates: { lat: 17.6890, lng: 82.6130 }
    },
    images: [],
    citizenId: 'citizen_9876543214',
    assignedTo: 'field_staff_003',
    submittedAt: new Date('2024-01-14T11:20:00'),
    updatedAt: new Date('2024-01-16T10:15:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-14T11:20:00'), note: 'Complaint submitted' },
      { status: 'in_progress', timestamp: new Date('2024-01-16T10:15:00'), note: 'Electrical team investigating transformer issues' }
    ]
  },
  {
    id: 'FMT006',
    title: 'Broken water pipe flooding the street',
    description: 'Water pipe burst near Temple Street causing flooding. Water is going waste and creating traffic problems.',
    category: 'water',
    status: 'resolved',
    priority: 'high',
    location: {
      address: 'Temple Street, Narsipatnam',
      coordinates: { lat: 17.6860, lng: 82.6105 }
    },
    images: [],
    citizenId: 'citizen_9876543215',
    assignedTo: 'field_staff_001',
    submittedAt: new Date('2024-01-11T14:30:00'),
    updatedAt: new Date('2024-01-13T16:45:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-11T14:30:00'), note: 'Complaint submitted' },
      { status: 'in_progress', timestamp: new Date('2024-01-12T08:00:00'), note: 'Emergency repair team dispatched' },
      { status: 'resolved', timestamp: new Date('2024-01-13T16:45:00'), note: 'Pipe repaired and water supply restored', userId: 'field_staff_001', userName: 'Ravi Kumar' }
    ],
    assignedDepartment: 'Water Supply',
    comments: []
  },
  {
    id: 'FMT007',
    title: 'Building collapse risk - immediate evacuation needed',
    description: 'Old municipal building showing severe structural damage with visible cracks. Immediate evacuation and assessment required to prevent potential collapse.',
    category: 'other',
    status: 'open',
    priority: 'critical',
    location: {
      address: 'Old Municipal Building, Center Road, Narsipatnam',
      coordinates: { lat: 17.6670, lng: 82.6110 }
    },
    images: [],
    citizenId: 'citizen_9876543216',
    assignedDepartment: 'Administration',
    submittedAt: new Date('2024-01-17T08:30:00'),
    updatedAt: new Date('2024-01-17T08:30:00'),
    timeline: [
      { status: 'open', timestamp: new Date('2024-01-17T08:30:00'), note: 'CRITICAL: Structural safety concern reported', userId: 'citizen_9876543216', userName: 'Dr. Srinivas' }
    ],
    comments: []
  },
  {
    id: 'FMT008',
    title: 'Street vendor encroachment blocking traffic',
    description: 'Unauthorized street vendors have set up stalls blocking the main pedestrian path and creating traffic issues.',
    category: 'other',
    status: 'pending',
    priority: 'low',
    location: {
      address: 'Market Street, Narsipatnam',
      coordinates: { lat: 17.6680, lng: 82.6125 }
    },
    images: [],
    citizenId: 'citizen_9876543217',
    assignedDepartment: 'Administration',
    submittedAt: new Date('2024-01-16T14:20:00'),
    updatedAt: new Date('2024-01-16T14:20:00'),
    timeline: [
      { status: 'pending', timestamp: new Date('2024-01-16T14:20:00'), note: 'Encroachment issue reported', userId: 'citizen_9876543217', userName: 'Ramesh Babu' }
    ],
    comments: []
  }
];

export const mockUsers: User[] = [
  {
    id: 'super_admin_001',
    name: 'Dr. Ramesh Kumar',
    mobile: '9876543200',
    role: 'super_admin',
    department: 'Administration'
  },
  {
    id: 'dept_head_001',
    name: 'Smt. Priya Sharma',
    mobile: '9876543201',
    role: 'department_head',
    department: 'Public Works'
  },
  {
    id: 'dept_head_002',
    name: 'Sri. Venkat Rao',
    mobile: '9876543202',
    role: 'department_head',
    department: 'Water Supply'
  },
  {
    id: 'field_staff_001',
    name: 'Ravi Kumar',
    mobile: '9876543203',
    role: 'field_staff',
    department: 'Electrical'
  },
  {
    id: 'field_staff_002',
    name: 'Suresh Babu',
    mobile: '9876543204',
    role: 'field_staff',
    department: 'Sanitation'
  },
  {
    id: 'field_staff_003',
    name: 'Mahesh Reddy',
    mobile: '9876543205',
    role: 'field_staff',
    department: 'Water Supply'
  },
  {
    id: 'dept_head_003',
    name: 'Smt. Lakshmi Devi',
    mobile: '9876543206',
    role: 'department_head',
    department: 'Electrical'
  },
  {
    id: 'dept_head_004',
    name: 'Sri. Ravi Teja',
    mobile: '9876543207',
    role: 'department_head',
    department: 'Sanitation'
  },
  {
    id: 'field_staff_004',
    name: 'Krishna Murthy',
    mobile: '9876543208',
    role: 'field_staff',
    department: 'Electrical'
  },
  {
    id: 'field_staff_005',
    name: 'Sita Rama',
    mobile: '9876543209',
    role: 'field_staff',
    department: 'Electrical'
  },
  {
    id: 'field_staff_006',
    name: 'Gopi Krishna',
    mobile: '9876543210',
    role: 'field_staff',
    department: 'Sanitation'
  }
];

export const getComplaintsByUser = (userId: string): Complaint[] => {
  return mockComplaints.filter(complaint => complaint.citizenId === userId);
};

export const getComplaintsByAssignee = (userId: string): Complaint[] => {
  return mockComplaints.filter(complaint => complaint.assignedTo === userId);
};

export const getComplaintStats = () => {
  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === 'pending').length;
  const inProgress = mockComplaints.filter(c => c.status === 'in_progress').length;
  const resolved = mockComplaints.filter(c => c.status === 'resolved').length;
  const escalated = mockComplaints.filter(c => c.status === 'escalated').length;

  return { total, pending, inProgress, resolved, escalated };
};

export const getComplaintsByCategory = () => {
  const categories = ['roads', 'water', 'electricity', 'garbage', 'streetlight', 'other'];
  return categories.map(category => ({
    category,
    count: mockComplaints.filter(c => c.category === category).length
  }));
};