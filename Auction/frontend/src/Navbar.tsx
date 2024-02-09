/// <reference lib="dom" />
import React from 'react'
import { Link } from 'react-router-dom'

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-teal-500 text-white">
      <div>
        <Link to="/" className="text-xl font-bold">
          Home
        </Link>
      </div>
      <div>
        <Link to="/galery" className="text-xl font-bold">
          Gallery
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
