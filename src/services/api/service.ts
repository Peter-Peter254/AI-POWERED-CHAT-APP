class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  async fetchConversations() {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchConversations error:', error);
      throw error;
    }
  }

  async loadConversation(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/conversation/${id}/messages`);
      if (!response.ok) throw new Error('Failed to load conversation');
      return await response.json();
    } catch (error) {
      console.error('ApiService.loadConversation error:', error);
      throw error;
    }
  }

  async sendChatMessage(messages: any[], conversationId: string | null) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          conversation_id: conversationId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('ApiService.sendChatMessage error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();