// src/App.jsx
import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import About from "./components/About";

// Import your TS login pages
import Auth from "./auth/pages/Auth.tsx";
import Index from "./auth/pages/Index.tsx";
import { supabase } from "./auth/integrations/supabase/client";

const App = () => {
  // Track auth state based on Supabase session
  const [isAuthed, setIsAuthed] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.setItem(
          "auth-user",
          JSON.stringify({ id: session.user.id, email: session.user.email })
        );
        setIsAuthed(true);
      } else {
        localStorage.removeItem("auth-user");
        setIsAuthed(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          localStorage.setItem(
            "auth-user",
            JSON.stringify({ id: session.user.id, email: session.user.email })
          );
          setIsAuthed(true);
        } else {
          localStorage.removeItem("auth-user");
          setIsAuthed(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  if (isAuthed === null) {
    return null; // or a small loader
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/index" element={<Index />} />

        {/* Protected Harmonix routes */}
        <Route
          path="/"
          element={isAuthed ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/about"
          element={isAuthed ? <About /> : <Navigate to="/login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthed ? "/" : "/login"} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
