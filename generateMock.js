const XLSX = require('xlsx');
const fs = require('fs');

// We use the default template structure from the app
// { name: 'Midterm', maxMarks: 100 }, { name: 'Final', maxMarks: 100 }
const mockData = [
  { student_roll_number: 'R101', student_name: 'Alice Johnson', Midterm: 85, Final: 92 },
  { student_roll_number: 'R102', student_name: 'Bob Smith', Midterm: 70, Final: 75 },
  // Let's introduce an intentional missing value for validation testing
  { student_roll_number: 'R103', student_name: 'Charlie Brown', Midterm: '', Final: 88 },
  { student_roll_number: 'R104', student_name: 'Diana Prince', Midterm: 98, Final: 95 },
  // Let's introduce an intentional overflow error
  { student_roll_number: 'R105', student_name: 'Evan Wright', Midterm: 105, Final: 60 },
  { student_roll_number: 'R106', student_name: 'Fiona Gallagher', Midterm: 55, Final: 62 },
  { student_roll_number: 'R107', student_name: 'George Miller', Midterm: 80, Final: 81 },
  // Intentionally completely broken record
  { student_roll_number: 'R108', student_name: 'Hannah Abbott', Midterm: 'Absent', Final: 'Dropped' },
  { student_roll_number: 'R109', student_name: 'Ian Malcolm', Midterm: 90, Final: 89 },
  { student_roll_number: 'R110', student_name: 'Jenny Weasley', Midterm: 78, Final: 84 },
];

const worksheet = XLSX.utils.json_to_sheet(mockData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");

XLSX.writeFile(workbook, 'Sample_Grades.xlsx');
console.log('Sample_Grades.xlsx generated successfully!');
