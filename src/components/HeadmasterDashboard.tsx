import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Application } from '../types';
import { CheckCircle, XCircle, Eye, LogOut, Users } from 'lucide-react';

export function HeadmasterDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'students'>('pending');
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadApplications();
    loadStudents();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'clerk_reviewed')
      .order('reviewed_at', { ascending: false });

    setApplications(data || []);
    setLoading(false);
  };

  const loadStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('admitted_at', { ascending: false });

    setStudents(data || []);
  };

  const approveApplication = async (app: Application) => {
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'hm_approved',
        hm_id: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', app.id);

    if (updateError) {
      alert('Error updating application: ' + updateError.message);
      return;
    }

    const { error: insertError } = await supabase.from('students').insert({
      application_id: app.id,
      student_name: app.student_name,
      aadhaar_no: app.aadhaar_no,
      gender: app.gender,
      category: app.category,
      date_of_birth: app.date_of_birth,
      age: app.age,
      is_pwd: app.is_pwd,
      father_name: app.father_name,
      father_aadhaar: app.father_aadhaar,
      father_occupation: app.father_occupation,
      mother_name: app.mother_name,
      mother_aadhaar: app.mother_aadhaar,
      mother_occupation: app.mother_occupation,
      address_at: app.address_at,
      address_po: app.address_po,
      address_ps: app.address_ps,
      district: app.district,
      pin_code: app.pin_code,
      contact_no: app.contact_no,
      alternate_no: app.alternate_no,
      email: app.email,
      photo_url: app.photo_url,
      admission_no: app.admission_no || `ADM-${Date.now()}`,
    });

    if (insertError) {
      alert('Error creating student record: ' + insertError.message);
      return;
    }

    alert('Application approved! Student has been admitted successfully.');
    loadApplications();
    loadStudents();
    setSelectedApp(null);
  };

  const rejectApplication = async (appId: string) => {
    const reason = prompt('Please enter reason for rejection:');
    if (!reason) return;

    const { error } = await supabase
      .from('applications')
      .update({
        status: 'rejected',
        hm_id: user?.id,
      })
      .eq('id', appId);

    if (!error) {
      alert('Application rejected');
      loadApplications();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Headmaster Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Approvals ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Admitted Students ({students.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Applications for Approval</h2>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No pending applications for approval
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aadhaar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{app.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.aadhaar_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.contact_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => approveApplication(app)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => rejectApplication(app.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Admitted Students</h2>
            </div>

            {students.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No students admitted yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admitted On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{student.admission_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.father_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.contact_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.admitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Application Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {selectedApp.photo_url && (
                <div className="text-center mb-6">
                  <img
                    src={selectedApp.photo_url}
                    alt="Student"
                    className="w-32 h-32 object-cover rounded border-2 border-gray-300 mx-auto"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">School Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">School Name:</span> {selectedApp.school_name}</div>
                    <div><span className="font-medium">UDISE:</span> {selectedApp.udise}</div>
                    <div><span className="font-medium">Admission No:</span> {selectedApp.admission_no}</div>
                    <div><span className="font-medium">Date:</span> {selectedApp.admission_date || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Student Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedApp.student_name}</div>
                    <div><span className="font-medium">Aadhaar:</span> {selectedApp.aadhaar_no}</div>
                    <div><span className="font-medium">Gender:</span> {selectedApp.gender}</div>
                    <div><span className="font-medium">DOB:</span> {selectedApp.date_of_birth}</div>
                    <div><span className="font-medium">Age:</span> {selectedApp.age}</div>
                    <div><span className="font-medium">Category:</span> {selectedApp.category}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Parent Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Father:</span> {selectedApp.father_name}</div>
                    <div><span className="font-medium">Mother:</span> {selectedApp.mother_name}</div>
                    <div><span className="font-medium">Father Occupation:</span> {selectedApp.father_occupation}</div>
                    <div><span className="font-medium">Mother Occupation:</span> {selectedApp.mother_occupation}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Contact Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Phone:</span> {selectedApp.contact_no}</div>
                    <div><span className="font-medium">Email:</span> {selectedApp.email}</div>
                    <div><span className="font-medium">District:</span> {selectedApp.district}</div>
                    <div><span className="font-medium">PIN:</span> {selectedApp.pin_code}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => rejectApplication(selectedApp.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => approveApplication(selectedApp)}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve & Admit Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
