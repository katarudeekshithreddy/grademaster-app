const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'test_data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// 1. STUDENTS FILE
const studentData = [
  { roll_number: '101', student_name: 'Alice Johnson', Midterm: 85 },
  { roll_number: '102', student_name: 'Bob Smith', Midterm: 78 },
  { roll_number: '103', student_name: 'Charlie Brown', Midterm: 92 },
  { roll_number: '104', student_name: 'Diana Prince', Midterm: 88 }
];
const studentWS = XLSX.utils.json_to_sheet(studentData);
const studentWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(studentWB, studentWS, 'Students');
XLSX.writeFile(studentWB, path.join(outputDir, '1_students.xlsx'));

// 2. MAPPING FILE (Max Team Size = 2)
const mappingData = [
  { team_no: 'T1', team_name: 'Alpha Squad', student1: '101', student2: '102' },
  { team_no: 'T2', team_name: 'Beta Force', student1: '103', student2: '104' }
];
const mappingWS = XLSX.utils.json_to_sheet(mappingData);
const mappingWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(mappingWB, mappingWS, 'Mapping');
XLSX.writeFile(mappingWB, path.join(outputDir, '2_mapping.xlsx'));

// 3. TEAM MARKS FILE
const teamMarksData = [
  { team_no: 'T1', Project: 95 },
  { team_no: 'T2', Project: 88 }
];
const teamMarksWS = XLSX.utils.json_to_sheet(teamMarksData);
const teamMarksWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(teamMarksWB, teamMarksWS, 'TeamMarks');
XLSX.writeFile(teamMarksWB, path.join(outputDir, '3_team_performance.xlsx'));

console.log('Sample Integrated Datasets Generated successfully in /scratch/test_data/');
