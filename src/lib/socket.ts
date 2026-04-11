import { io } from 'socket.io-client';
import { dispatchCustomEvent, EVENTS } from './events';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Initialize the institutional sync socket
export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true
});

socket.on('connect', () => {
  console.log('[Real-time] Connected to institutional data sync channel.');
  // Trigger a global refresh on reconnect to ensure consistency
  dispatchCustomEvent('socket-connected');
});

socket.on('disconnect', () => {
  console.log('[Real-time] Disconnected from sync channel.');
  dispatchCustomEvent('socket-disconnected');
});

// Real-time Event Bridge
socket.on('data-updated', (payload: { resource: string, action: string }) => {
  const { resource, action } = payload;
  console.log(`[Real-time] Server Push: ${resource} ${action}`);

  const eventMap: Record<string, string> = {
    'users': EVENTS.USER_CHANGE,
    'classes': EVENTS.CLASS_CHANGE,
    'homework': EVENTS.HOMEWORK_CHANGE,
    'submissions': EVENTS.SUBMISSION_CHANGE,
    'feeRecords': EVENTS.FEE_CHANGE,
    'expenses': EVENTS.EXPENSE_CHANGE,
    'announcements': EVENTS.ANNOUNCEMENT_CHANGE,
    'attendance': EVENTS.ATTENDANCE_CHANGE,
    'admissions': EVENTS.ADMISSION_CHANGE,
    'contactInquiries': EVENTS.INQUIRY_CHANGE,
    'news': EVENTS.NEWS_CHANGE,
    'inventory': EVENTS.INVENTORY_CHANGE,
    'teacherClasses': EVENTS.CLASS_CHANGE
  };

  const eventToFire = eventMap[resource];
  if (eventToFire) {
    console.log(`[Real-time] Orchestrating local sync for ${eventToFire}`);
    dispatchCustomEvent(eventToFire);
    
    // Notify the user about the background sync
    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/([A-Z])/g, ' $1');
    toast.info(`Real-time Sync: ${resourceName} ${action}d`, {
      description: `Your view has been automatically updated.`,
      duration: 3000,
    });
  }
});
