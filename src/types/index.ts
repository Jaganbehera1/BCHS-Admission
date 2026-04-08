export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'clerk' | 'headmaster';
  created_at: string;
}

export interface Application {
  id: string;
  school_name: string;
  udise: string;
  admission_no: string;
  admission_date: string | null;
  pen_no: string;
  extra_curricular: string;
  student_name: string;
  aadhaar_no: string;
  gender: string;
  category: string;
  date_of_birth: string;
  age: number | null;
  is_pwd: boolean;
  father_name: string;
  father_aadhaar: string;
  father_occupation: string;
  mother_name: string;
  mother_aadhaar: string;
  mother_occupation: string;
  address_at: string;
  address_po: string;
  address_ps: string;
  district: string;
  pin_code: string;
  contact_no: string;
  alternate_no: string;
  email: string;
  bpl: string;
  ration_card_no: string;
  previous_school: string;
  bank_account_no: string;
  ifsc: string;
  account_holder_name: string;
  photo_url: string | null;
  declaration_place: string;
  which_class: string;
  status: 'pending' | 'clerk_reviewed' | 'hm_approved' | 'rejected';
  clerk_id: string | null;
  hm_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
}

export interface Student {
  id: string;
  application_id: string;
  student_name: string;
  aadhaar_no: string;
  gender: string;
  category: string;
  date_of_birth: string;
  age: number | null;
  is_pwd: boolean;
  father_name: string;
  father_aadhaar: string;
  father_occupation: string;
  mother_name: string;
  mother_aadhaar: string;
  mother_occupation: string;
  address_at: string;
  address_po: string;
  address_ps: string;
  district: string;
  pin_code: string;
  contact_no: string;
  alternate_no: string;
  email: string;
  photo_url: string | null;
  admission_no: string;
  admitted_at: string;
  created_at: string;
}
