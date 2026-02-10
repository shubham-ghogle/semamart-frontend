// src/store/supportStore.ts
import { create } from "zustand";
import { SupportTicket, SupportMessage } from "../Types/types";

type SupportStore = {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTickets: () => Promise<void>;
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
  // Listen for changes to localStorage from other tabs/windows
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'supportTickets' && e.newValue) {
      console.log('Support tickets changed in other tab, updating state...');
      try {
        let tickets = JSON.parse(e.newValue);
        
        // Ensure all tickets have required fields for compatibility
        tickets = tickets.map((ticket: any) => ({
          ...ticket,
          userType: ticket.userType || 'Customer',
          status: ticket.status || 'New',
          createdAt: ticket.createdAt || new Date().toISOString(),
          updatedAt: ticket.updatedAt || new Date().toISOString(),
          conversation: ticket.conversation || [],
          documents: ticket.documents || []
        }));
        
        set({ tickets });
      } catch (error) {
        console.error('Error parsing tickets from storage event:', error);
      }
    }
  };

  // Add event listener for storage changes
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return {
    tickets: [],
    loading: false,
    error: null,

    fetchTickets: async () => {
      set({ loading: true, error: null });
      try {
        // TODO: Replace with actual API call
        // const res = await fetch('/api/support/tickets');
        // const tickets = await res.json();
        const storedTickets = localStorage.getItem('supportTickets');
        console.log('Stored tickets raw:', storedTickets);
        let tickets = storedTickets ? JSON.parse(storedTickets) : [];
        
        // Ensure all tickets have required fields for compatibility
        tickets = tickets.map((ticket: any) => ({
          ...ticket,
          userType: ticket.userType || 'Customer',
          status: ticket.status || 'New',
          createdAt: ticket.createdAt || new Date().toISOString(),
          updatedAt: ticket.updatedAt || new Date().toISOString(),
          conversation: ticket.conversation || [],
          documents: ticket.documents || []
        }));
        
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

        // Generate unique case ID with proper sequential numbering
        const prefix = ticketData.userType === 'Seller' ? 'S' : ticketData.userType === 'Institute' ? 'I' : 'U';
        
        // Find the highest existing case ID for this user type
        const existingTickets = get().tickets.filter(ticket => 
          ticket.caseId.startsWith(prefix)
        );
        
        let nextNumber = 1;
        if (existingTickets.length > 0) {
          const highestNumber = Math.max(...existingTickets.map(ticket => {
            const numericPart = ticket.caseId.slice(1);
            return parseInt(numericPart, 10);
          }));
          nextNumber = highestNumber + 1;
        }

        const caseId = prefix + nextNumber.toString().padStart(3, '0');

        // Mock creation - ensure user is properly stringified
        const newTicket: SupportTicket = {
          ...ticketData,
          _id: Date.now().toString(),
          caseId: caseId,
          status: 'New',
          conversation: [],
          documents: documents,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Store user as a string (email or id) to ensure consistency
          user: typeof ticketData.user === 'string' ? ticketData.user : ticketData.user.email || ticketData.user._id,
        };

        console.log('New ticket created:', newTicket);

        set(state => {
          const updatedTickets = [...state.tickets, newTicket];
          console.log('Updating localStorage with tickets:', updatedTickets);
          localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
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
        // TODO: Replace with actual API call
        // await fetch(`/api/support/tickets/${ticketId}/status`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status }),
        // });

        set(state => {
          const updatedTickets = state.tickets.map(ticket =>
            ticket._id === ticketId
              ? { ...ticket, status, updatedAt: new Date().toISOString() }
              : ticket
          );
          localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
          return {
            tickets: updatedTickets,
            loading: false
          };
        });

        // Send email notification for status update
        const updatedTicket = get().tickets.find(t => t._id === ticketId);
        if (updatedTicket) {
          console.log('=== Status Update Email ===');
          console.log(`To: ${typeof updatedTicket.user === 'string' ? updatedTicket.user : updatedTicket.user.email}`);
          console.log(`Subject: Support Ticket Status Updated – ${updatedTicket.caseId}`);
          console.log('Content:');
          console.log(`Your support ticket status has been updated.`);
          console.log(`Case ID: ${updatedTicket.caseId}`);
          console.log(`New Status: ${status}`);
          console.log(`Updated At: ${new Date().toLocaleString()}`);
          console.log('===========================');
        }
      } catch (error) {
        set({ error: 'Failed to update ticket status', loading: false });
      }
    },

    addMessage: async (ticketId, messageData) => {
      set({ loading: true, error: null });
      try {
        // TODO: Replace with actual API call
        // const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(messageData),
        // });
        // const newMessage = await res.json();

        // Mock adding message
        const newMessage: SupportMessage = {
          ...messageData,
          _id: Date.now().toString(),
        };

        set(state => {
          const updatedTickets = state.tickets.map(ticket =>
            ticket._id === ticketId
              ? {
                  ...ticket,
                  conversation: [...ticket.conversation, newMessage],
                  updatedAt: new Date().toISOString()
                }
              : ticket
          );
          localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
          return {
            tickets: updatedTickets,
            loading: false
          };
        });

        // Send email notification for new message
        const ticket = get().tickets.find(t => t._id === ticketId);
        if (ticket) {
          // If admin is replying, send admin reply email
          if (newMessage.from === 'Admin') {
            sendAdminReplyEmail(ticket, newMessage);
          } else {
            // If user is sending a message, notify admin
            console.log('=== New Message Email (Admin Notification) ===');
            console.log('To: admin@semamart.com');
            console.log(`Subject: New Message on Support Ticket – ${ticket.caseId}`);
            console.log('Content:');
            console.log(`You have received a new message on support ticket ${ticket.caseId}.`);
            console.log(`From: ${newMessage.from}`);
            console.log(`Message: ${newMessage.message}`);
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
