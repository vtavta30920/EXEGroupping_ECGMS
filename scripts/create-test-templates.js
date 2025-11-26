const XLSX = require('xlsx');
const fs = require('fs');

const templates = [
  { 
    name: 'Standard', 
    data: [
      { StudentCode: 'SE170001', FirstName: 'Nguyen', LastName: 'Van A', Email: 'test1@fpt.edu.vn', MajorCode: 'SE' },
      { StudentCode: 'SE170002', FirstName: 'Tran', LastName: 'Thi B', Email: 'test2@fpt.edu.vn', MajorCode: 'SS' }
    ] 
  },
  { 
    name: 'Minimal', 
    data: [
      { StudentCode: 'SE170001', FullName: 'Nguyen Van A', Email: 'test1@fpt.edu.vn', MajorCode: 'SE' },
      { StudentCode: 'SE170002', FullName: 'Tran Thi B', Email: 'test2@fpt.edu.vn', MajorCode: 'SS' }
    ] 
  },
  { 
    name: 'WithUsername', 
    data: [
      { StudentCode: 'SE170001', UserName: 'se170001', FirstName: 'Nguyen', LastName: 'Van A', Email: 'test1@fpt.edu.vn', MajorCode: 'SE' },
      { StudentCode: 'SE170002', UserName: 'ss170002', FirstName: 'Tran', LastName: 'Thi B', Email: 'test2@fpt.edu.vn', MajorCode: 'SS' }
    ] 
  }
];

fs.mkdirSync('test-templates', { recursive: true });

templates.forEach(t => {
  const ws = XLSX.utils.json_to_sheet(t.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, `test-templates/${t.name}.xlsx`);
  console.log(`✅ Created: test-templates/${t.name}.xlsx`);
});

console.log('\n📋 Now test each file via the UI!');
EOF