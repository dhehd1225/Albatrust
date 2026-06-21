import { useEffect, useState } from 'react'
import { Navigate, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import CareerDashboard from './pages/CareerDashboard'
import CareerRequest from './pages/CareerRequest'
import ContractVault from './pages/ContractVault'
import InterviewCreate from './pages/InterviewCreate'
import InterviewView from './pages/InterviewView'
import StoreManager from './pages/StoreManager'
import StoreDetail from './pages/StoreDetail'
import ScanLanding from './pages/ScanLanding'
import AlbaProfile from './pages/AlbaProfile'
import StoreProfile from './pages/StoreProfile'

function ProtectedRoute({ user, children }) {
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('albaTrustUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('albaTrustUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('albaTrustUser')
    }
  }, [user])

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Alba<span className="text-blue-light">Trust</span>
          </Link>
          <div className="flex gap-4 text-sm">
            {user && (
              <>
                <Link to="/career" className="hover:text-blue-light transition-colors">
                  내 경력
                </Link>
                <Link to="/contracts" className="hover:text-blue-light transition-colors">
                  계약서 보관함
                </Link>
                <Link to="/attendance" className="hover:text-blue-light transition-colors">
                  내 가게
                </Link>
              </>
            )}
            {user ? (
              <>
                <span className="hidden sm:inline text-blue-light">{user.name}님</span>
                <button onClick={handleLogout} className="hover:text-blue-light transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-light transition-colors">
                  로그인
                </Link>
                <Link to="/signup" className="text-blue-light hover:text-white transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto px-4 py-6 flex-1">
        <Routes>
          <Route path="/" element={<Home isAuthenticated={Boolean(user)} />} />
          <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} />
          <Route path="/signup" element={<AuthPage mode="signup" onAuth={setUser} />} />
          <Route
            path="/career"
            element={
              <ProtectedRoute user={user}>
                <CareerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career/request"
            element={
              <ProtectedRoute user={user}>
                <CareerRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts"
            element={
              <ProtectedRoute user={user}>
                <ContractVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute user={user}>
                <InterviewCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute user={user}>
                <InterviewView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute user={user}>
                <StoreManager user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/:storeId"
            element={
              <ProtectedRoute user={user}>
                <StoreDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/scan/:token" element={<ScanLanding />} />
          <Route path="/alba/:id" element={<AlbaProfile />} />
          <Route path="/store/:id" element={<StoreProfile />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
