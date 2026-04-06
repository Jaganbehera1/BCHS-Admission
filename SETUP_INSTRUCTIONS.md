# School Admission Portal - Setup Instructions

## Overview
This is a comprehensive school admission portal with role-based access for Students, Clerks, and Headmasters.

## Features
- **Public Admission Form**: Students can fill out admission forms with photo upload
- **Clerk Dashboard**: View applications, generate PDFs, print forms, and mark as reviewed
- **Headmaster Dashboard**: Approve or reject applications, view admitted students
- **Workflow**: Student submits → Clerk reviews & prints → Headmaster approves → Student admitted

## Initial Setup

### 1. Create Staff Accounts

You need to create accounts for your Clerk and Headmaster staff. Use the Supabase SQL Editor to run these commands:

#### Create a Clerk Account:
```sql
-- First, create an auth user (replace email and password)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'clerk@school.com',
  crypt('clerk123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Then create the user profile
INSERT INTO users (id, email, full_name, role)
SELECT id, email, 'School Clerk', 'clerk'
FROM auth.users
WHERE email = 'clerk@school.com';
```

#### Create a Headmaster Account:
```sql
-- First, create an auth user (replace email and password)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'headmaster@school.com',
  crypt('headmaster123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Then create the user profile
INSERT INTO users (id, email, full_name, role)
SELECT id, email, 'School Headmaster', 'headmaster'
FROM auth.users
WHERE email = 'headmaster@school.com';
```

### 2. Default Login Credentials

After running the SQL commands above:

**Clerk Login:**
- Email: clerk@school.com
- Password: clerk123

**Headmaster Login:**
- Email: headmaster@school.com
- Password: headmaster123

**IMPORTANT:** Change these passwords immediately after first login!

## How to Use

### For Students:
1. Visit the website
2. Fill out the admission form with all required details
3. Upload a photo
4. Submit the application
5. Wait for notification about admission status

### For Clerks:
1. Click "Staff Login" button
2. Log in with clerk credentials
3. View all submitted applications
4. Click the printer icon to print/download application as PDF
5. Print the form and send to Headmaster for seal and signature
6. Click the document icon to mark application as "Reviewed"
7. This sends it to the Headmaster's approval queue

### For Headmaster:
1. Click "Staff Login" button
2. Log in with headmaster credentials
3. View applications that have been reviewed by clerk
4. Review application details
5. Click "Approve & Admit Student" to approve
6. Approved students are automatically added to the students database
7. View all admitted students in the "Admitted Students" tab

## Workflow Example

1. **Student**: Ramesh fills admission form with photo → Submits
2. **Clerk**: Views application → Downloads/Prints PDF → Sends to HM → Marks as "Reviewed"
3. **Headmaster**: Reviews application → Approves with seal/signature → Student admitted
4. **Result**: Ramesh is now in the students database with admission number

## Database Tables

- **applications**: All admission applications with status tracking
- **users**: Clerk and Headmaster accounts
- **students**: Admitted students (created after HM approval)

## Security Features

- Photo uploads stored securely in Supabase Storage
- Role-based access control (RLS policies)
- Clerks can only review applications
- Only Headmasters can admit students
- Authentication required for all staff functions

## Support

For technical support or questions, contact your system administrator.
