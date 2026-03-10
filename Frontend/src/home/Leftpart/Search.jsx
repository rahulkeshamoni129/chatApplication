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
    <div className="h-[10vh] border-b border-base-200 w-full flex items-center bg-base-100">
      <div className="px-6 w-full mt-2">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex space-x-3 w-full items-center">
            <label className="input input-bordered input-sm rounded-full flex items-center gap-2 w-full bg-base-200 border-none shadow-inner focus-within:shadow-none focus-within:bg-base-100 focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="text"
                className="grow text-sm"
                placeholder={t('search')}
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-circle btn-sm btn-ghost hover:bg-base-200">
              <FaSearch className="text-base-content/70" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Search;