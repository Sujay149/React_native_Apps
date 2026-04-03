'use client';

import { useAppStore } from '@/stores/use-app-store';
import { User, Mail, Phone, Briefcase, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const user = useAppStore((state) => state.user);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary to-primary/80"></div>
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-card">
                  <User className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-primary text-center mb-1">{user?.name || 'User'}</h2>
              <p className="text-text-muted text-center text-sm mb-4">{user?.role || 'Staff'}</p>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user?.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{user?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>{user?.employeeId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <p className="text-text-primary font-medium">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Age</label>
                <p className="text-text-primary font-medium">{user?.age || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <p className="text-text-primary font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <p className="text-text-primary font-medium">{user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Employee ID</label>
                <p className="text-text-primary font-medium">{user?.employeeId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <p className="text-text-primary font-medium">{user?.role || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                <p className="text-text-primary font-medium">{user?.category || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Joined</label>
                <p className="text-text-primary font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-smooth">
              Edit Profile
            </button>
            <button className="flex-1 px-4 py-2 border border-border text-primary rounded-lg hover:bg-primary-soft font-medium transition-smooth">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
