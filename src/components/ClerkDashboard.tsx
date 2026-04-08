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
        printWindow.close();
      }, 500);
    }
  };

  const generatePrintContent = (app: Application) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Form - ${app.student_name} - PM SHRI B.C High School</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            background: white;
            padding: 0.3in;
            font-size: 11pt;
            line-height: 1.3;
            position: relative;
          }
          
          /* Force exact page breaks */
          .page1 {
            page-break-after: always;
            position: relative;
          }
          
          .page2 {
            page-break-before: avoid;
          }
          
          /* Header Section */
          .school-header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1e40af;
          }
          
          .school-name {
            font-size: 20pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 3px;
          }
          
          .school-address {
            font-size: 9pt;
            color: #475569;
            margin: 3px 0;
          }
          
          .form-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            color: #dc2626;
            margin: 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* Photo Section - Absolute Position Top Right Corner with 70% height */
          .photo-absolute {
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            border: 2px solid #1e3a8a;
            padding: 4px;
            background: white;
            text-align: center;
            border-radius: 4px;
            z-index: 100;
          }
          
          .photo-absolute img {
            width: 100%;
            height: auto;
            max-height: 70px;
            object-fit: contain;
            display: block;
          }
          
          .photo-label {
            font-size: 7pt;
            color: #1e3a8a;
            margin-top: 3px;
            font-weight: bold;
          }
          
          /* Main content wrapper to accommodate absolute positioned photo */
          .main-content {
            margin-top: 0;
          }
          
          /* Application Info Bar - Add top margin to avoid overlap with photo */
          .info-bar {
            margin-top: 0;
          }
          
          /* Section Titles */
          .section-title {
            background: #1e3a8a;
            color: white;
            padding: 5px 10px;
            font-size: 11pt;
            font-weight: bold;
            margin: 12px 0 8px 0;
            border-radius: 3px;
          }
          
          /* Tables */
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          
          .data-table td {
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
          }
          
          .data-table td:first-child {
            background: #f3f4f6;
            font-weight: 600;
            width: 35%;
          }
          
          /* Declaration */
          .declaration {
            background: #fef3c7;
            padding: 10px;
            margin: 15px 0;
            font-size: 9pt;
            line-height: 1.4;
            border-left: 3px solid #f59e0b;
          }
          
          /* Signature Section */
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin: 20px 0 10px 0;
          }
          
          .signature-box {
            text-align: center;
            width: 45%;
          }
          
          .signature-line {
            margin-top: 30px;
            padding-top: 5px;
            border-top: 1px solid #000;
          }
          
          /* Office Use */
          .office-use {
            background: #e0f2fe;
            padding: 10px;
            margin-top: 15px;
            border-radius: 3px;
          }
          
          .office-title {
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 8px;
            font-size: 10pt;
          }
          
          /* Footer */
          .footer {
            text-align: center;
            font-size: 8pt;
            color: #6b7280;
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
          }
          
          /* Page break control */
          @media print {
            body {
              padding: 0.2in;
            }
            
            .section-title {
              background: #1e3a8a !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .data-table td:first-child {
              background: #f3f4f6 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .declaration {
              background: #fef3c7 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .office-use {
              background: #e0f2fe !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1 -->
        <div class="page1">
          <!-- Photo at Absolute Top Right Corner -->
          ${app.photo_url ? `
          <div class="photo-absolute">
            <img src="${app.photo_url}" alt="Student Photo" />
            <div class="photo-label">Student's Photograph</div>
          </div>
          ` : ''}
          
          <!-- Header -->
          <div class="school-header">
            <div class="school-name">PM SHRI B.C HIGH SCHOOL, RANPUR</div>
          </div>
          
          <div class="form-title">ADMISSION APPLICATION FORM 2025-26</div>
          
          <!-- Application Info Bar -->
          <table class="data-table info-bar" style="margin-bottom: 10px; background: #f8fafc;">
            <tr>
              <td style="width: 25%;"><strong>Application ID:</strong> ${app.id?.slice(0, 8).toUpperCase() || 'N/A'}</td>
              <td style="width: 25%;"><strong>Date:</strong> ${new Date(app.created_at).toLocaleDateString('en-IN')}</td>
              <td style="width: 25%;"><strong>Status:</strong> ${app.status.toUpperCase().replace('_', ' ')}</td>
              <td style="width: 25%;"><strong>Class:</strong> ${app.which_class || 'N/A'}</td>
            </tr>
           </table>
          
          <!-- School Information Section -->
          <div class="section-title">📚 SCHOOL INFORMATION</div>
          <table class="data-table">
            <tr><td style="width: 35%;">School Name</td><td style="width: 65%;"><strong>${app.school_name}</strong></td></tr>
            <tr><td>UDISE Code</td><td>${app.udise}</td></tr>
            <tr><td>Admission Number</td><td><strong>${app.admission_no}</strong></td></tr>
            <tr><td>Admission Date</td><td>${app.admission_date || new Date().toLocaleDateString('en-IN')}</td></tr>
            <tr><td>PEN Number</td><td>${app.pen_no || 'To be assigned'}</td></tr>
           </table>
          
          <div class="section-title">👤 STUDENT PERSONAL DETAILS</div>
          <table class="data-table">
            <tr><td>Student's Full Name</td><td><strong>${app.student_name}</strong></td></tr>
            <tr><td>Aadhaar Number</td><td>${app.aadhaar_no}</td></tr>
            <tr><td>Gender</td><td>${app.gender}</td></tr>
            <tr><td>Date of Birth</td><td>${app.date_of_birth}</td></tr>
            <tr><td>Age (as on 01.04.2025)</td><td>${app.age || 'Calculated'}</td></tr>
            <tr><td>Category</td><td>${app.category}</td></tr>
            <tr><td>PWD Status</td><td>${app.is_pwd ? 'Yes' : 'No'}</td></tr>
            <tr><td>Extra-curricular Activity</td><td>${app.extra_curricular || 'None'}</td></tr>
           </table>
          
          <div class="section-title">👨‍👩‍👧 PARENT/GUARDIAN DETAILS</div>
          <table class="data-table">
            <tr><td>Father's Name</td><td><strong>${app.father_name}</strong></td></tr>
            <tr><td>Father's Aadhaar</td><td>${app.father_aadhaar}</td></tr>
            <tr><td>Father's Occupation</td><td>${app.father_occupation}</td></tr>
            <tr><td>Mother's Name</td><td><strong>${app.mother_name}</strong></td></tr>
            <tr><td>Mother's Aadhaar</td><td>${app.mother_aadhaar}</td></tr>
            <tr><td>Mother's Occupation</td><td>${app.mother_occupation}</td></tr>
           </table>
        </div>
        
        <!-- PAGE 2 -->
        <div class="page2">
          <div class="section-title">📍 RESIDENTIAL ADDRESS</div>
          <table class="data-table">
            <tr><td>Village/Town (At)</td><td>${app.address_at}</td></tr>
            <tr><td>Post Office (PO)</td><td>${app.address_po}</td></tr>
            <tr><td>Police Station (PS)</td><td>${app.address_ps}</td></tr>
            <tr><td>District</td><td><strong>${app.district}</strong></td></tr>
            <tr><td>PIN Code</td><td>${app.pin_code}</td></tr>
           </table>
          
          <div class="section-title">📞 CONTACT DETAILS</div>
          <table class="data-table">
            <tr><td>Primary Contact No.</td><td><strong>${app.contact_no}</strong></td></tr>
            <tr><td>Alternate Contact No.</td><td>${app.alternate_no || 'N/A'}</td></tr>
            <tr><td>Email Address</td><td>${app.email}</td></tr>
           </table>
          
          <div class="section-title">📋 ADDITIONAL INFORMATION</div>
          <table class="data-table">
            <tr><td>BPL Status</td><td>${app.bpl}</td></tr>
            <tr><td>Ration Card Number</td><td>${app.ration_card_no || 'N/A'}</td></tr>
            <tr><td>Previous School</td><td>${app.previous_school || 'N/A'}</td></tr>
            <tr><td>Bank Account Number</td><td>${app.bank_account_no || 'N/A'}</td></tr>
            <tr><td>IFSC Code</td><td>${app.ifsc || 'N/A'}</td></tr>
            <tr><td>Account Holder Name</td><td>${app.account_holder_name || 'N/A'}</td></tr>
           </table>
          
          <!-- Declaration -->
          <div class="declaration">
            <strong>📜 DECLARATION:</strong><br/>
            I hereby declare that all information provided above is true and correct to the best of my knowledge. I understand that furnishing false information may lead to cancellation of admission. I confirm that my child is not enrolled in any other school simultaneously.
          </div>
          
          <!-- Signatures -->
          <div class="signature-row">
            <div class="signature-box">
              <strong>Place:</strong> ${app.declaration_place || 'Ranpur'}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>
            <div class="signature-box">
              <strong>Parent's Signature</strong>
              <div class="signature-line"></div>
            </div>
          </div>
          
          <!-- Office Use Only -->
          <div class="office-use">
            <div class="office-title">🏫 FOR OFFICE USE ONLY</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px; width: 33%; border: 1px solid #ccc;">
                  <strong>Student's Signature</strong><br/>
                  <br/>
                  ________________________________<br/>
                </td>
                <td style="padding: 5px; width: 33%; border: 1px solid #ccc;">
                  <strong>Headmaster's Seal & Signature</strong><br/>
                  <br/>
                  _________________________________<br/>
                </td>
                <td style="padding: 5px; width: 34%; border: 1px solid #ccc;">
                  <strong>Remarks</strong><br/>
                  <br/>
                  _________________________________<br/>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Footer -->
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