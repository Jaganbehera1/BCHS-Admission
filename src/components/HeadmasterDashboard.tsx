import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Application } from '../types';
import { CheckCircle, XCircle, Eye, LogOut, Users, Trash2 } from 'lucide-react';

export function HeadmasterDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'students'>('pending');
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

    alert('Application approved! Student admitted successfully.');
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

  const deleteStudent = async (studentId: string) => {
    // Double confirmation for safety
    const confirmDelete = confirm(
      '⚠️ WARNING: This will permanently delete the student record. Are you sure?'
    );
    
    if (!confirmDelete) return;

    const secondConfirm = confirm(
      'This action cannot be undone. Type "DELETE" to confirm.'
    );
    
    if (!secondConfirm) return;

    setDeletingId(studentId);

    try {
      // First, get the student to find associated application_id
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('application_id')
        .eq('id', studentId)
        .single();

      if (fetchError) {
        alert('Error finding student record: ' + fetchError.message);
        setDeletingId(null);
        return;
      }

      // Delete the student record
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (deleteError) {
        alert('Error deleting student: ' + deleteError.message);
        setDeletingId(null);
        return;
      }

      // Optionally: Update the application status back to 'clerk_reviewed' or 'deleted'
      if (student?.application_id) {
        await supabase
          .from('applications')
          .update({ 
            status: 'clerk_reviewed',
            hm_id: null,
            approved_at: null
          })
          .eq('id', student.application_id);
      }

      alert('✅ Student deleted successfully!');
      
      // Refresh the students list
      await loadStudents();
      
    } catch (error) {
      console.error('Error in delete process:', error);
      alert('An unexpected error occurred while deleting the student.');
    } finally {
      setDeletingId(null);
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

        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Pending Applications</h2>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No pending applications to review
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{app.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.father_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.contact_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button
                            onClick={() => approveApplication(app)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-5 h-5 inline" />
                          </button>
                          <button
                            onClick={() => rejectApplication(app.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB WITH DELETE BUTTON */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Admitted Students</h2>
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Headmaster only: Delete action is permanent
              </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deleteStudent(student.id)}
                            disabled={deletingId === student.id}
                            className={`text-red-600 hover:text-red-900 transition-colors ${
                              deletingId === student.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete Student (Headmaster Only)"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Application Details</h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <p><strong>Student Name:</strong> {selectedApp.student_name}</p>
                  <p><strong>Father's Name:</strong> {selectedApp.father_name}</p>
                  <p><strong>Mother's Name:</strong> {selectedApp.mother_name}</p>
                  <p><strong>Date of Birth:</strong> {new Date(selectedApp.date_of_birth).toLocaleDateString()}</p>
                  <p><strong>Gender:</strong> {selectedApp.gender}</p>
                  <p><strong>Category:</strong> {selectedApp.category}</p>
                  <p><strong>Aadhaar Number:</strong> {selectedApp.aadhaar_no}</p>
                  <p><strong>Contact:</strong> {selectedApp.contact_no}</p>
                  <p><strong>Email:</strong> {selectedApp.email}</p>
                  <p><strong>Address:</strong> {selectedApp.address_at}, {selectedApp.address_po}, {selectedApp.address_ps}</p>
                  <p><strong>District:</strong> {selectedApp.district}</p>
                  <p><strong>PIN Code:</strong> {selectedApp.pin_code}</p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => rejectApplication(selectedApp.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveApplication(selectedApp)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}