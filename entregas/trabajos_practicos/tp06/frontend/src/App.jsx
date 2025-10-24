import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthContainer from "./components/AuthContainer";
import CompraEntradas from "./components/CompraEntradas";
import Header from "./components/Header";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<CompraEntradas />} />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
