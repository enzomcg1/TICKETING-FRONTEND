import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import RequestRegister from './pages/RequestRegister';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Users from './pages/Users';
import UserRequests from './pages/UserRequests';
import Statistics from './pages/Statistics';
import Logs from './pages/Logs';
import Export from './pages/Export';
import { useSocket } from './hooks/useSocket';

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Componente para rutas públicas (redirige a home si está autenticado)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Componente que inicializa el socket cuando el usuario está autenticado
function AppWithSocket({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Inicializar socket si el usuario está autenticado
  if (isAuthenticated) {
    useSocket();
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppWithSocket>
          <Routes>
            {/* Rutas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/request-register"
              element={
                <Layout>
                  <RequestRegister />
                </Layout>
              }
            />

            {/* Rutas protegidas con Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateTicket />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Statistics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Register />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Logs />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Export />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AppWithSocket>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
