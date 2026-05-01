'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ZoneHeatmap } from '@/components/map/ZoneHeatmap';
import { AnomalyDetailPanel } from '@/components/dashboard/AnomalyDetailPanel';
import { ProposalQueue } from '@/components/dashboard/ProposalQueue';
import { ZoneSummary } from '@/lib/synthetic-data';
import { RedistributionProposal } from '@/lib/fairness';
import { ArrowsLeftRight } from '@phosphor-icons/react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState<{
    zones: ZoneSummary[];
    criticalCount: number;
    deficitCount: number;
  } | null>(null);
  
  const [proposals, setProposals] = useState<RedistributionProposal[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch anomalies and zones
    fetch('/api/anomalies')
      .then((res) => res.json())
      .then((json) => {
        setData({
          zones: json.all_zones,
          criticalCount: json.critical_count,
          deficitCount: 0, // will update below
        });
      });

    // Fetch redistribution proposals
    fetch('/api/redistribute')
      .then((res) => res.json())
      .then((json) => {
        setProposals(json.proposals.slice(0, 3)); // Top 3 hot proposals
        setData(prev => prev ? { ...prev, deficitCount: json.deficit_count } : null);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading Dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <DashboardHeader 
        criticalCount={data.criticalCount} 
        totalZones={data.zones.length} 
        deficitCount={data.deficitCount} 
      />

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: 'calc(100dvh - 64px)' }}>
        {/* Left Column: Map (70% on desktop) */}
        <section className="lg:col-span-8 flex flex-col relative rounded-lg bg-white border border-[#e5e7eb] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#111111] tracking-tight">Network Status</h2>
            <span className="text-xs font-medium text-[#059669] bg-[#ecfdf5] px-2 py-1 rounded-md">{data.zones.length} Active Zones</span>
          </div>
          <div className="flex-1 min-h-[400px]">
            <ZoneHeatmap 
              zones={data.zones} 
              selectedZoneId={selectedZoneId}
              onZoneSelect={(id) => setSelectedZoneId(id)}
            />
          </div>
        </section>

        {/* Right Column: Sidebar (30% on desktop) */}
        <section className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pb-6">
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111111] tracking-tight">Hot Proposals</h2>
              <Link href="/redistribution" className="text-xs font-medium text-[#059669] hover:text-emerald-700 flex items-center gap-1 transition-colors">
                View All <ArrowsLeftRight size={13} />
              </Link>
            </div>
            <ProposalQueue proposals={proposals} />
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-5">
            <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-1.5">System Alert</p>
            <p className="text-sm font-semibold text-[#111111]">Anomaly Detection Engine Active</p>
            <p className="text-xs text-[#6b7280] mt-1.5 leading-relaxed">Isolation Forest model scanning 30-day rolling history every 15 minutes.</p>
          </div>
        </section>
      </div>

      <AnomalyDetailPanel 
        zoneId={selectedZoneId} 
        onClose={() => setSelectedZoneId(null)} 
      />
    </div>
  );
}
