import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi, type AdminTicket, type AdminTicketDetail } from '../../../api/admin';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface UseAdminUserTicketsParams {
  userId: number | null;
  setActionLoading: (value: boolean) => void;
}

export function useAdminUserTickets({ userId, setActionLoading }: UseAdminUserTicketsParams) {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicketDetail | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [conversationSending, setConversationSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadTickets = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setTicketsLoading(true);
      const data = await adminApi.getTickets({ user_id: userId, per_page: 50 });
      setTickets(data.items);
      setTicketsTotal(data.total);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, [userId]);

  const loadTicketDetail = useCallback(async (ticketId: number) => {
    try {
      setTicketDetailLoading(true);
      const data = await adminApi.getTicket(ticketId);
      setSelectedTicket(data);
    } catch (error) {
      console.error('Failed to load ticket detail:', error);
    } finally {
      setTicketDetailLoading(false);
    }
  }, []);

  const handleTicketReply = useCallback(async () => {
    if (!selectedTicketId || !replyText.trim()) {
      return;
    }

    setReplySending(true);
    try {
      await adminApi.replyToTicket(selectedTicketId, replyText);
      setReplyText('');
      await loadTicketDetail(selectedTicketId);
      await loadTickets();
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setReplySending(false);
    }
  }, [loadTicketDetail, loadTickets, replyText, selectedTicketId]);

  const handleTicketStatusChange = useCallback(
    async (newStatus: string) => {
      if (!selectedTicketId) {
        return;
      }

      setActionLoading(true);
      try {
        await adminApi.updateTicketStatus(selectedTicketId, newStatus);
        await loadTicketDetail(selectedTicketId);
        await loadTickets();
      } catch (error) {
        console.error('Failed to update ticket status:', error);
      } finally {
        setActionLoading(false);
      }
    },
    [loadTicketDetail, loadTickets, selectedTicketId, setActionLoading],
  );

  const handleStartConversation = useCallback(
    async (message: string, title: string) => {
      if (!userId || !message.trim()) return null;
      setConversationSending(true);
      try {
        const ticket = await adminApi.createConversation(userId, message.trim(), title.trim());
        await loadTickets();
        setSelectedTicketId(ticket.id);
        setSelectedTicket(ticket);
        return ticket;
      } finally {
        setConversationSending(false);
      }
    },
    [loadTickets, userId],
  );

  useWebSocket({
    onMessage: (message) => {
      if (!message.type.startsWith('ticket.') || message.user_id !== userId) return;
      void loadTickets();
      if (message.ticket_id && message.ticket_id === selectedTicketId) {
        void loadTicketDetail(message.ticket_id);
      }
    },
  });

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetail(selectedTicketId);
    }
  }, [selectedTicketId, loadTicketDetail]);

  useEffect(() => {
    if (selectedTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  return {
    tickets,
    ticketsLoading,
    ticketsTotal,
    selectedTicketId,
    setSelectedTicketId,
    selectedTicket,
    setSelectedTicket,
    ticketDetailLoading,
    replyText,
    setReplyText,
    replySending,
    conversationSending,
    messagesEndRef,
    loadTickets,
    handleTicketReply,
    handleTicketStatusChange,
    handleStartConversation,
  };
}
