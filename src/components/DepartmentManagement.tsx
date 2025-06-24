'use client';

import React, { useState, useEffect } from 'react';
import { 
  getDepartments, 
  saveDepartment, 
  getDepartmentHeads,
  addDepartmentHead,
  removeDepartmentHead 
} from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { Department, DepartmentHead } from '@/lib/firebase-utils';

// Extended interfaces for the component
interface ExtendedDepartment extends Department {
  category?: string;
  hodName?: string;
  hodEmail?: string;
  hodPhone?: string;
}

interface ExtendedDepartmentHead extends DepartmentHead {
  department?: string;
  assignedAt?: any;
}

const DepartmentManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<ExtendedDepartment[]>([]);
  const [departmentHeads, setDepartmentHeads] = useState<ExtendedDepartmentHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddHODForm, setShowAddHODForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Engineering' as 'Engineering' | 'Business & Commerce' | 'Health Sciences' | 'Liberal Arts',
    hodName: '',
    hodEmail: '',
    hodPhone: '',
    isActive: true
  });
  const [hodFormData, setHodFormData] = useState({
    email: '',
    name: '',
    department: '',
    phone: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptData, hodData] = await Promise.all([
        getDepartments(),
        getDepartmentHeads()
      ]);
      setDepartments(deptData as ExtendedDepartment[]);
      setDepartmentHeads(hodData as ExtendedDepartmentHead[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create proper department object
      const departmentData = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        createdAt: new Date()
      };
      
      await saveDepartment(departmentData);
      setFormData({
        name: '',
        description: '',
        category: 'Engineering',
        hodName: '',
        hodEmail: '',
        hodPhone: '',
        isActive: true
      });
      setShowAddForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleAddHOD = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find the department ID for the selected department
      const selectedDept = departments.find(d => d.name === hodFormData.department);
      if (!selectedDept) {
        console.error('Department not found');
        return;
      }

      // Create HOD data object
      const hodData = {
        name: hodFormData.name || hodFormData.email.split('@')[0],
        email: hodFormData.email,
        phoneNumber: hodFormData.phone || '',
        departmentId: selectedDept.id,
        isActive: true,
        createdAt: new Date()
      };

      await addDepartmentHead(hodData);
      setHodFormData({ email: '', name: '', department: '', phone: '' });
      setShowAddHODForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error adding department head:', error);
    }
  };

  const handleRemoveHOD = async (hodId: string) => {
    if (confirm('Are you sure you want to remove this department head?')) {
      try {
        await removeDepartmentHead(hodId);
        await fetchData();
      } catch (error) {
        console.error('Error removing department head:', error);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Department
          </button>
          <button
            onClick={() => setShowAddHODForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Add Department Head
          </button>
        </div>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Business & Commerce">Business & Commerce</option>
                  <option value="Health Sciences">Health Sciences</option>
                  <option value="Liberal Arts">Liberal Arts</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Active Department</label>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Department
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add HOD Form */}
      {showAddHODForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Department Head</h3>
            <form onSubmit={handleAddHOD} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={hodFormData.name}
                  onChange={(e) => setHodFormData({ ...hodFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={hodFormData.email}
                  onChange={(e) => setHodFormData({ ...hodFormData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={hodFormData.phone}
                  onChange={(e) => setHodFormData({ ...hodFormData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={hodFormData.department}
                  onChange={(e) => setHodFormData({ ...hodFormData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add HOD
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHODForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Departments ({departments.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {department.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {department.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      department.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Heads List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Department Heads ({departmentHeads.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentHeads.map((hod) => {
                const department = departments.find(d => d.id === hod.departmentId);
                return (
                  <tr key={hod.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hod.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hod.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hod.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department?.name || 'Unknown Department'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveHOD(hod.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
          <div className="text-sm text-blue-800">Total Departments</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {departments.filter(d => d.isActive).length}
          </div>
          <div className="text-sm text-green-800">Active Departments</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{departmentHeads.length}</div>
          <div className="text-sm text-purple-800">Department Heads</div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement; 