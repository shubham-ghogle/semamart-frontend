// src/store/supportStore.ts
import { create } from "zustand";
import { SupportTicket } from "../Types/types";
import { API_URL } from "@/data";

const apiBase = API_URL;

type SupportStore = {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (userType?: 'User' | 'Seller' | 'Admin') => Promise<void>;
  createTicket: (ticket: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  addMessage: (ticketId: string, message: any) => Promise<void>;
  getTicketById: (id: string) => SupportTicket | undefined;
  clearError: () => void;
};

export const useSupportStore = create<SupportStore>((set, get) => {
  return {
    tickets: [],
    loading: false,
    error: null,

    fetchTickets: async (userType?: 'User' | 'Seller' | 'Admin') => {
      set({ loading: true, error: null });
      try {
        let url = `${apiBase}support/all`;
        
        console.log('userType:', userType);
        
        if (userType === 'User') {
          url = `${apiBase}support/user-tickets`;
        } else if (userType === 'Seller') {
          url = `${apiBase}support/seller-tickets`;
        }
        
        console.log('Support: Fetching from', url);
        
        const res = await fetch(url, { credentials: 'include' });
        console.log('Support: Response status', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Support: Response data', data);
        
        const tickets = data.tickets || [];
        console.log('Support: Tickets count', tickets.length);
        
        set({ tickets, loading: false });
      } catch (error: any) {
        console.error('Support: Fetch error', error);
        set({ error: error.message, loading: false });
      }
    },

    createTicket: async (ticketData) => {
      set({ loading: true, error: null });
      try {
        console.log('Creating ticket with userType:', ticketData.userType);
        
        const documents: string[] = [];
        if (ticketData.documents && ticketData.documents.length > 0) {
          const fileArray = ticketData.documents instanceof FileList 
            ? Array.from(ticketData.documents) 
            : ticketData.documents;
          
          const fileReadTasks = fileArray.map((file: File) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            });
          });
          
          const base64Docs = await Promise.all(fileReadTasks);
          base64Docs.forEach(doc => {
            if (doc) documents.push(doc);
          });
        }
        
        console.log('Support: Creating ticket at', `${apiBase}support/create`);
        
        const res = await fetch(`${apiBase}support/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...ticketData,
            documents,
          }),
        });
        
        console.log('Support: Create response status', res.status);
        
        if (!res.ok) {
          throw new Error('Failed to create ticket');
        }
        
        const data = await res.json();
        console.log('Support: Create response', data);
        
        const newTicket = data.ticket;
        console.log('Support: New ticket created', newTicket);

        set(state => ({
          tickets: [...state.tickets, newTicket],
          loading: false
        }));
      } catch (error) {
        console.error('Support: Create error', error);
        set({ error: 'Failed to create ticket', loading: false });
      }
    },

    updateTicketStatus: async (ticketId, status) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${apiBase}support/${ticketId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to update ticket status');
        }
        
        const data = await res.json();
        const updatedTicket = data.ticket;

        set(state => ({
          tickets: state.tickets.map(ticket =>
            ticket._id === ticketId ? updatedTicket : ticket
          ),
          loading: false
        }));
      } catch (error) {
        set({ error: 'Failed to update ticket status', loading: false });
      }
    },

    addMessage: async (ticketId, messageData) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${apiBase}support/${ticketId}/message`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(messageData),
        });
        
        if (!res.ok) {
          throw new Error('Failed to add message');
        }
        
        const data = await res.json();
        const updatedTicket = data.ticket;

        set(state => ({
          tickets: state.tickets.map(ticket =>
            ticket._id === ticketId ? updatedTicket : ticket
          ),
          loading: false
        }));
      } catch (error) {
        set({ error: 'Failed to add message', loading: false });
      }
    },

    getTicketById: (id: string) => {
      return get().tickets.find(ticket => ticket._id === id);
    },

    clearError: () => set({ error: null }),
  };
});
  fetchTickets: (userType?: 'User' | 'Seller' | 'Admin') => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, '_id' | 'caseId' | 'createdAt' | 'updatedAt' | 'conversation' | 'status' | 'documents'> & { documents?: File[] }) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => Promise<void>;
  addMessage: (ticketId: string, message: Omit<SupportMessage, '_id'>) => Promise<void>;
  getTicketById: (id: string) => SupportTicket | undefined;
  clearError: () => void;
};

const sendEmailNotifications = (ticket: SupportTicket) => {
  // In a real app, this would send actual emails
  // For demo purposes, we'll just log the email content
  
  // Admin email - Always send to admin for all ticket types
  console.log('=== Admin Support Email ===');
  console.log('To: admin@semamart.com');
  if (ticket.userType === 'Seller') {
    console.log(`Subject: New Support Ticket from Seller – ${ticket.caseId}`);
  } else if (ticket.userType === 'Institute') {
    console.log(`Subject: New Support Ticket from Institute – ${ticket.caseId}`);
  } else {
    console.log(`Subject: New Support Ticket from Customer – ${ticket.caseId}`);
  }
  
  console.log('Content:');
  console.log(`Case ID: ${ticket.caseId}`);
  console.log(`User Type: ${ticket.userType}`);
  const userEmail = typeof ticket.user === 'string' ? ticket.user : ticket.user.email;
  console.log(`User Email: ${userEmail}`);
  console.log(`Topic: ${ticket.topic}`);
  console.log(`Message: ${ticket.message}`);
  console.log(`Created At: ${new Date(ticket.createdAt).toLocaleString()}`);
  if (ticket.documents.length > 0) {
    console.log(`Documents: ${ticket.documents.length} file(s)`);
  }
  console.log('==========================');

  // User confirmation email
  console.log('=== User Confirmation Email ===');
  console.log(`To: ${userEmail}`);
  console.log('Subject: Support Ticket Submitted Successfully');
  console.log('Content:');
  console.log(`Your support ticket has been submitted successfully.`);
  console.log(`Case ID: ${ticket.caseId}`);
  console.log(`Topic: ${ticket.topic}`);
  console.log(`We will respond to your query as soon as possible.`);
  console.log('===============================');
};

const sendAdminReplyEmail = (ticket: SupportTicket, message: SupportMessage) => {
  // Send email notification when admin replies to a ticket
  console.log('=== Admin Reply Email ===');
  const userEmail = typeof ticket.user === 'string' ? ticket.user : ticket.user.email;
  console.log(`To: ${userEmail}`);
  console.log(`Subject: Admin Reply on Support Ticket – ${ticket.caseId}`);
  console.log('Content:');
  console.log(`You have received a reply from the admin on your support ticket.`);
  console.log(`Case ID: ${ticket.caseId}`);
  console.log(`Topic: ${ticket.topic}`);
  console.log(`Reply: ${message.message}`);
  console.log(`Sent At: ${new Date().toLocaleString()}`);
  console.log('=========================');
};

// Create the support store
export const useSupportStore = create<SupportStore>((set, get) => {
  return {
    tickets: [],
    loading: false,
    error: null,

    fetchTickets: async (userType?: 'User' | 'Seller' | 'Admin') => {
      set({ loading: true, error: null });
      try {
        let url = 'http://localhost:8000/api/v2/support/all';
        if (userType === 'User') {
          url = 'http://localhost:8000/api/v2/support/user-tickets';
        } else if (userType === 'Seller') {
          url = 'http://localhost:8000/api/v2/support/seller-tickets';
        }

        const res = await fetch(url, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch tickets');
        }
        
        const data = await res.json();
        const tickets = data.tickets;
        
        console.log('Fetched tickets count:', tickets.length);
        console.log('Fetched tickets details:', tickets);
        set({ tickets, loading: false });
      } catch (error) {
        console.error('Error fetching tickets:', error);
        set({ error: 'Failed to fetch tickets', loading: false });
      }
    },

    createTicket: async (ticketData) => {
      set({ loading: true, error: null });
      try {
        console.log('Creating ticket with data:', ticketData);
        
        // Handle document uploads - in real app, this would upload to cloud storage
        const documents: string[] = [];
        if (ticketData.documents && ticketData.documents.length > 0) {
          // For demo purposes, we'll create dummy URLs
          ticketData.documents.forEach(file => {
            documents.push(`data:${file.type};base64,${btoa(file.name)}`);
          });
        }

        const res = await fetch('http://localhost:8000/api/v2/support/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...ticketData,
            documents,
          }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to create ticket');
        }
        
        const data = await res.json();
        const newTicket = data.ticket;

        console.log('New ticket created:', newTicket);

        set(state => {
          const updatedTickets = [...state.tickets, newTicket];
          return {
            tickets: updatedTickets,
            loading: false
          };
        });

        // Send email notifications
        sendEmailNotifications(newTicket);
      } catch (error) {
        console.error('Error creating ticket:', error);
        set({ error: 'Failed to create ticket', loading: false });
      }
    },

    updateTicketStatus: async (ticketId, status) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`http://localhost:8000/api/v2/support/${ticketId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to update ticket status');
        }
        
        const data = await res.json();
        const updatedTicket = data.ticket;

        set(state => {
          const updatedTickets = state.tickets.map(ticket =>
            ticket._id === ticketId
              ? updatedTicket
              : ticket
          );
          return {
            tickets: updatedTickets,
            loading: false
          };
        });

        // Send email notification for status update
        console.log('=== Status Update Email ===');
        console.log(`To: ${typeof updatedTicket.user === 'string' ? updatedTicket.user : updatedTicket.user.email}`);
        console.log(`Subject: Support Ticket Status Updated – ${updatedTicket.caseId}`);
        console.log('Content:');
        console.log(`Your support ticket status has been updated.`);
        console.log(`Case ID: ${updatedTicket.caseId}`);
        console.log(`New Status: ${status}`);
        console.log(`Updated At: ${new Date().toLocaleString()}`);
        console.log('===========================');
      } catch (error) {
        set({ error: 'Failed to update ticket status', loading: false });
      }
    },

    addMessage: async (ticketId, messageData) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`http://localhost:8000/api/v2/support/${ticketId}/message`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(messageData),
        });
        
        if (!res.ok) {
          throw new Error('Failed to add message');
        }
        
        const data = await res.json();
        const updatedTicket = data.ticket;

        set(state => {
          const updatedTickets = state.tickets.map(ticket =>
            ticket._id === ticketId
              ? updatedTicket
              : ticket
          );
          return {
            tickets: updatedTickets,
            loading: false
          };
        });

        // Send email notification for new message
        const ticket = get().tickets.find(t => t._id === ticketId);
        if (ticket) {
          // If admin is replying, send admin reply email
          if (messageData.from === 'Admin') {
            sendAdminReplyEmail(ticket, messageData);
          } else {
            // If user is sending a message, notify admin
            console.log('=== New Message Email (Admin Notification) ===');
            console.log('To: admin@semamart.com');
            console.log(`Subject: New Message on Support Ticket – ${ticket.caseId}`);
            console.log('Content:');
            console.log(`You have received a new message on support ticket ${ticket.caseId}.`);
            console.log(`From: ${messageData.from}`);
            console.log(`Message: ${messageData.message}`);
            console.log(`Sent At: ${new Date().toLocaleString()}`);
            console.log('==============================================');
          }
        }
      } catch (error) {
        set({ error: 'Failed to add message', loading: false });
      }
    },

    getTicketById: (id) => {
      return get().tickets.find(ticket => ticket._id === id || ticket.caseId === id);
    },

    clearError: () => set({ error: null }),
  };
});
