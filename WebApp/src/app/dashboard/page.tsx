'use client';

import Link from 'next/link';
import { Heart, Shield, TrendingUp, BookOpen, Activity, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/stores/use-app-store';

const MODULES = [
  {
    name: 'Home Care',
    description: 'Manage patient care activities and medical tracking',
    icon: Heart,
    href: '/dashboard/modules/homecare',
    color: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    name: 'Health Services',
    description: 'Health service intake and monitoring',
    icon: Shield,
    href: '/dashboard/modules/health',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    name: 'Security',
    description: 'Report and manage security incidents',
    icon: Shield,
    href: '/dashboard/modules/security',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Marketing',
    description: 'Track leads and sales activities',
    icon: TrendingUp,
    href: '/dashboard/modules/marketing',
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Education',
    description: 'Manage career guidance and education programs',
    icon: BookOpen,
    href: '/dashboard/modules/education',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

export default function DashboardPage() {
  const user = useAppStore((state) => state.user);

  return (
    <div className="p-4 md:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-text-muted">
          Role: <span className="font-semibold text-text-secondary">{user?.role || 'Staff'}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-card border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Active Tasks</p>
              <p className="text-3xl font-bold text-primary">12</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-primary">28</p>
            </div>
            <Activity className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border-l-4 border-orange-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-primary">5</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border-l-4 border-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">This Month</p>
              <p className="text-3xl font-bold text-primary">72%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Service Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary mb-6">Service Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className={`${module.color} p-8 flex items-center justify-center h-32`}>
                    <Icon className={`w-16 h-16 ${module.iconColor}`} />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-primary mb-2 group-hover:text-primary transition-smooth">
                      {module.name}
                    </h3>
                    <p className="text-text-muted text-sm mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                      Go to module
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Task completed in Home Care module</p>
                <p className="text-text-muted text-sm">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
