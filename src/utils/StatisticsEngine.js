export function calculateFinalScores(dataset, template, gradingMode = 'standard', teamMapping = null, teamMarks = null) {
  return dataset.map(student => {
    let finalScore = 0;
    let totalRawScore = 0;
    const studentId = student.rollNumber || student.studentName;
    const teamId = (gradingMode === 'integrated' && teamMapping) ? teamMapping[studentId] : null;

    template.forEach(tCol => {
      let marks = 0;
      
      if (gradingMode === 'integrated' && tCol.type === 'team') {
        if (teamId && teamMarks && teamMarks[teamId]) {
          marks = teamMarks[teamId][tCol.name] || 0;
        }
      } else {
        marks = student.grades[tCol.name] || 0;
      }

      totalRawScore += marks;
      const pointValue = (marks / tCol.maxMarks) * (tCol.weight / 100);
      finalScore += pointValue;
    });

    finalScore = finalScore * 100;
    return { 
      ...student, 
      teamId, 
      finalScore: Number(finalScore.toFixed(2)),
      totalRawScore: Number(totalRawScore.toFixed(2))
    };
  });
}

export function calculateStatistics(dataset) {
  if (!dataset || dataset.length === 0) return { mean: 0, stdDev: 0, highest: 0, lowest: 0, count: 0 };
  
  const scores = dataset.map(d => d.finalScore);
  const count = scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  
  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  
  // Standard Deviation (Population)
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    highest,
    lowest,
    count
  };
}

export function calculateZScores(dataset, stats) {
  return dataset.map(student => {
    let zScore = 0;
    if (stats.stdDev !== 0) {
      zScore = (student.finalScore - stats.mean) / stats.stdDev;
    }
    return { ...student, zScore: Number(zScore.toFixed(3)) };
  });
}

export function generateCutoffs(stats) {
  const { mean, stdDev } = stats;
  // If stdDev is 0, we can't do statistical cutoffs properly
  if (stdDev === 0) {
    return [
      { grade: 'A', cutoff: -Infinity } // Everyone gets same grade later
    ];
  }

  // Common distribution logic:
  // A: > mean + 1.5 sigma
  // A-: > mean + 1.0 sigma
  // B: > mean + 0.5 sigma
  // B-: > mean
  // C: > mean - 0.5 sigma
  // C-: > mean - 1.0 sigma
  // D: > mean - 1.5 sigma
  // F: <= mean - 1.5 sigma

  return [
    { grade: 'A', cutoff: Number((mean + 1.5 * stdDev).toFixed(2)) },
    { grade: 'A-', cutoff: Number((mean + 1.0 * stdDev).toFixed(2)) },
    { grade: 'B', cutoff: Number((mean + 0.5 * stdDev).toFixed(2)) },
    { grade: 'B-', cutoff: Number(mean.toFixed(2)) },
    { grade: 'C', cutoff: Number((mean - 0.5 * stdDev).toFixed(2)) },
    { grade: 'C-', cutoff: Number((mean - 1.0 * stdDev).toFixed(2)) },
    { grade: 'D', cutoff: Number((mean - 1.5 * stdDev).toFixed(2)) },
    { grade: 'F', cutoff: 0 } // Bottom bucket
  ];
}

export function assignGrades(dataset, cutoffs, stats) {
  if (stats.stdDev === 0) {
    return dataset.map(student => ({ ...student, grade: 'B' })); // Default fallback
  }

  // Ensure cutoffs are sorted descending by score needed
  const sortedCutoffs = [...cutoffs].sort((a, b) => b.cutoff - a.cutoff);

  return dataset.map(student => {
    let assigned = sortedCutoffs[sortedCutoffs.length - 1].grade; // Default to lowest
    for (let i = 0; i < sortedCutoffs.length; i++) {
       if (student.finalScore >= sortedCutoffs[i].cutoff) {
          assigned = sortedCutoffs[i].grade;
          break;
       }
    }
    return { ...student, grade: assigned };
  });
}

// Internal Custom Heap implementation for Ranking
class MaxHeap {
  constructor() {
    this.heap = [];
  }
  
  parent(i) { return Math.floor((i - 1) / 2); }
  leftChild(i) { return 2 * i + 1; }
  rightChild(i) { return 2 * i + 2; }
  
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
  
  insert(node) {
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }
  
  heapifyUp(i) {
    while (i > 0 && this.heap[this.parent(i)].finalScore < this.heap[i].finalScore) {
      this.swap(this.parent(i), i);
      i = this.parent(i);
    }
  }
  
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return max;
  }
  
  heapifyDown(i) {
    let maxIndex = i;
    const l = this.leftChild(i);
    const r = this.rightChild(i);
    
    if (l < this.heap.length && this.heap[l].finalScore > this.heap[maxIndex].finalScore) {
      maxIndex = l;
    }
    if (r < this.heap.length && this.heap[r].finalScore > this.heap[maxIndex].finalScore) {
      maxIndex = r;
    }
    if (i !== maxIndex) {
      this.swap(i, maxIndex);
      this.heapifyDown(maxIndex);
    }
  }
}

export function sortDataset(dataset, orderBy = 'original') {
  if (orderBy === 'original') return dataset;
  
  if (orderBy === 'rank') {
    const heap = new MaxHeap();
    dataset.forEach(d => heap.insert({ ...d, finalScore: d.finalScore })); // Ensure we use finalScore
    const sorted = [];
    while(heap.heap.length > 0) {
      sorted.push(heap.extractMax());
    }
    // Assign ranks
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  }
  
  return dataset;
}

export function calculateTeamRankings(teamMarks, teamMapping, template) {
  if (!teamMarks || !template) return [];

  const teamTemplate = template.filter(t => t.type === 'team');
  if (teamTemplate.length === 0) return [];

  const rankings = Object.keys(teamMarks).map(teamId => {
    let teamScore = 0;
    let totalWeight = 0;
    
    teamTemplate.forEach(tCol => {
      const marks = teamMarks[teamId][tCol.name] || 0;
      const weight = tCol.weight;
      // We calculate percentage relative to team-only weight
      teamScore += (marks / tCol.maxMarks) * weight;
      totalWeight += weight;
    });

    // Normalize to 100% scale
    const normalizedScore = totalWeight > 0 ? (teamScore / totalWeight) * 100 : 0;
    
    // Find members
    const members = Object.entries(teamMapping)
      .filter(([studentId, tId]) => tId === teamId)
      .map(([studentId]) => studentId);

    return {
      teamId,
      finalScore: Number(normalizedScore.toFixed(2)), // Used by MaxHeap
      members,
      memberCount: members.length
    };
  });

  // Sort and rank
  const heap = new MaxHeap();
  rankings.forEach(r => heap.insert(r));
  const sorted = [];
  while(heap.heap.length > 0) {
    sorted.push(heap.extractMax());
  }
  
  return sorted.map((item, index) => ({ 
    ...item, 
    teamRank: index + 1,
    teamScore: item.finalScore 
  }));
}

export function detectOutliers(dataset, rawStats) {
  const { stdDev, mean, count } = rawStats;

  // Case 1: stdDev === 0 -> No outliers. Case 2: small dataset <= 3 -> Skip handling.
  if (count <= 3 || stdDev === 0) return [];

  const outliers = [];
  dataset.forEach(student => {
     const z = (student.finalScore - mean) / stdDev;
     if (Math.abs(z) > 2) {
        outliers.push({
           student: student.identifier,
           score: student.finalScore,
           z: Number(z.toFixed(2))
        });
     }
  });

  // Case 3: All values flagged -> Fallback to Ignore
  if (outliers.length > 0 && outliers.length === count) return []; 

  return outliers;
}

export function handleOutliers(dataset, rawStats, strategy) {
  if (strategy === 'ignore' || !strategy) return dataset;
  
  const { mean, stdDev } = rawStats;
  let modifiedDataset = [...dataset];

  if (strategy === 'remove') {
      modifiedDataset = modifiedDataset.filter(student => {
          const z = (student.finalScore - mean) / stdDev;
          return Math.abs(z) <= 2;
      });
  } 
  else if (strategy === 'cap') {
      const upperLimit = mean + 2 * stdDev;
      const lowerLimit = mean - 2 * stdDev;

      modifiedDataset = modifiedDataset.map(student => {
          let adjustedScore = student.finalScore;
          if (adjustedScore > upperLimit) adjustedScore = upperLimit;
          else if (adjustedScore < lowerLimit) adjustedScore = lowerLimit;
          
          return { ...student, finalScore: Number(adjustedScore.toFixed(2)) };
      });
  }

  return modifiedDataset;
}
