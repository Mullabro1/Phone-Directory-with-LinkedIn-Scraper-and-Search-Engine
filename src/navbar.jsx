import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import AuthContext
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { logout , username } = useContext(AuthContext);

  // URL mapping for redirection
  const urlMapping = {
    home: "https://execution.ecovisrkca.com/dashboard",
    goal: "https://rmt.ecovisrkca.com/goals",
    projects: "https://rmt.ecovisrkca.com/projectManagementHome",
    flow: "https://rmt.ecovisrkca.com/MobileViewController/board",
    masters: "https://rmt.ecovisrkca.com/service_mobile",
    tally: "https://actai_gbt.ecovisrkca.com/tally_prime",
    "act-ai": "https://actai.ecovisrkca.com/",
    consolidation: "https://act.ecovisrkca.com/",
    mail: "https://rmt.ecovisrkca.com/email_client1",
    chats: "https://rmt.ecovisrkca.com/messenger",
    folder: "https://rmt.ecovisrkca.com/folder_desktop_view",
    "HR_ADMIN": "https://payroll.ecovisrkca.com/calendar",
    repository: "https://rmt.ecovisrkca.com/intranet",
    acadamy: "https://amgt.ecovisrkca.com/kstore/home",
    performance: "https://actai_gbt.ecovisrkca.com/tally_prime",
    leadership: "https://act.ecovisrkca.com/",
    "mass mail": "https://amgt.ecovisrkca.com/survey/MassMail",
    survey: "https://amgt.ecovisrkca.com/survey/Survey",
    ticketrequest: "https://ticket.ecovisrkca.com/Ticket_Generation"
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCloseSidebar = () => {
    setIsNavOpen(false);
  };

  const toggleDropdown = (section) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  // Function to handle redirection
  const handleRedirect = (section) => {
    if (urlMapping[section]) {
      window.location.href = urlMapping[section];
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-white shadow-md fixed w-full z-20">
        <button onClick={toggleNav} className="text-gray-800 flex items-center space-x-2">
          {/*<span className="text-3xl">☰</span>*/}
          <img src="/eco.png" alt="logo" className="w-[150px] h-[60px]" />
        </button>

        <div className="flex items-center space-x-4">
         <span className="text-black -400"><h4>{username}</h4></span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {isNavOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-md pt-16 z-30">
          <button
            onClick={handleCloseSidebar}
            className="absolute top-4 left-4 text-6xl w-[30px] h-[30px] flex items-center justify-center text-gray-800 hover:text-gray-600 transition"
          >
            &times;
          </button>

          <div className="flex flex-col space-y-6 p-4 mt-12">
            <button
              onClick={() => handleRedirect('home')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-home text-red-500 mr-2"></i> Home
            </button>

            <button
              onClick={() => toggleDropdown('plan')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-calendar-alt text-blue-500 mr-2"></i> Plan
              <i className="fas fa-chevron-down ml-auto"></i>
            </button>
            {openDropdown === 'plan' && (
              <div className="space-y-2 pl-6">
                <button
                  onClick={() => handleRedirect('goal')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-bullseye text-red-500 mr-2"></i> Goal
                </button>
                <button
                  onClick={() => handleRedirect('projects')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-tasks text-orange-500 mr-2"></i> Projects
                </button>
                <button
                  onClick={() => handleRedirect('flow')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-random text-purple-500 mr-2"></i> Flows
                </button>
                <button
                  onClick={() => handleRedirect('masters')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-database text-yellow-500 mr-2"></i> Masters
                </button>
              </div>
            )}

            <button
              onClick={() => toggleDropdown('fico')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-dollar-sign text-yellow-500 mr-2"></i> Fico
              <i className="fas fa-chevron-down ml-auto"></i>
            </button>
            {openDropdown === 'fico' && (
              <div className="space-y-2 pl-6">
                <button
                  onClick={() => handleRedirect('tally')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-calculator text-blue-500 mr-2"></i> Tally
                </button>
                <button
                  onClick={() => handleRedirect('act-ai')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-cogs text-green-500 mr-2"></i> Act-AI
                </button>
                <button
                  onClick={() => handleRedirect('consolidation')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-tasks text-purple-500 mr-2"></i> Consolidation
                </button>
              </div>
            )}

            <button
              onClick={() => toggleDropdown('collaborate')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-users text-green-500 mr-2"></i> Collaborate
              <i className="fas fa-chevron-down ml-auto"></i>
            </button>
            {openDropdown === 'collaborate' && (
              <div className="space-y-2 pl-6">
                <button
                  onClick={() => handleRedirect('mail')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-envelope text-red-500 mr-2"></i> Mail
                </button>
                <button
                  onClick={() => handleRedirect('chats')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-comments text-blue-500 mr-2"></i> Chats
                </button>
                <button
                  onClick={() => handleRedirect('folder')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-folder text-yellow-500 mr-2"></i> Folder
                </button>
              </div>
            )}

            <button
              onClick={() => toggleDropdown('talent')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-user-tie text-purple-500 mr-2"></i> Talent
              <i className="fas fa-chevron-down ml-auto"></i>
            </button>
            {openDropdown === 'talent' && (
              <div className="space-y-2 pl-6">
                <button
                  onClick={() => handleRedirect('HR_ADMIN')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-envelope text-red-500 mr-2"></i> HR_ADMIN
                </button>
                <button
                  onClick={() => handleRedirect('repository')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-poll text-green-500 mr-2"></i> Repository
                </button>
                <button
                  onClick={() => handleRedirect('acadamy')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-store text-yellow-500 mr-2"></i> Academy
                </button>
                <button
                  onClick={() => handleRedirect('performance')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-calculator text-blue-500 mr-2"></i> Performance
                </button>
                <button
                  onClick={() => handleRedirect('leadership')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-globe text-orange-500 mr-2"></i> Leadership
                </button>
              </div>
            )}

            <button
              onClick={() => toggleDropdown('crm')}
              className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-600 ease-in-out"
            >
              <i className="fas fa-wrench text-orange-500 mr-2"></i> CRM
              <i className="fas fa-chevron-down ml-auto"></i>
            </button>
            {openDropdown === 'crm' && (
              <div className="space-y-2 pl-6">
                <button
                  onClick={() => handleRedirect('mass mail')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-envelope text-red-500 mr-2"></i> Mass Mail
                </button>
                <button
                  onClick={() => handleRedirect('survey')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-poll text-blue-500 mr-2"></i> Survey
                </button>
                <button
                  onClick={() => handleRedirect('ticketrequest')}
                  className="flex items-center bg-white text-black py-2 px-4 rounded-md hover:bg-gray-100"
                >
                  <i className="fas fa-ticket-alt text-yellow-500 mr-2"></i> Ticket Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
