'use client';

import { Shield, Plus } from 'lucide-react';

export default function HealthModule() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Health Services</h1>
          <p className="text-text-muted">Health service intake and patient monitoring</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          New Intake
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <Shield className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Health Services Module</h2>
        <p className="text-text-muted">Manage patient intake records and health monitoring data</p>
      </div>
    </div>
  );
}
