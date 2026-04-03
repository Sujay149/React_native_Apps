'use client';

import { useState } from 'react';
import { Plus, Heart, AlertCircle, CheckCircle } from 'lucide-react';

type PatientStatus = 'active' | 'recovery' | 'completed';

interface Patient {
  id: string;
  name: string;
  age: number;
  medicalIssue: string;
  status: PatientStatus;
  lastVisit: string;
}

export default function HomeCareModule() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Doe',
      age: 65,
      medicalIssue: 'Diabetes Management',
      status: 'active',
      lastVisit: '2 days ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      age: 58,
      medicalIssue: 'Post-surgical Recovery',
      status: 'recovery',
      lastVisit: '5 days ago',
    },
    {
      id: '3',
      name: 'Robert Brown',
      age: 72,
      medicalIssue: 'Blood Pressure Monitoring',
      status: 'active',
      lastVisit: '1 day ago',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    medicalIssue: '',
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.medicalIssue) {
      const newPatient: Patient = {
        id: String(Date.now()),
        name: formData.name,
        age: parseInt(formData.age),
        medicalIssue: formData.medicalIssue,
        status: 'active',
        lastVisit: 'Just now',
      };
      setPatients([newPatient, ...patients]);
      setFormData({ name: '', age: '', medicalIssue: '' });
      setShowAddModal(false);
    }
  };

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'recovery':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return <Heart className="w-4 h-4" />;
      case 'recovery':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Home Care Management</h1>
          <p className="text-text-muted">Manage patient care activities and medical tracking</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary text-lg mb-1">{patient.name}</h3>
                  <p className="text-text-muted text-sm mb-2">{patient.medicalIssue}</p>
                  <p className="text-text-secondary text-sm">Age: {patient.age} years</p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                  patient.status
                )}`}
              >
                {getStatusIcon(patient.status)}
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-text-muted text-sm">Last visit: {patient.lastVisit}</p>
              <button className="text-primary text-sm font-semibold hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-primary mb-6">Add New Patient</h2>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter patient name"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Enter age"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Medical Issue
                </label>
                <input
                  type="text"
                  value={formData.medicalIssue}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalIssue: e.target.value })
                  }
                  placeholder="Enter medical issue or condition"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-primary-soft transition-smooth"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
