import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../zustand/useConversation.js";
import { useAuth } from "../../context/Authprovider.jsx";
import { CiMenuFries } from "react-icons/ci";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import useMarkSeen from "../../context/useMarkSeen.js";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  useGetSocketMessage();
  useMarkSeen();
  useEffect(() => {
    return setSelectedConversation(null);
  }, [setSelectedConversation]);
  return (
    <div className="w-full h-full bg-base-100 text-base-content relative flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <Chatuser />
          <div
            className="flex-1 hide-scroll overflow-y-auto px-4 py-2"
          >
            <Messages />
          </div>
          <Typesend />
        </>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
  return (
    <div className="relative flex-1 h-full flex flex-col justify-center items-center">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-ghost drawer-button lg:hidden absolute left-5 top-5"
        >
          <CiMenuFries className="text-white text-xl" />
        </label>
        <div className="text-center p-10 max-w-md animate-in fade-in zoom-in duration-500">
          <div className="mb-4 inline-block p-4 bg-primary/10 rounded-full text-primary">
             <CiMenuFries size={48} className="opacity-20" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light">
            Welcome, <span className="font-black text-primary">{authUser.user.fullname}</span>
          </h1>
          <p className="mt-4 text-base-content/60 font-medium leading-relaxed">
            No chat selected. Choose a contact from the sidebar to start a conversation or create a group!
          </p>
        </div>
    </div>
  );
};