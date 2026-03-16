import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface MetricGaugeProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  size?: "sm" | "md";
  details?: string;
  key?: string | number;
}

export function MetricGauge({ label, value, icon: Icon, color, size = "md", details }: MetricGaugeProps) {
  const radius = size === "md" ? 40 : 30;
  const stroke = size === "md" ? 4 : 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/5 relative overflow-visible group">
      {/* Background Glow */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl ${color}`} 
      />

      {/* Tooltip */}
      {details && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 border border-white/10 rounded-xl text-[10px] leading-relaxed text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] shadow-2xl">
          <div className="font-bold text-white mb-1 uppercase tracking-widest">{label} Deep Dive</div>
          {details}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900" />
        </div>
      )}
      
      <div className="relative mb-3">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray="2 4"
            className="text-white/10"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <motion.circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={color.replace('bg-', 'text-')}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')} opacity-80`} />
        </div>
      </div>

      <div className="text-center relative z-10">
        <div className="text-2xl font-black tracking-tighter mb-0.5">{value}%</div>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      </div>
    </div>
  );
}
