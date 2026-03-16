import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { useSocket } from './hooks/useSocket';
import CreateTicket from './pages/CreateTicket';
import Export from './pages/Export';
import Login from './pages/Login';
import Logs from './pages/Logs';
import Register from './pages/Register';
import RequestRegister from './pages/RequestRegister';
import Statistics from './pages/Statistics';
import TicketDetail from './pages/TicketDetail';
import TicketList from './pages/TicketList';
import UserRequests from './pages/UserRequests';
import Users from './pages/Users';

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

function AppWithSocket({ children }: { children: React.ReactNode }) {
  useSocket();
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppWithSocket>
            <Routes>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppWithSocket>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
