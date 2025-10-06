import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaSignOutAlt, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { authService } from "../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <header className="relative rounded-b-3xl p-6 md:p-12 mx-4 md:mx-16">
      <div className="absolute inset-0 rounded-b-3xl 
                      bg-white/20 
                      backdrop-blur-md 
                      border border-white/30"></div>

      <div className="relative z-10 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <div className="flex items-center space-x-2 mb-2">
            <FaBrain className="text-3xl md:text-4xl text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-sans">
              Intellica
            </h1>
          </div>
          <p className="text-gray-700/80 text-sm md:text-base font-sans leading-relaxed">
            Upload documents, images, or audio, then ask questions in plain language.
            Receive accurate answers with full citation transparency from your local knowledge base.
          </p>
        </div>
        
        {/* User Info and Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaUser className="text-lg" />
            <span className="text-sm font-medium">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="text-sm" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
