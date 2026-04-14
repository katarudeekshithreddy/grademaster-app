import * as XLSX from 'xlsx';

/**
 * EXPORT INDIVIDUAL RESULTS
 */
export function exportToExcel(dataset, template) {
  const excelData = dataset.map(row => {
    const displayName = row.studentName || (row.identifier.includes(' - ') ? row.identifier.split(' - ')[1] : row.identifier);
    const rollStr = row.rollNumber || (row.identifier.includes(' - ') ? row.identifier.split(' - ')[0] : 'N/A');

    const formattedRow = {
      Rank: row.rank,
      'Roll Number': rollStr,
      'Student Name': displayName,
      'Team ID': row.teamId || 'N/A'
    };

    template.forEach(tCol => {
      formattedRow[tCol.name] = row.grades[tCol.name] || 0;
    });

    formattedRow['Total Weighted Score'] = row.finalScore;
    formattedRow['Percentage'] = row.finalScore;
    formattedRow['Z-Score'] = row.zScore;
    formattedRow['Final Grade'] = row.grade;

    return formattedRow;
  });

  generateDownload(excelData, "Final_Individual_Grades");
}

/**
 * EXPORT TEAM RANKINGS
 */
export function exportTeamsToExcel(teamRankings) {
  const excelData = teamRankings.map(team => ({
    'Team Rank': team.teamRank,
    'Team ID': team.teamId,
    'Collective Score (%)': team.teamScore,
    'Member Count': team.memberCount,
    'Members': team.members.join(', ')
  }));

  generateDownload(excelData, "Integrated_Team_Rankings");
}

/**
 * SHARED DOWNLOAD HANDLER
 */
function generateDownload(data, filename) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
