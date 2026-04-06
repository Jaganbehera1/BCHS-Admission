/*
  # School Admission Portal Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `role` (text, not null) - 'clerk' or 'headmaster'
      - `created_at` (timestamptz, default now())
    
    - `applications`
      - `id` (uuid, primary key)
      - `school_name` (text)
      - `udise` (text)
      - `admission_no` (text)
      - `admission_date` (date)
      - `pen_no` (text)
      - `extra_curricular` (text)
      - `student_name` (text, not null)
      - `aadhaar_no` (text, not null)
      - `gender` (text, not null)
      - `category` (text)
      - `date_of_birth` (date, not null)
      - `age` (integer)
      - `is_pwd` (boolean, default false)
      - `father_name` (text, not null)
      - `father_aadhaar` (text)
      - `father_occupation` (text)
      - `mother_name` (text, not null)
      - `mother_aadhaar` (text)
      - `mother_occupation` (text)
      - `address_at` (text)
      - `address_po` (text)
      - `address_ps` (text)
      - `district` (text)
      - `pin_code` (text)
      - `contact_no` (text, not null)
      - `alternate_no` (text)
      - `email` (text)
      - `bpl` (text)
      - `ration_card_no` (text)
      - `previous_school` (text)
      - `bank_account_no` (text)
      - `ifsc` (text)
      - `account_holder_name` (text)
      - `photo_url` (text)
      - `declaration_place` (text)
      - `status` (text, default 'pending') - 'pending', 'clerk_reviewed', 'hm_approved', 'rejected'
      - `clerk_id` (uuid) - References users(id)
      - `hm_id` (uuid) - References users(id)
      - `created_at` (timestamptz, default now())
      - `reviewed_at` (timestamptz)
      - `approved_at` (timestamptz)
    
    - `students`
      - `id` (uuid, primary key)
      - `application_id` (uuid, references applications) - Original application
      - `student_name` (text, not null)
      - `aadhaar_no` (text, not null)
      - `gender` (text, not null)
      - `category` (text)
      - `date_of_birth` (date, not null)
      - `age` (integer)
      - `is_pwd` (boolean, default false)
      - `father_name` (text, not null)
      - `father_aadhaar` (text)
      - `father_occupation` (text)
      - `mother_name` (text, not null)
      - `mother_aadhaar` (text)
      - `mother_occupation` (text)
      - `address_at` (text)
      - `address_po` (text)
      - `address_ps` (text)
      - `district` (text)
      - `pin_code` (text)
      - `contact_no` (text, not null)
      - `alternate_no` (text)
      - `email` (text)
      - `photo_url` (text)
      - `admission_no` (text, not null)
      - `admitted_at` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create users table (without foreign key initially)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('clerk', 'headmaster')),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint after table creation
ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text DEFAULT '',
  udise text DEFAULT '',
  admission_no text DEFAULT '',
  admission_date date,
  pen_no text DEFAULT '',
  extra_curricular text DEFAULT '',
  student_name text NOT NULL,
  aadhaar_no text NOT NULL,
  gender text NOT NULL,
  category text DEFAULT '',
  date_of_birth date NOT NULL,
  age integer,
  is_pwd boolean DEFAULT false,
  father_name text NOT NULL,
  father_aadhaar text DEFAULT '',
  father_occupation text DEFAULT '',
  mother_name text NOT NULL,
  mother_aadhaar text DEFAULT '',
  mother_occupation text DEFAULT '',
  address_at text DEFAULT '',
  address_po text DEFAULT '',
  address_ps text DEFAULT '',
  district text DEFAULT '',
  pin_code text DEFAULT '',
  contact_no text NOT NULL,
  alternate_no text DEFAULT '',
  email text DEFAULT '',
  bpl text DEFAULT '',
  ration_card_no text DEFAULT '',
  previous_school text DEFAULT '',
  bank_account_no text DEFAULT '',
  ifsc text DEFAULT '',
  account_holder_name text DEFAULT '',
  photo_url text,
  declaration_place text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'clerk_reviewed', 'hm_approved', 'rejected')),
  clerk_id uuid REFERENCES users(id),
  hm_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  approved_at timestamptz
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clerks can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'clerk'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'clerk'
    )
  );

CREATE POLICY "Headmasters can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'headmaster'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'headmaster'
    )
  );

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id),
  student_name text NOT NULL,
  aadhaar_no text NOT NULL,
  gender text NOT NULL,
  category text DEFAULT '',
  date_of_birth date NOT NULL,
  age integer,
  is_pwd boolean DEFAULT false,
  father_name text NOT NULL,
  father_aadhaar text DEFAULT '',
  father_occupation text DEFAULT '',
  mother_name text NOT NULL,
  mother_aadhaar text DEFAULT '',
  mother_occupation text DEFAULT '',
  address_at text DEFAULT '',
  address_po text DEFAULT '',
  address_ps text DEFAULT '',
  district text DEFAULT '',
  pin_code text DEFAULT '',
  contact_no text NOT NULL,
  alternate_no text DEFAULT '',
  email text DEFAULT '',
  photo_url text,
  admission_no text NOT NULL,
  admitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only headmasters can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'headmaster'
    )
  );

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('admission-photos', 'admission-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'admission-photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'admission-photos');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'admission-photos')
  WITH CHECK (bucket_id = 'admission-photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'admission-photos');
