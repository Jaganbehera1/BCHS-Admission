import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Application } from '../types';
import { FileText, Download, Printer, Eye, LogOut } from 'lucide-react';

export function ClerkDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    setApplications(data || []);
    setLoading(false);
  };

  const markAsReviewed = async (appId: string) => {
    const { error } = await supabase
      .from('applications')
      .update({
        status: 'clerk_reviewed',
        clerk_id: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (!error) {
      loadApplications();
      alert('Application marked as reviewed and sent to Headmaster');
    }
  };

  const downloadPDF = (app: Application) => {
    const printContent = generatePrintContent(app);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const generatePrintContent = (app: Application) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Form - ${app.student_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; color: red; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .section { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .section-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; color: #1565c0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border: 1px solid #ccc; }
          td:first-child { font-weight: bold; background: #f5f5f5; width: 30%; }
          .photo { text-align: center; margin: 20px 0; }
          .photo img { max-width: 150px; border: 2px solid #333; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">ADMISSION FORM</div>

        ${app.photo_url ? `<div class="photo"><img src="${app.photo_url}" alt="Student Photo" /></div>` : ''}

        <div class="section">
          <div class="section-title">School Details</div>
          <table>
            <tr><td>School Name</td><td>${app.school_name}</td></tr>
            <tr><td>UDISE</td><td>${app.udise}</td></tr>
            <tr><td>Admission No</td><td>${app.admission_no}</td></tr>
            <tr><td>Date</td><td>${app.admission_date || ''}</td></tr>
            <tr><td>PEN No.</td><td>${app.pen_no}</td></tr>
            <tr><td>Extra Co-curricular Activity</td><td>${app.extra_curricular}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Student Details</div>
          <table>
            <tr><td>Student Name</td><td>${app.student_name}</td></tr>
            <tr><td>Aadhaar No</td><td>${app.aadhaar_no}</td></tr>
            <tr><td>Gender</td><td>${app.gender}</td></tr>
            <tr><td>Category</td><td>${app.category}</td></tr>
            <tr><td>Date of Birth</td><td>${app.date_of_birth}</td></tr>
            <tr><td>Age</td><td>${app.age || ''}</td></tr>
            <tr><td>Whether PWD</td><td>${app.is_pwd ? 'Yes' : 'No'}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Parent Details</div>
          <table>
            <tr><td>Father Name</td><td>${app.father_name}</td></tr>
            <tr><td>Father Aadhaar</td><td>${app.father_aadhaar}</td></tr>
            <tr><td>Father Occupation</td><td>${app.father_occupation}</td></tr>
            <tr><td>Mother Name</td><td>${app.mother_name}</td></tr>
            <tr><td>Mother Aadhaar</td><td>${app.mother_aadhaar}</td></tr>
            <tr><td>Mother Occupation</td><td>${app.mother_occupation}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Address Details</div>
          <table>
            <tr><td>At</td><td>${app.address_at}</td></tr>
            <tr><td>PO</td><td>${app.address_po}</td></tr>
            <tr><td>PS</td><td>${app.address_ps}</td></tr>
            <tr><td>District</td><td>${app.district}</td></tr>
            <tr><td>PIN Code</td><td>${app.pin_code}</td></tr>
            <tr><td>Contact No</td><td>${app.contact_no}</td></tr>
            <tr><td>Alternate No</td><td>${app.alternate_no}</td></tr>
            <tr><td>Email</td><td>${app.email}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Other Details</div>
          <table>
            <tr><td>BPL</td><td>${app.bpl}</td></tr>
            <tr><td>Ration Card No</td><td>${app.ration_card_no}</td></tr>
            <tr><td>Previous School Status</td><td>${app.previous_school}</td></tr>
            <tr><td>Bank A/C No</td><td>${app.bank_account_no}</td></tr>
            <tr><td>IFSC</td><td>${app.ifsc}</td></tr>
            <tr><td>Account Holder Name</td><td>${app.account_holder_name}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Declaration</div>
          <p style="padding: 10px;">I hereby certify that the information provided by me in this admission form is true & correct to the best of my knowledge. I further confirm that my child is not enrolled in or attending any other educational institution at the same time.</p>
          <table>
            <tr><td>Place</td><td>${app.declaration_place}</td></tr>
            <tr><td>Signature (Parent)</td><td style="height: 50px;"></td></tr>
          </table>
        </div>

        <div style="margin-top: 40px; border-top: 2px solid #333; padding-top: 20px;">
          <p><strong>For Office Use Only</strong></p>
          <p>Clerk Signature: _____________________</p>
          <p>Headmaster Seal & Signature: _____________________</p>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      clerk_reviewed: 'bg-blue-100 text-blue-800',
      hm_approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Clerk Dashboard</h1>
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Admission Applications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aadhaar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{app.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.aadhaar_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.contact_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
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
                          onClick={() => downloadPDF(app)}
                          className="text-green-600 hover:text-green-900"
                          title="Print/Download PDF"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {app.status === 'pending' && (
                          <button
                            onClick={() => markAsReviewed(app.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Mark as Reviewed"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
