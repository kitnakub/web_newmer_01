import React from 'react';
import { X, ChevronDown, ChevronRight} from 'lucide-react';
import type { ComponentType } from 'react';

interface MenuItem {
  id: string;
  title: string;
  component?: ComponentType;
  isSection?: boolean;
  children?: MenuItem[];
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  expandedSections: string[];
  setExpandedSections: React.Dispatch<React.SetStateAction<string[]>>;
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentPage,
  setCurrentPage,
  expandedSections,
  setExpandedSections,
  menuItems
}) => {

  const toggleSection = (id: string) => {
    if (expandedSections.includes(id)) {
      setExpandedSections(expandedSections.filter(sec => sec !== id));
    } else {
      setExpandedSections([...expandedSections, id]);
    }
  };


  

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-md border-r border-slate-700 transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            
            const isExpanded = expandedSections.includes(item.id);
            
            return (
              <li key={item.id}>
                {item.isSection ? (
                  <>
                    <button
                      onClick={() => toggleSection(item.id)}
                      className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-300 hover:text-purple-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        
                        <span>{item.title}</span>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <ul className="ml-6 mt-2 space-y-1">
                        {item.children?.map((child) => (
                          <li key={child.id}>
                            <button
                              onClick={() => {
                                setCurrentPage(child.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                                currentPage === child.id
                                  ? 'text-purple-300 bg-purple-800/30'
                                  : 'text-gray-400 hover:text-purple-300 hover:bg-slate-700/30'
                              }`}
                            >
                              {child.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'text-purple-300 bg-purple-800/30'
                        : 'text-gray-300 hover:text-purple-300 hover:bg-slate-700/50'
                    }`}
                  >
                   
                    <span>{item.title}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;