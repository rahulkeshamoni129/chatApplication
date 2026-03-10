import { create } from 'zustand'

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  messages: [],
  setMessage: (messages) => set({ messages }),

  unreads: {},
  setUnreads: (unreads) => set({ unreads }),
  addUnread: (userId) => set((state) => ({
    unreads: { ...state.unreads, [userId]: (state.unreads[userId] || 0) + 1 }
  })),
  clearUnreads: (userId) => set((state) => {
    const newUnreads = { ...state.unreads };
    delete newUnreads[userId];
    return { unreads: newUnreads };
  }),

  updateMessage: (updatedMsg) => set((state) => ({
    messages: state.messages.map((m) => m._id === updatedMsg._id ? updatedMsg : m)
  })),

  editingMessage: null,
  setEditingMessage: (editingMessage) => set({ editingMessage }),

  replyingTo: null,
  setReplyingTo: (replyingTo) => set({ replyingTo }),

  pinnedChats: [],
  setPinnedChats: (pinnedChats) => set({ pinnedChats }),
  togglePin: (userId) => set((state) => {
    const isPinned = state.pinnedChats.includes(userId);
    const newPinned = isPinned
      ? state.pinnedChats.filter(id => id !== userId)
      : [...state.pinnedChats, userId];
    return { pinnedChats: newPinned };
  }),

  sidebarSearch: "",
  setSidebarSearch: (sidebarSearch) => set({ sidebarSearch })
}))
export default useConversation
