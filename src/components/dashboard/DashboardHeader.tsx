'use client';
import { WarningCircle, Drop, Gauge } from '@phosphor-icons/react/dist/ssr';

interface DashboardHeaderProps {
  criticalCount: number;
  totalZones: number;
  deficitCount: number;
}

export function DashboardHeader({ criticalCount, deficitCount }: DashboardHeaderProps) {
  return (
    <div className="w-full border-b border-[#e5e7eb] bg-white">
      <div className="max-w-[1600px] mx-auto px-5 md:px-6 h-14 flex items-center justify-between">

        {/* Left: brand + status */}
        <div className="flex items-center gap-5">
          <h1 className="text-sm font-semibold tracking-tight text-[#111111] flex items-center gap-1.5">
            <Drop weight="fill" size={15} className="text-[#059669]" />
            UrbanTwin Water
          </h1>

          <div className="hidden md:flex items-center gap-4 border-l border-[#e5e7eb] pl-5">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${criticalCount > 0 ? 'text-red-600' : 'text-[#059669]'}`}>
              <WarningCircle weight="bold" size={14} />
              {criticalCount} Critical {criticalCount === 1 ? 'Zone' : 'Zones'}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
              <Gauge weight="bold" size={14} />
              {deficitCount} Zones in Deficit
            </div>
          </div>
        </div>

        {/* Right: timestamp + avatar */}
        <div className="flex items-center gap-3 text-xs text-[#6b7280]">
          <span className="hidden sm:inline">Last scan: 2 min ago</span>
          <div className="w-7 h-7 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-xs font-semibold text-[#111111]">
            R
          </div>
        </div>
      </div>
    </div>
  );
}
