import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import userGetAllUsers from "../../context/userGetAllUsers";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/TranslationContext";
function Search() {
  const { setSelectedConversation, clearUnreads, sidebarSearch, setSidebarSearch } = useConversation();
  const [allUsers] = userGetAllUsers();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sidebarSearch) return;
    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      clearUnreads(conversation._id);
      setSidebarSearch("");
    }
    else {
      toast.error("User not found");
    }
  };
  return (
    <div className="p-4 bg-base-100">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-base-content/30 group-focus-within:text-primary transition-colors">
            <FaSearch size={14} />
          </div>
          <input
            type="text"
            className="w-full bg-base-200 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium placeholder:text-base-content/30 focus:bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder={t('search')}
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}

export default Search;