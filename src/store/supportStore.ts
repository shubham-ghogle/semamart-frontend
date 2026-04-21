// src/store/supportStore.ts
import { create } from "zustand";
import { SupportTicket } from "../Types/types";
import { API_URL } from "@/data";

const apiBase = API_URL;

type SupportStore = {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (userType?: "User" | "Seller" | "Admin") => Promise<void>;
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

    fetchTickets: async (userType?: "User" | "Seller" | "Admin") => {
      set({ loading: true, error: null });
      try {
        let url = `${apiBase}support/all`;

        if (userType === "User") {
          url = `${apiBase}support/user-tickets`;
        } else if (userType === "Seller") {
          url = `${apiBase}support/seller-tickets`;
        }

        const res = await fetch(url, { credentials: "include" });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const tickets = data.tickets || [];

        set({ tickets, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    createTicket: async (ticketData) => {
      set({ loading: true, error: null });
      try {
        const formData = new FormData();
        formData.append("userType", ticketData.userType || "");
        formData.append("user", ticketData.user || "");
        formData.append("topic", ticketData.topic || "");
        formData.append("message", ticketData.message || "");

        if (ticketData.documents && ticketData.documents.length > 0) {
          const fileArray =
            ticketData.documents instanceof FileList
              ? Array.from(ticketData.documents)
              : ticketData.documents;

          fileArray.forEach((file: File) => {
            formData.append("documents", file);
          });
        }

        const res = await fetch(`${apiBase}support/create`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          let errorMessage = "Failed to create ticket";
          try {
            const errorData = await res.json();
            errorMessage = errorData?.message || errorMessage;
          } catch (_error) {}
          throw new Error(errorMessage);
        }

        const data = await res.json();
        const newTicket = data.ticket;

        if (!newTicket) {
          throw new Error("Ticket was not returned by the server");
        }

        set((state) => ({
          tickets: [...state.tickets, newTicket],
          loading: false,
        }));

        return newTicket;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to create ticket";
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    updateTicketStatus: async (ticketId, status) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${apiBase}support/${ticketId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          throw new Error("Failed to update ticket status");
        }

        const data = await res.json();
        const updatedTicket = data.ticket;

        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket._id === ticketId ? updatedTicket : ticket
          ),
          loading: false,
        }));
      } catch (_error) {
        set({ error: "Failed to update ticket status", loading: false });
      }
    },

    addMessage: async (ticketId, messageData) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${apiBase}support/${ticketId}/message`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(messageData),
        });

        if (!res.ok) {
          throw new Error("Failed to add message");
        }

        const data = await res.json();
        const updatedTicket = data.ticket;

        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket._id === ticketId ? updatedTicket : ticket
          ),
          loading: false,
        }));
      } catch (_error) {
        set({ error: "Failed to add message", loading: false });
      }
    },

    getTicketById: (id: string) => {
      return get().tickets.find((ticket) => ticket._id === id);
    },

    clearError: () => set({ error: null }),
  };
});
