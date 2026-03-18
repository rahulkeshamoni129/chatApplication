import React from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { useAuth } from "./context/Authprovider";
import { Toaster } from "react-hot-toast";

import { Navigate, Route, Routes } from "react-router-dom";
import useConversation from "./zustand/useConversation";
import { useEffect } from "react";
import useGetSocketMessage from "./context/useGetSocketMessage";
import AdminDashboard from "./components/AdminDashboard";
import SecuritySync from "./components/SecuritySync";
import useTheme from "./zustand/useTheme";

function App() {
  const [authUser, setAuthUser] = useAuth();
  const { setPinnedChats } = useConversation();
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (authUser?.user?.pinnedChats) {
      setPinnedChats(authUser.user.pinnedChats);
    }
  }, [authUser, setPinnedChats]);

  // ALWAYS listen to socket events (new messages, unreads, etc.)
  useGetSocketMessage();

  console.log(authUser);
  return (
    <>
      <SecuritySync />
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              // <div className="flex h-screen">
              //   <Left />
              //   <Right />
              // </div>
              <div className="drawer lg:drawer-open h-[100dvh] w-full overflow-hidden text-base-content bg-base-100">
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col h-full overflow-hidden relative">
                  <Right />
                </div>
                <div className="drawer-side z-50">
                  <label
                    htmlFor="my-drawer-2"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                  ></label>
                  <div className="w-80 md:w-[350px] h-full bg-base-100 flex flex-col overflow-hidden">
                    <Left />
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/admin"
          element={authUser?.user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;