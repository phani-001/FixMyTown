import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Utility functions
const generateId = () => 'FMT' + Date.now().toString().slice(-6);
const generateUserId = (prefix: string) => prefix + '_' + Date.now().toString().slice(-6);

// Initialize some sample data if not exists
const initializeData = async () => {
  try {
    const existingComplaints = await kv.get('complaints') || [];
    if (existingComplaints.length === 0) {
      const sampleComplaints = [
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
          images: [],
          citizenId: 'citizen_' + Date.now(),
          assignedTo: 'field_staff_001',
          submittedAt: new Date('2024-01-15T10:30:00').toISOString(),
          updatedAt: new Date('2024-01-16T14:20:00').toISOString(),
          timeline: [
            { status: 'pending', timestamp: new Date('2024-01-15T10:30:00').toISOString(), note: 'Complaint submitted' },
            { status: 'in_progress', timestamp: new Date('2024-01-16T14:20:00').toISOString(), note: 'Assigned to field staff for inspection' }
          ]
        }
      ];
      await kv.set('complaints', sampleComplaints);
    }

    const existingUsers = await kv.get('users') || [];
    if (existingUsers.length === 0) {
      const sampleUsers = [
        {
          id: 'super_admin_001',
          name: 'Dr. Ramesh Kumar',
          mobile: '9876543200',
          role: 'super_admin',
          department: 'Administration',
          username: 'admin',
          password: 'admin123'
        },
        {
          id: 'dept_head_001',
          name: 'Smt. Priya Sharma',
          mobile: '9876543201',
          role: 'department_head',
          department: 'Public Works',
          username: 'depthead',
          password: 'dept123'
        },
        {
          id: 'field_staff_001',
          name: 'Ravi Kumar',
          mobile: '9876543203',
          role: 'field_staff',
          department: 'Electrical',
          username: 'fieldstaff',
          password: 'field123'
        }
      ];
      await kv.set('users', sampleUsers);
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Initialize data on startup
initializeData();

// Health check endpoint
app.get("/make-server-8f84e63c/health", (c) => {
  return c.json({ status: "ok" });
});

// Complaint endpoints
app.post("/make-server-8f84e63c/complaints", async (c) => {
  try {
    const body = await c.req.json();
    const complaints = await kv.get('complaints') || [];
    
    const newComplaint = {
      id: generateId(),
      title: body.title,
      description: body.description,
      category: body.category,
      status: 'pending',
      priority: body.priority || 'medium',
      assignedDepartment: body.assignedDepartment,
      location: body.location,
      images: body.images || [],
      citizenId: body.citizenId,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Complaint submitted',
          userId: body.citizenId,
          userName: body.citizenName || 'Citizen'
        }
      ],
      comments: []
    };

    complaints.push(newComplaint);
    await kv.set('complaints', complaints);

    return c.json({ success: true, complaint: newComplaint });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return c.json({ error: 'Failed to create complaint' }, 500);
  }
});

app.get("/make-server-8f84e63c/complaints", async (c) => {
  try {
    const complaints = await kv.get('complaints') || [];
    const { citizenId, assignedTo, status, category } = c.req.query();
    
    let filteredComplaints = complaints;
    
    if (citizenId) {
      filteredComplaints = filteredComplaints.filter(c => c.citizenId === citizenId);
    }
    if (assignedTo) {
      filteredComplaints = filteredComplaints.filter(c => c.assignedTo === assignedTo);
    }
    if (status) {
      filteredComplaints = filteredComplaints.filter(c => c.status === status);
    }
    if (category) {
      filteredComplaints = filteredComplaints.filter(c => c.category === category);
    }

    return c.json({ complaints: filteredComplaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return c.json({ error: 'Failed to fetch complaints' }, 500);
  }
});

app.get("/make-server-8f84e63c/complaints/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const complaints = await kv.get('complaints') || [];
    const complaint = complaints.find(c => c.id === id);
    
    if (!complaint) {
      return c.json({ error: 'Complaint not found' }, 404);
    }

    return c.json({ complaint });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return c.json({ error: 'Failed to fetch complaint' }, 500);
  }
});

app.put("/make-server-8f84e63c/complaints/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const complaints = await kv.get('complaints') || [];
    const complaintIndex = complaints.findIndex(c => c.id === id);
    
    if (complaintIndex === -1) {
      return c.json({ error: 'Complaint not found' }, 404);
    }

    const complaint = complaints[complaintIndex];
    const oldStatus = complaint.status;
    
    // Update complaint
    complaints[complaintIndex] = {
      ...complaint,
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Add timeline entry if status changed
    if (body.status && body.status !== oldStatus) {
      complaints[complaintIndex].timeline.push({
        status: body.status,
        timestamp: new Date().toISOString(),
        note: body.note || `Status changed to ${body.status}`
      });
    }

    await kv.set('complaints', complaints);

    return c.json({ success: true, complaint: complaints[complaintIndex] });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return c.json({ error: 'Failed to update complaint' }, 500);
  }
});

app.post("/make-server-8f84e63c/complaints/:id/assign", async (c) => {
  try {
    const id = c.req.param('id');
    const { assignedTo } = await c.req.json();
    const complaints = await kv.get('complaints') || [];
    const complaintIndex = complaints.findIndex(c => c.id === id);
    
    if (complaintIndex === -1) {
      return c.json({ error: 'Complaint not found' }, 404);
    }

    complaints[complaintIndex].assignedTo = assignedTo;
    complaints[complaintIndex].updatedAt = new Date().toISOString();
    complaints[complaintIndex].timeline.push({
      status: complaints[complaintIndex].status,
      timestamp: new Date().toISOString(),
      note: `Assigned to staff member`
    });

    await kv.set('complaints', complaints);

    return c.json({ success: true, complaint: complaints[complaintIndex] });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return c.json({ error: 'Failed to assign complaint' }, 500);
  }
});

app.delete("/make-server-8f84e63c/complaints/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const complaints = await kv.get('complaints') || [];
    const complaintIndex = complaints.findIndex(c => c.id === id);
    
    if (complaintIndex === -1) {
      return c.json({ error: 'Complaint not found' }, 404);
    }

    const deletedComplaint = complaints[complaintIndex];
    complaints.splice(complaintIndex, 1);
    await kv.set('complaints', complaints);

    console.log(`Complaint ${id} deleted successfully`);
    return c.json({ success: true, message: 'Complaint deleted successfully', complaint: deletedComplaint });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return c.json({ error: 'Failed to delete complaint' }, 500);
  }
});

// User endpoints
app.post("/make-server-8f84e63c/users", async (c) => {
  try {
    const body = await c.req.json();
    const users = await kv.get('users') || [];
    
    const newUser = {
      id: generateUserId('citizen'),
      name: body.name,
      mobile: body.mobile,
      role: 'citizen',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await kv.set('users', users);

    return c.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.get("/make-server-8f84e63c/users/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const users = await kv.get('users') || [];
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

app.get("/make-server-8f84e63c/users/mobile/:mobile", async (c) => {
  try {
    const mobile = c.req.param('mobile');
    const users = await kv.get('users') || [];
    const user = users.find(u => u.mobile === mobile);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user by mobile:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

app.get("/make-server-8f84e63c/users/staff", async (c) => {
  try {
    const users = await kv.get('users') || [];
    const staffUsers = users.filter(u => u.role !== 'citizen');
    
    // Remove passwords from response
    const staffWithoutPasswords = staffUsers.map(({ password, ...user }) => user);
    return c.json({ users: staffWithoutPasswords });
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return c.json({ error: 'Failed to fetch staff users' }, 500);
  }
});

// Authentication endpoints
app.post("/make-server-8f84e63c/auth/staff", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const users = await kv.get('users') || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error authenticating staff:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

app.post("/make-server-8f84e63c/auth/send-otp", async (c) => {
  try {
    const { mobile } = await c.req.json();
    
    console.log(`Sending OTP to mobile: ${mobile}`);
    
    // For demo purposes, use a simple OTP: 123456
    // In production, generate a random OTP
    const otp = "123456"; // Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      mobile,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
    
    await kv.set(`otp_${mobile}`, otpData);
    console.log(`Stored OTP data for ${mobile}:`, otpData);
    
    // In a real app, you would send SMS here
    console.log(`*** DEMO OTP for ${mobile}: ${otp} ***`);
    
    return c.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
});

app.post("/make-server-8f84e63c/auth/verify-otp", async (c) => {
  try {
    const { mobile, otp } = await c.req.json();
    
    console.log(`OTP verification attempt for mobile: ${mobile}, OTP: ${otp}`);
    
    const otpData = await kv.get(`otp_${mobile}`);
    console.log(`Stored OTP data:`, otpData);
    
    if (!otpData) {
      console.log('OTP not found or expired');
      return c.json({ error: 'OTP not found or expired' }, 400);
    }
    
    if (new Date() > new Date(otpData.expiresAt)) {
      await kv.del(`otp_${mobile}`);
      console.log('OTP expired');
      return c.json({ error: 'OTP expired' }, 400);
    }
    
    if (otpData.otp !== otp) {
      console.log(`Invalid OTP. Expected: ${otpData.otp}, Got: ${otp}`);
      return c.json({ error: 'Invalid OTP' }, 400);
    }
    
    // Delete OTP after successful verification
    await kv.del(`otp_${mobile}`);
    console.log('OTP verified successfully');
    
    // Get or create user
    const users = await kv.get('users') || [];
    let user = users.find(u => u.mobile === mobile);
    
    if (!user) {
      // Create new citizen user
      user = {
        id: generateUserId('citizen'),
        name: `Citizen User ${mobile.slice(-4)}`, // Better default name
        mobile,
        role: 'citizen',
        createdAt: new Date().toISOString()
      };
      
      users.push(user);
      await kv.set('users', users);
      console.log('Created new citizen user:', user);
    } else {
      console.log('Found existing user:', user);
    }
    
    return c.json({ success: true, user });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return c.json({ error: 'OTP verification failed' }, 500);
  }
});

// Analytics endpoints
app.get("/make-server-8f84e63c/analytics/stats", async (c) => {
  try {
    const complaints = await kv.get('complaints') || [];
    
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      escalated: complaints.filter(c => c.status === 'escalated').length,
      rejected: complaints.filter(c => c.status === 'rejected').length
    };
    
    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

app.get("/make-server-8f84e63c/analytics/categories", async (c) => {
  try {
    const complaints = await kv.get('complaints') || [];
    const categories = ['roads', 'water', 'electricity', 'garbage', 'streetlight', 'other'];
    
    const categoryStats = categories.map(category => ({
      category,
      count: complaints.filter(c => c.category === category).length
    }));
    
    return c.json({ categories: categoryStats });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return c.json({ error: 'Failed to fetch category stats' }, 500);
  }
});

app.get("/make-server-8f84e63c/analytics/trends", async (c) => {
  try {
    // Mock trend data - in a real app, you'd calculate this from actual data
    const trendData = [
      { month: 'Jan', complaints: 45, resolved: 38 },
      { month: 'Feb', complaints: 52, resolved: 45 },
      { month: 'Mar', complaints: 48, resolved: 42 },
      { month: 'Apr', complaints: 61, resolved: 55 },
      { month: 'May', complaints: 55, resolved: 49 },
      { month: 'Jun', complaints: 58, resolved: 52 }
    ];
    
    return c.json({ trends: trendData });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return c.json({ error: 'Failed to fetch trend data' }, 500);
  }
});

Deno.serve(app.fetch);