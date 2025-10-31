import React from 'react';

const PortfolioPage: React.FC = () => {
  const user: string = "Krisada ";
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-1">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-300">{user[0]}</span>
            </div>
          </div>
          
          
        
          
          
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;