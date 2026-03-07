import React from "react";

export const Background = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[160px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-600/10 blur-[140px] rounded-full" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    </div>
  );
};
