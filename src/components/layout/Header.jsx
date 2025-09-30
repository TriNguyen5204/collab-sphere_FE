import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logov1.png'

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-1">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="CollabSphere Logo" className="h-10 w-10 mr-2 rounded-md" />
            <h1 className="text-2xl font-bold text-gray-900">
              CollabSphere
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </a>
            <a href="/room" className="text-gray-600 hover:text-gray-900 transition-colors">
              Connect Room
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
             className="text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
