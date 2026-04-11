import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

interface AuthenticatedRequest extends express.Request {
  user?: string | JwtPayload;
}

// ─── DEEP DIAGNOSTITCS (DEBUG ONLY) ───
console.log('[System] Current Directory:', process.cwd());
console.log('[System] Environment Status:', {
  PORT: process.env.PORT || '3001',
  GAS_URL_DETECTED: !!process.env.VITE_GAS_URL,
  GAS_URL_PREVIEW: process.env.VITE_GAS_URL ? `${process.env.VITE_GAS_URL.substring(0, 30)}...` : 'NONE'
});

// Update modelMap for diaries
const modelMap: Record<string, keyof PrismaClient> = {
  users: 'user',
  classes: 'class',
  homework: 'homework',
  submissions: 'submission',
  teacherClasses: 'teacherClass',
  feeRecords: 'feeRecord',
  expenses: 'expense',
  announcements: 'announcement',
  attendance: 'attendanceRecord',
  examResults: 'examResult',
  admissions: 'admissionApplication',
  contactInquiries: 'contactInquiry',
  news: 'newsItem',
  inventory: 'inventoryItem',
  diaries: 'diary',
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'bls-super-secret-key-2026';
const GAS_URL = process.env.VITE_GAS_URL || '';

/**
 * ─── Google Apps Script Sync (Server-Side) ───
 * Sends form data to GAS for dual-recipient email notifications & sheet mirroring.
 */
async function syncToGAS(data: Record<string, unknown>, type: 'admission' | 'inquiry' | 'diary') {
  if (!GAS_URL) {
    console.warn('[GAS Sync] VITE_GAS_URL not found in environment config.');
    return;
  }
  
  console.log(`[GAS Sync] Initiating ${type} notification via SUPER-RELIABLE GET BRIDGE...`);
  try {
    // We use GET for maximum compatibility with Google Apps Script doGet(e)
    const params = new URLSearchParams({ ...data, type });
    const targetUrl = `${GAS_URL}?${params.toString()}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log(`[GAS Sync] ${type} packet delivered successfully.`);
    } else {
      console.error(`[GAS Sync] ${type} delivery failed: ${response.statusText}`);
    }
  } catch (err) {
    console.error(`[GAS Sync] CRITICAL ERROR during ${type} transmission:`, (err as Error).message);
  }
}

app.use(cors());
app.use(express.json());

// ─── HEALTH CHECK & DB STABILITY ───
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', socket: 'active' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'disconnected', error: (err as Error).message });
  }
});

// ─── STARTUP DATABASE CHECK ───
const checkDatabase = async () => {
  try {
    console.log('[Prisma] Initiating heartbeat check...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Prisma] Database heartbeat: Operational.');
  } catch (err) {
    console.error('[Prisma] Connection Critical:', (err as Error).message);
    console.warn('[System] Entering DEGRADED mode. Features requiring DB will fail gracefully.');
  }
};
checkDatabase();

// ─── SOCKET.IO SYNC & PAYLOADS ───
io.on('connection', (socket) => {
  console.log('[Socket] Peer connected:', socket.id);
  socket.on('disconnect', () => console.log('[Socket] Peer disconnected'));
});

// Standardized broadcast for Powerful Data Flow
const broadcastSync = (resource: string, action: string, data?: Record<string, unknown>) => {
  const payload = { 
    resource, 
    action, 
    id: data?.id,
    timestamp: new Date().toISOString() 
  };
  console.log(`[Socket] Broadcasting synchronization: ${resource}:${action}`);
  io.emit('data-updated', payload);
};

// ─── UTILITIES & ID GENERATION ───
const generateSchoolId = (role: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const prefixes: Record<string, string> = {
    admin: 'ADM', accountant: 'ACC', principal: 'PRN', 
    teacher: 'TCH', student: 'STU', parent: 'PAR'
  };

  const rolePrefix = prefixes[role] || 'USR';
  const session = role === 'student' ? 'ACAD' : 'FAC';
  const hex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
  
  return `${rolePrefix}-${year}${month}-${session}-${hex}`;
};


// ─── AUTHENTICATION ───
app.post('/auth/login', async (req, res) => {
  const { schoolId, password } = req.body;
  if (!schoolId || !password) return res.status(400).json({ error: 'Missing credentials' });
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        schoolId: { equals: schoolId },
        status: 'active'
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid school ID or account inactive.' });
    }
    
    // Password check with fallback for older unhashed DB seeds
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
    }
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }
    
    // Create safe user object without password
    const safeUser = { ...user };
    // @ts-expect-error - password is required in the DB model but we strip it for the client
    delete safeUser.password;
    
    // Provide an encrypted JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId: user.schoolId }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── JWT & RBAC MIDDLEWARE ───
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Public Paths Exemption: Allow guest access for forms & sync
  const publicPaths = ['/auth/login', '/health', '/admissions', '/contactInquiries'];
  
  // Also check if it starts with these paths (for GET /admissions/:id)
  const isPublic = publicPaths.some(path => req.path.startsWith(path));
  if (isPublic) return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided. Access denied.' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token is invalid or expired.' });
    (req as AuthenticatedRequest).user = decoded;
    next();
  });
};

const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    const userRole = (req.user as JwtPayload)?.role;
    if (!req.user || !roles.includes(userRole)) {
      return res.status(403).json({ error: `Security Violation: Action restricted to ${roles.join(' or ')}.` });
    }
    next();
  };
};

// ─── PUBLIC ANONYMOUS ROUTES ───
// These routes must stay ABOVE the authenticateToken middleware
app.post('/admissions', async (req, res) => {
  try {
    const data = { ...req.body };
    for (const k in data) {
      if (typeof data[k] === 'object' && data[k] !== null) data[k] = JSON.stringify(data[k]);
    }
    const created = await prisma.admissionApplication.create({ data });
    broadcastSync('admissions', 'create', created);
    
    // Server-Side Notification Bridge (Mirroring to GAS)
    syncToGAS(created, 'admission');

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/contactInquiries', async (req, res) => {
  try {
    const data = { ...req.body };
    for (const k in data) {
      if (typeof data[k] === 'object' && data[k] !== null) data[k] = JSON.stringify(data[k]);
    }
    const created = await prisma.contactInquiry.create({ data });
    broadcastSync('contactInquiries', 'create', created);
    
    // Server-Side Notification Bridge (Mirroring to GAS)
    syncToGAS(created, 'inquiry');

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/admissions/:id', async (req, res) => {
  try {
    const item = await prisma.admissionApplication.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/contactInquiries/:id', async (req, res) => {
  try {
    const item = await prisma.contactInquiry.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Apply Global Protection to all other routes
app.use(authenticateToken as express.RequestHandler);

// Generic GET all / query
app.get('/:resource', async (req, res) => {
  const modelName = modelMap[req.params.resource];
  if (!modelName) return res.status(404).json({ error: 'Resource not found' });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = prisma[modelName] as any;
  const where: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'role_like') {
      where['role'] = { contains: value as string };
    } else if (key === 'targetRoles_like') {
      where['targetRoles'] = { contains: value as string };
    } else if (key === 'schoolId') {
      where['schoolId'] = value as string;
    } else {
      where[key] = value;
    }
  }

  try {
    const items = await model.findMany({ where });
    // Parse JSON strings back to arrays/objects for the frontend exactly like json-server
    const parsedItems = items.map((item: Record<string, unknown>) => {
      const parsed = { ...item };
      if (modelName === 'user') delete parsed.password; // CRITICAL: Strip passwords
      for (const k in parsed) {
        if (typeof parsed[k] === 'string' && (parsed[k].startsWith('[') || parsed[k].startsWith('{'))) {
          try { parsed[k] = JSON.parse(parsed[k] as string); } catch { /* ignore */ }
        }
      }
      return parsed;
    });
    res.json(parsedItems);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/:resource/:id', async (req, res) => {
  const modelName = modelMap[req.params.resource];
  if (!modelName) return res.status(404).json({ error: 'Resource not found' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = prisma[modelName] as any;

  try {
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const parsed = { ...item } as Record<string, unknown>;
    if (modelName === 'user') delete parsed.password; // CRITICAL: Strip passwords
    for (const k in parsed) {
      if (typeof parsed[k] === 'string' && ((parsed[k] as string).startsWith('[') || (parsed[k] as string).startsWith('{'))) {
        try { parsed[k] = JSON.parse(parsed[k] as string); } catch { /* ignore */ }
      }
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Generic POST
app.post('/:resource', async (req, res) => {
  const resource = req.params.resource;
  const modelName = modelMap[resource];
  if (!modelName) return res.status(404).json({ error: 'Resource not found' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = prisma[modelName] as any;

  // RBAC Enforcement (Admissions and Inquiries are EXEMPT from RBAC because they are public)
  const user = (req as AuthenticatedRequest).user as JwtPayload | undefined;
  if (!['admissions', 'contactInquiries'].includes(resource)) {
    if (!user || !['admin', 'principal'].includes(user.role)) {
      if (['users', 'classes', 'feeRecords', 'expenses', 'announcements', 'inventory'].includes(resource)) {
        return res.status(403).json({ error: 'Security Violation: Administrative clearance required for this record creation.' });
      }
    }
  }

  try {
    const data = { ...req.body };
    
    // SERVER-SIDE LOGIC STRENGTHENING
    if (modelName === 'user') {
      // Auto-generate schoolId if missing (Professional ID System)
      if (!data.schoolId) {
        data.schoolId = generateSchoolId(data.role || 'student');
      }
      // Hash password
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
    }

    for (const k in data) {
      if (typeof data[k] === 'object' && data[k] !== null) {
        data[k] = JSON.stringify(data[k]);
      }
    }
    const created = await model.create({ data });
    
    // Check if we need to sync with GAS (Admissions is handled by its own POST route, 
    // but Diaries and other features are caught here)
    if (resource === 'diaries') {
      try {
        // Find parents of the class to notify
        const parents = await prisma.user.findMany({
          where: { 
            role: 'parent',
            studentIds: { contains: req.body.classId } // Rough check for parent/student link
          }
        });
        
        for (const parent of parents) {
          if (parent.email) {
            syncToGAS({
              ...req.body,
              parentEmail: parent.email,
              parentName: parent.name,
              id: created.id
            }, 'diary');
          }
        }
      } catch (gasErr) {
        console.error('[Diary Sync] Parental notification error:', gasErr);
      }
    }

    // Broadcast real-time update
    broadcastSync(resource, 'create', created);

    // Parse back before sending response
    const parsed = { ...created } as Record<string, unknown>;
    if (modelName === 'user') delete parsed.password; 
    for (const k in parsed) {
      if (typeof parsed[k] === 'string' && ((parsed[k] as string).startsWith('[') || (parsed[k] as string).startsWith('{'))) {
        try { parsed[k] = JSON.parse(parsed[k] as string); } catch { /* ignore */ }
      }
    }
    res.status(201).json(parsed);
  } catch (err) {
    const error = err as Error;
    console.error(`[POST Error] ${resource}:`, error.message);
    res.status(500).json({ error: 'Data persistence error', details: error.message });
  }
});

// Generic PATCH
app.patch('/:resource/:id', async (req, res) => {
  const resource = req.params.resource;
  const modelName = modelMap[resource];
  if (!modelName) return res.status(404).json({ error: 'Resource not found' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = prisma[modelName] as any;

  try {
    const data = { ...req.body };
    delete data.id; // Prevent updating PK
    if (modelName === 'user' && data.password) {
      if (!data.password.startsWith('$2a$') && !data.password.startsWith('$2b$')) {
        data.password = await bcrypt.hash(data.password, 10);
      }
    }
    for (const k in data) {
      if (typeof data[k] === 'object' && data[k] !== null) {
        data[k] = JSON.stringify(data[k]);
      }
    }
    const updated = await model.update({ where: { id: req.params.id }, data });
    
    // Broadcast real-time update
    broadcastSync(resource, 'update', { id: req.params.id });

    const parsed = { ...updated } as Record<string, unknown>;
    for (const k in parsed) {
      if (typeof parsed[k] === 'string' && ((parsed[k] as string).startsWith('[') || (parsed[k] as string).startsWith('{'))) {
        try { parsed[k] = JSON.parse(parsed[k] as string); } catch { /* ignore */ }
      }
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Generic DELETE
app.delete('/:resource/:id', async (req, res) => {
  const resource = req.params.resource;
  const modelName = modelMap[resource];
  if (!modelName) return res.status(404).json({ error: 'Resource not found' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = prisma[modelName] as any;

  try {
    await model.delete({ where: { id: req.params.id } });
    
    // Broadcast real-time deletion
    broadcastSync(resource, 'delete', { id: req.params.id });

    res.json({});
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Express server + High-Integrity Sync running on http://localhost:${PORT}`);
});

// ─── GLOBAL ERROR HANDLER ───
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Fatal Error]:', err);
  res.status(500).json({ error: 'Internal system fault. Administrative logs recorded.' });
});
