import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import userGetAllUsers from "../../context/userGetAllUsers";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";
function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = userGetAllUsers();
  const { setSelectedConversation, clearUnreads } = useConversation();
  console.log(allUsers);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(search.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      clearUnreads(conversation._id);
      setSearch("");
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
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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