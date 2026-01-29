import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, Home, Zap } from "lucide-react";

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Subtle Medical Grid Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23006666' stroke-width='2'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center">
          
          <div className="inline-flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 bg-[#006666] blur-3xl opacity-10 animate-pulse"></div>
            <div className="relative bg-[#006666] p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,102,102,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <ClipboardList className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-emerald-500 p-4 rounded-2xl shadow-lg border-4 border-white animate-bounce">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-6xl font-black text-[#006666] tracking-tight mb-6">
            Get Quote <br />
            <span className="text-slate-400">Coming Soon</span>
          </h1>
          
          <p className="text-xl text-slate-600 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            We are engineering a faster way for you to receive bulk medical pricing. 
          </p>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-6">
            <Button 
              onClick={() => navigate("/")}
              className="h-16 px-10 rounded-2xl bg-[#006666] hover:bg-[#004d4d] text-white font-bold text-xl shadow-[0_15px_30px_rgba(0,102,102,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <Home className="w-6 h-6" />
              Return to Home
            </Button>

          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-[#006666] opacity-[0.02] rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#006666] opacity-[0.02] rounded-full -ml-48 -mb-48"></div>
    </div>
  );
};

export default ComingSoon;