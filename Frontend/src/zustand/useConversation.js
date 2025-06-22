import { create } from 'zustand'
import Messages from '../home/Rightpart/Messages'
//when a we click on person that particular chat should open
  

const useConversation = create((set) => ({

  selectedConversation:  null,
  //at first it should be null it should not display any chat
  setSelectedConversation: (selectedConversation) => set({selectedConversation}),
    messages:[],
    setMessage:(messages)=>set({messages})
}))
export default useConversation
