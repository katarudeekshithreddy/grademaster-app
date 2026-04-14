/**
 * VALIDATE NUMERIC CELL
 * Shared logic for validating marks against max marks and range rules.
 */
function validateNumericCell(value, maxMarks, rowIndex, studentId, column, errors) {
  const cellId = `${studentId}-${column}`;
  
  if (value === undefined || value === null || value === '') {
    errors.push({ rowIndex, studentId, column, issue: 'Missing value', currentValue: value, maxMarks, cellId });
    return null;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    errors.push({ rowIndex, studentId, column, issue: 'Non-numeric value', currentValue: value, maxMarks, cellId });
    return null;
  }
  
  if (num > maxMarks) {
    errors.push({ rowIndex, studentId, column, issue: `Marks exceed maximum (${maxMarks})`, currentValue: num, maxMarks, cellId });
  } else if (num < 0) {
    errors.push({ rowIndex, studentId, column, issue: 'Negative marks', currentValue: num, maxMarks, cellId });
  }
  
  return num;
}

/**
 * INDIVIDUAL MARKS VALIDATION
 */
export function runStrictValidation(data, template) {
  const result = { isValid: true, globalError: null, errors: [], dataset: [] };

  if (!data || data.length === 0) {
    result.isValid = false;
    result.globalError = 'Completely Empty File: The Excel file contains no data.';
    return result;
  }

  const columns = Object.keys(data[0] || {});
  const rollCol = columns.find(c => c.toLowerCase().includes('roll'));
  const nameCol = columns.find(c => c.toLowerCase().includes('name'));

  if (!rollCol && !nameCol) {
    result.isValid = false;
    result.globalError = 'Mandatory Identifier Missing: Dataset must include either student_name or student_roll_number.';
    return result;
  }

  // Filter template for individual components
  const indivTemplate = template.filter(t => t.type !== 'team');
  
  const processedData = data.map((row, rowIndex) => {
    const roll = rollCol ? String(row[rollCol]).trim() : null;
    const name = nameCol ? String(row[nameCol]).trim() : null;
    const identifier = (roll && name) ? `${roll} - ${name}` : (roll || name || `Unknown (Row ${rowIndex + 2})`);

    const newRow = { _id: rowIndex, identifier, rollNumber: roll, studentName: name, grades: {} };

    indivTemplate.forEach(tCol => {
      const colNameInExcel = columns.find(c => c.toLowerCase() === tCol.name.toLowerCase());
      const rawVal = colNameInExcel ? row[colNameInExcel] : null;
      newRow.grades[tCol.name] = validateNumericCell(rawVal, tCol.maxMarks, rowIndex, identifier, tCol.name, result.errors);
    });

    return newRow;
  });

  result.dataset = processedData;
  if (result.errors.length > 0) result.isValid = false;
  return result;
}

/**
 * TEAM MARKS VALIDATION
 */
export function runTeamMarksValidation(data, template) {
  const result = { isValid: true, globalError: null, errors: [], marksMap: {} };

  if (!data || data.length === 0) {
    result.isValid = false;
    result.globalError = 'Team Marks File is empty.';
    return result;
  }

  const columns = Object.keys(data[0] || {});
  const teamNoCol = columns.find(c => c.toLowerCase() === 'team_no');

  if (!teamNoCol) {
    result.isValid = false;
    result.globalError = 'Mandatory Column Missing: Team Marks file must have a "team_no" column.';
    return result;
  }

  const teamTemplate = template.filter(t => t.type === 'team');

  data.forEach((row, rowIndex) => {
    const teamNo = String(row[teamNoCol]).trim();
    if (!teamNo) return;

    const teamGrades = {};
    teamTemplate.forEach(tCol => {
      const colNameInExcel = columns.find(c => c.toLowerCase() === tCol.name.toLowerCase());
      const rawVal = colNameInExcel ? row[colNameInExcel] : null;
      teamGrades[tCol.name] = validateNumericCell(rawVal, tCol.maxMarks, rowIndex, `Team ${teamNo}`, tCol.name, result.errors);
    });

    result.marksMap[teamNo] = teamGrades;
  });

  if (result.errors.length > 0) result.isValid = false;
  return result;
}

/**
 * TEAM MAPPING VALIDATION
 */
export function validateTeamMapping(data, studentDataset, maxTeamSize) {
  const result = { isValid: true, globalError: null, mapping: {}, studentToTeam: {} };

  if (!data || data.length === 0) {
    result.isValid = false;
    result.globalError = 'Team Mapping File is empty.';
    return result;
  }

  const columns = Object.keys(data[0] || {});
  const teamNoCol = columns.find(c => c.toLowerCase() === 'team_no');
  
  if (!teamNoCol) {
    result.isValid = false;
    result.globalError = 'Mandatory Column Missing: Team Mapping file must have a "team_no" column.';
    return result;
  }

  // Validate student1...studentN columns
  for (let i = 1; i <= maxTeamSize; i++) {
    if (!columns.includes(`student${i}`)) {
      result.isValid = false;
      result.globalError = `Protocol Violation: Team Mapping file must include columns from student1 up to student${maxTeamSize}. Missing: student${i}`;
      return result;
    }
  }

  const assignedStudents = new Set();
  const studentIdsInSystem = new Set(studentDataset.map(s => s.rollNumber || s.studentName));

  data.forEach((row, rowIndex) => {
    const teamNo = String(row[teamNoCol]).trim();
    if (!teamNo) return;

    const members = [];
    for (let i = 1; i <= maxTeamSize; i++) {
      const sId = String(row[`student${i}`] || '').trim();
      if (sId) {
        // Rule 2: Duplicate check
        if (assignedStudents.has(sId)) {
          result.isValid = false;
          result.globalError = `Integrity Breach: Student "${sId}" is assigned to multiple teams. Check Row ${rowIndex + 2}.`;
          return;
        }

        // Rule 3: Existence check
        if (!studentIdsInSystem.has(sId)) {
          result.isValid = false;
          result.globalError = `Reference Error: Student "${sId}" in Team Mapping not found in Students record. Check Row ${rowIndex + 2}.`;
          return;
        }

        assignedStudents.add(sId);
        members.push(sId);
        result.studentToTeam[sId] = teamNo;
      }
    }

    // Rule 1: Empty Team check
    if (members.length === 0) {
      result.isValid = false;
      result.globalError = `Structural Flaw: Team "${teamNo}" has no members assigned. Check Row ${rowIndex + 2}.`;
      return;
    }

    result.mapping[teamNo] = { teamName: row['team_name'] || `Team ${teamNo}`, members };
  });

  if (!result.isValid) return result;

  // Rule 4: Total coverage check
  const unassigned = studentDataset.filter(s => !assignedStudents.has(s.rollNumber || s.studentName));
  if (unassigned.length > 0) {
    result.isValid = false;
    result.globalError = `Coverage Gap: ${unassigned.length} students are not assigned to any team. Example: ${unassigned[0].identifier}`;
    return result;
  }

  return result;
}
