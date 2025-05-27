import {create} from 'zustand'

export const zustandStore = create((set)=>({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  
    messages: [],
    setMessages: (messages) => set({ messages }),
  
    activeTab: 'messages',
    setActiveTab: (tabName) => set({ activeTab: tabName }),
}))