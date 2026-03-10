import { create } from 'zustand'

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  messages: [],
  setMessage: (messages) => set({ messages }),

  unreads: {},
  addUnread: (userId) => set((state) => ({
    unreads: { ...state.unreads, [userId]: (state.unreads[userId] || 0) + 1 }
  })),
  clearUnreads: (userId) => set((state) => {
    const newUnreads = { ...state.unreads };
    delete newUnreads[userId];
    return { unreads: newUnreads };
  })
}))
export default useConversation
