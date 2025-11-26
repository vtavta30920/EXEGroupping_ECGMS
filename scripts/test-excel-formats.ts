// scripts/test-excel-formats.ts

import * as XLSX from 'xlsx';
import * as fs from 'fs';

// Define multiple possible column name patterns
const testPatterns = [
  // Pattern 1: PascalCase (Most common for C# .NET)
  {
    name: 'PascalCase_Standard',
    data: [{
      StudentCode: 'SE170001',
      FirstName: 'Nguyen',
      LastName: 'Van A',
      Email: 'test1@fpt.edu.vn',
      MajorCode: 'SE',
      PhoneNumber: '0123456789',
      DateOfBirth: '2000-01-15',
    }],
  },
  
  // Pattern 2: PascalCase with FullName
  {
    name: 'PascalCase_FullName',
    data: [{
      StudentCode: 'SE170002',
      FullName: 'Nguyen Van A',
      Email: 'test2@fpt.edu.vn',
      MajorCode: 'SE',
      PhoneNumber: '0123456789',
      DateOfBirth: '2000-01-15',
    }],
  },
  
  // Pattern 3: camelCase
  {
    name: 'camelCase',
    data: [{
      studentCode: 'SE170003',
      firstName: 'Nguyen',
      lastName: 'Van A',
      email: 'test3@fpt.edu.vn',
      majorCode: 'SE',
      phoneNumber: '0123456789',
      dateOfBirth: '2000-01-15',
    }],
  },
  
  // Pattern 4: lowercase
  {
    name: 'lowercase',
    data: [{
      studentcode: 'SE170004',
      firstname: 'Nguyen',
      lastname: 'Van A',
      email: 'test4@fpt.edu.vn',
      majorcode: 'SE',
      phonenumber: '0123456789',
      dateofbirth: '2000-01-15',
    }],
  },
  
  // Pattern 5: With spaces
  {
    name: 'WithSpaces',
    data: [{
      'Student Code': 'SE170005',
      'First Name': 'Nguyen',
      'Last Name': 'Van A',
      'Email': 'test5@fpt.edu.vn',
      'Major Code': 'SE',
      'Phone Number': '0123456789',
      'Date of Birth': '2000-01-15',
    }],
  },
  
  // Pattern 6: Minimal fields
  {
    name: 'Minimal',
    data: [{
      StudentCode: 'SE170006',
      FullName: 'Nguyen Van A',
      Email: 'test6@fpt.edu.vn',
      MajorCode: 'SE',
    }],
  },
  
  // Pattern 7: Alternative naming
  {
    name: 'Alternative',
    data: [{
      Code: 'SE170007',
      Name: 'Nguyen Van A',
      Email: 'test7@fpt.edu.vn',
      Major: 'SE',
    }],
  },
];

// Create test files
const outputDir = 'test-templates';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

testPatterns.forEach(pattern => {
  const ws = XLSX.utils.json_to_sheet(pattern.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  
  const filename = `${outputDir}/${pattern.name}_test.xlsx`;
  XLSX.writeFile(wb, filename);
  
  console.log(`✅ Created: ${filename}`);
  console.log(`   Columns: ${Object.keys(pattern.data[0]).join(', ')}`);
});

console.log('\n📋 Test these files one by one to find the correct format!');