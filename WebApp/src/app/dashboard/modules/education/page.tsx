'use client';

import { BookOpen, Plus } from 'lucide-react';

export default function EducationModule() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Education & Guidance</h1>
          <p className="text-text-muted">Manage career guidance and education programs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Education Module</h2>
        <p className="text-text-muted">Manage career guidance requests and educational support programs</p>
      </div>
    </div>
  );
}
