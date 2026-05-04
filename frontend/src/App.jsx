import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import InterviewCreate from './pages/InterviewCreate'
import InterviewView from './pages/InterviewView'
import AlbaProfile from './pages/AlbaProfile'
import StoreProfile from './pages/StoreProfile'

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Alba<span className="text-blue-light">Trust</span>
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/interview" className="hover:text-blue-light transition-colors">
              면접 확정
            </Link>
            <Link to="/alba/1" className="hover:text-blue-light transition-colors">
              알바 프로필
            </Link>
            <Link to="/store/1" className="hover:text-blue-light transition-colors">
              매장 프로필
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<InterviewCreate />} />
          <Route path="/interview/:id" element={<InterviewView />} />
          <Route path="/alba/:id" element={<AlbaProfile />} />
          <Route path="/store/:id" element={<StoreProfile />} />
        </Routes>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        &copy; 2025 AlbaTrust. 알바 신뢰 플랫폼
      </footer>
    </div>
  )
}

export default App
