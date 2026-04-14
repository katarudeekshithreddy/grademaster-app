const XLSX = require('xlsx');

const mockData = [
  { student_roll_number: 'R101', student_name: 'Alice Johnson', Midterm: 85, Final: 92 },
  { student_roll_number: 'R102', student_name: 'Bob Smith', Midterm: 70, Final: 75 },
  { student_roll_number: 'R103', student_name: 'Charlie Brown', Midterm: '', Final: 88 },
  { student_roll_number: 'R104', student_name: 'Diana Prince', Midterm: 98, Final: 95 },
  { student_roll_number: 'R105', student_name: 'Evan Wright', Midterm: 105, Final: 60 },
  { student_roll_number: 'R106', student_name: 'Fiona Gallagher', Midterm: 55, Final: 62 },
  { student_roll_number: 'R107', student_name: 'George Miller', Midterm: 80, Final: 81 },
  { student_roll_number: 'R108', student_name: 'Hannah Abbott', Midterm: 'Absent', Final: 'Dropped' },
  { student_roll_number: 'R109', student_name: 'Ian Malcolm', Midterm: 90, Final: 89 },
  { student_roll_number: 'R110', student_name: 'Jenny Weasley', Midterm: 78, Final: 84 },
];

const worksheet = XLSX.utils.json_to_sheet(mockData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");

XLSX.writeFile(workbook, 'Sample_Grades.xlsx');
console.log('Sample_Grades.xlsx generated successfully!');
