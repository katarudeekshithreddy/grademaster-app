import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { CutoffManager } from './CutoffManager';
import { AlertTriangle, Download, Users, TrendingUp, Activity, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { exportToExcel } from '../utils/ExportEngine';
import { 
  calculateFinalScores, 
  calculateStatistics, 
  calculateZScores, 
  generateCutoffs, 
  assignGrades,
  sortDataset,
  detectOutliers,
  handleOutliers,
  calculateTeamRankings
} from '../utils/StatisticsEngine';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend, CartesianGrid, Brush
} from 'recharts';

export function PreviewDashboard({ template, dataset, onReset, gradingMode, teamMapping, teamDetails, teamMarks }) {
  const getAvatarColor = (name) => {
    if (!name) return 'hsl(210, 50%, 50%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
  };

  const [processedData, setProcessedData] = useState([]);
  const [stats, setStats] = useState(null);
  const [teamRankings, setTeamRankings] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [outlierModalOpen, setOutlierModalOpen] = useState(false);
  const [detectedOutliers, setDetectedOutliers] = useState([]);
  const [outlierStrategy, setOutlierStrategy] = useState('cap'); // Default as recommended
  const [hasHandledOutliers, setHasHandledOutliers] = useState(false);
  const [rawScoredData, setRawScoredData] = useState([]);
  const [rawStats, setRawStats] = useState(null);
  const [scoreMode, setScoreMode] = useState('weighted'); // 'weighted' or 'raw'

  useEffect(() => {
    if (!hasHandledOutliers) {
      const scored = calculateFinalScores(dataset, template, gradingMode, teamMapping, teamMarks);
      const rStats = calculateStatistics(scored);
      const outs = detectOutliers(scored, rStats);
      
      if (outs.length > 0) {
        setRawScoredData(scored);
        setRawStats(rStats);
        setDetectedOutliers(outs);
        setOutlierModalOpen(true);
        return;
      }
      
      finalizeDataProcess(scored, rStats);
      setHasHandledOutliers(true);
    }
  }, [dataset, template, hasHandledOutliers]);

  const finalizeDataProcess = (scoredData, currentStats) => {
    setStats(currentStats);
    const zScoredData = calculateZScores(scoredData, currentStats);
    setCutoffs(generateCutoffs(currentStats));
    setProcessedData(sortDataset(zScoredData, 'rank'));

    if (gradingMode === 'integrated') {
      const tRanks = calculateTeamRankings(teamMarks, teamMapping, template);
      setTeamRankings(tRanks);
    }
  };

  const handleApplyOutlierStrategy = () => {
    const adjustedDataset = handleOutliers(rawScoredData, rawStats, outlierStrategy);
    const adjustedStats = calculateStatistics(adjustedDataset);
    finalizeDataProcess(adjustedDataset, adjustedStats);
    setOutlierModalOpen(false);
    setHasHandledOutliers(true);
  };
  
  // Recalculate grades whenever cutoffs change
  const finalDataset = useMemo(() => {
    if (!stats || processedData.length === 0) return [];
    const graded = assignGrades(processedData, cutoffs, stats);
    
    if (!sortConfig) return graded;
    return [...graded].sort((a, b) => {
       let valA = a[sortConfig.key];
       let valB = b[sortConfig.key];
       
       if (sortConfig.key === 'identifier') {
          valA = String(valA);
          valB = String(valB);
       }
       
       if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
       if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
       return 0;
    });
  }, [processedData, cutoffs, stats, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const gradeBreakdown = useMemo(() => {
    const counts = {};
    finalDataset.forEach(d => { counts[d.grade] = (counts[d.grade] || 0) + 1; });
    const order = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F'];
    return order.map(g => ({ name: g, value: counts[g] || 0 })).filter(g => g.value > 0);
  }, [finalDataset]);

  // Distribution for Histogram (Exact Scores)
  const histogramData = useMemo(() => {
    const scoresMap = {};
    finalDataset.forEach(d => {
      const s = d.finalScore;
      if (!scoresMap[s]) {
        scoresMap[s] = { score: s, count: 0, students: [] };
      }
      scoresMap[s].count += 1;
      scoresMap[s].students.push(d.identifier);
    });
    
    return Object.values(scoresMap).sort((a, b) => a.score - b.score);
  }, [finalDataset]);

  const dynamicChartWidth = useMemo(() => {
    // We have a fixed domain of 100 units (0 to 100 score).
    // To ensure minimum 35px per unit spacing, we multiply domain by 35.
    const domainSize = 100;
    const minPxPerUnit = 35; 
    return Math.max(1200, domainSize * minPxPerUnit);
  }, [histogramData]);

  // Dragging Logic for Cutoffs
  const [draggingIdx, setDraggingIdx] = useState(null);
  const chartContainerRef = useRef(null);

  const handleMouseMoveGlobal = useCallback((e) => {
    if (draggingIdx === null || !chartContainerRef.current) return;
    
    const rect = chartContainerRef.current.getBoundingClientRect();
    
    // Position within the scrollable content
    // rect.left already accounts for scroll offset if chartContainerRef is on the inner content div
    const paddingLeft = 10;
    const paddingRight = 30;
    const chartContentWidth = rect.width - paddingLeft - paddingRight; 
    
    // Position within the score domain (0-100)
    const mouseXInContent = (e.clientX - rect.left) - paddingLeft;
    
    let newScore = (mouseXInContent / chartContentWidth) * 100;
    newScore = Math.round(newScore * 10) / 10;
    
    if (isNaN(newScore)) return;
    newScore = Math.max(0, Math.min(100, newScore));

    const newCutoffs = [...cutoffs];
    const prevVal = draggingIdx > 0 ? cutoffs[draggingIdx - 1].cutoff : 100.1;
    const nextVal = draggingIdx < cutoffs.length - 1 ? cutoffs[draggingIdx + 1].cutoff : -0.1;

    if (newScore < prevVal && newScore > nextVal) {
      newCutoffs[draggingIdx].cutoff = newScore;
      setCutoffs(newCutoffs);
    }
  }, [draggingIdx, cutoffs, setCutoffs, dynamicChartWidth]);

  const stopDragging = useCallback(() => setDraggingIdx(null), []);

  useEffect(() => {
    if (draggingIdx !== null) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', stopDragging);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, [draggingIdx, handleMouseMoveGlobal, stopDragging]);

  if (outlierModalOpen) {
      return (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
             <Card className="glass-panel premium-card" style={{ maxWidth: '650px', width: '100%', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--status-warning)', marginBottom: '1.5rem' }}>
                   <AlertTriangle size={32} />
                   <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Outliers Detected</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>We found extreme scores (|Z| &gt; 2) in the dataset that may distort the grading curve. How would you like to handle them?</p>
                
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="analytics-table" style={{ margin: 0 }}>
                       <thead>
                          <tr><th>Student</th><th>Final Score</th><th>Z-Score</th></tr>
                       </thead>
                       <tbody>
                          {detectedOutliers.map((o, i) => (
                             <tr key={i}>
                                <td>{o.student}</td>
                                <td>{o.score}</td>
                                <td style={{ color: 'var(--status-error)' }}>{o.z}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                   <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: outlierStrategy === 'ignore' ? 'var(--accent-primary)' : 'var(--border-light)', borderRadius: '8px', cursor: 'pointer', background: outlierStrategy === 'ignore' ? 'rgba(6,182,212,0.1)' : 'transparent' }}>
                      <input type="radio" name="outlier" checked={outlierStrategy === 'ignore'} onChange={() => setOutlierStrategy('ignore')} style={{ width: 'auto', marginTop: '0.25rem' }} />
                      <div>
                         <strong style={{ display: 'block', color: 'var(--text-primary)' }}>[1] Ignore</strong>
                         <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Keep all data unchanged. Continue normally.</span>
                      </div>
                   </label>
                   <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: outlierStrategy === 'remove' ? 'var(--accent-primary)' : 'var(--border-light)', borderRadius: '8px', cursor: 'pointer', background: outlierStrategy === 'remove' ? 'rgba(6,182,212,0.1)' : 'transparent' }}>
                      <input type="radio" name="outlier" checked={outlierStrategy === 'remove'} onChange={() => setOutlierStrategy('remove')} style={{ width: 'auto', marginTop: '0.25rem' }} />
                      <div>
                         <strong style={{ display: 'block', color: 'var(--text-primary)' }}>[2] Remove</strong>
                         <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Outliers are filtered out. Recalculates mean & σ entirely. Note: Loses real data.</span>
                      </div>
                   </label>
                   <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: outlierStrategy === 'cap' ? 'var(--accent-primary)' : 'var(--border-light)', borderRadius: '8px', cursor: 'pointer', background: outlierStrategy === 'cap' ? 'rgba(6,182,212,0.1)' : 'transparent' }}>
                      <input type="radio" name="outlier" checked={outlierStrategy === 'cap'} onChange={() => setOutlierStrategy('cap')} style={{ width: 'auto', marginTop: '0.25rem' }} />
                      <div>
                         <strong style={{ display: 'block', color: 'var(--text-primary)' }}>[3] Cap (Best Practical Choice 🔥)</strong>
                         <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Instead of removing, limit extreme values to Mean ± 2σ bounds. Keeps all students fairly.</span>
                      </div>
                   </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <Button variant="primary" onClick={handleApplyOutlierStrategy}>Apply Decision & Calculate</Button>
                </div>
             </Card>
          </div>
      );
  }

  if (!stats) return <div>Loading...</div>;

  const GRADE_COLORS = {
    'A': '#10b981', 'A-': '#059669', 'B': '#3b82f6', 'B-': '#2563eb', 'C': '#f59e0b', 'C-': '#d97706', 'D': '#ea580c', 'F': '#ef4444'
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const students = payload[0].payload.students || [];
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          maxWidth: '300px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exact Score: <span style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>{label}</span></p>
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
            {payload[0].value} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>students</span>
          </p>
          {students.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                 {students.map((s, i) => (
                   <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                      {s}
                   </li>
                 ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: payload[0].payload.fill, boxShadow: `0 0 10px ${payload[0].payload.fill}` }} />
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Grade {payload[0].name}</p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>{payload[0].value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>students</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {gradingMode === 'integrated' && teamRankings.length > 0 && (
        <Card className="glass-panel" style={{ marginTop: '2rem' }}>
           <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
             <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Competitive Team Standings</h3>
             <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aggregate ranking based on collective team-based benchmarks.</p>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
             {teamRankings.map((team) => (
                <div key={team.teamId} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', fontWeight: 900, opacity: 0.05, color: 'var(--accent-primary)' }}>#{team.teamRank}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-primary)' }}><Users size={20} /></div>
                        <strong style={{ fontSize: '1.1rem' }}>{teamDetails?.[team.teamId]?.teamName || `Team ${team.teamId}`}</strong>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{team.teamScore}%</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Score</div>
                     </div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}><strong>{team.memberCount} Members:</strong> {team.members.join(', ')}</div>
                </div>
             ))}
           </div>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>Final Analytics Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px', marginRight: '0.5rem' }}>
              <button onClick={() => setScoreMode('weighted')} style={{ background: scoreMode === 'weighted' ? 'var(--accent-primary)' : 'transparent', color: scoreMode === 'weighted' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Weighted (%)</button>
              <button onClick={() => setScoreMode('raw')} style={{ background: scoreMode === 'raw' ? 'var(--accent-primary)' : 'transparent', color: scoreMode === 'raw' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Raw Total</button>
           </div>
           
           <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px', marginRight: '0.5rem' }}>
              <button onClick={() => setSortConfig({ key: 'rank', direction: 'asc' })} style={{ background: sortConfig.key !== '_id' ? 'var(--accent-primary)' : 'transparent', color: sortConfig.key !== '_id' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Ranking Order</button>
              <button onClick={() => setSortConfig({ key: '_id', direction: 'asc' })} style={{ background: sortConfig.key === '_id' ? 'var(--accent-primary)' : 'transparent', color: sortConfig.key === '_id' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Original Order</button>
           </div>
           <Button variant="secondary" onClick={onReset}>Back to Start</Button>
           <Button variant="secondary" onClick={() => exportToExcel(finalDataset, template, teamMarks, scoreMode)} icon={Download}>Download Individual Results</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Card className="glass-panel premium-card" style={{ padding: '2rem', minHeight: '550px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                 <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                   <BarChart3 size={24} color="var(--accent-primary)" /> Dynamic Grade Distribution Analysis
                 </h3>
                 <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>High-precision frequency mapping with real-time boundary adjustment.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 10px var(--status-success)' }} />
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interactive Mode</span>
              </div>
           </div>
           
            <div className="custom-scrollbar" style={{ 
              height: '450px', 
              overflowX: 'auto', 
              overflowY: 'hidden', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              border: '1px solid var(--border-light)', 
              position: 'relative',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)'
            }}>
                <div ref={chartContainerRef} style={{ width: dynamicChartWidth, height: '100%', minWidth: '100%', cursor: draggingIdx !== null ? 'grabbing' : 'default' }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={histogramData} margin={{ top: 60, right: 30, left: 10, bottom: 20 }}>
                       <defs>
                         <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.9}/>
                           <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.2}/>
                         </linearGradient>
                         <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                           <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                           </feMerge>
                         </filter>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                       <XAxis dataKey="score" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} type="number" domain={[0, 100]} />
                       <YAxis stroke="var(--text-muted)" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={-10} />
                       <RechartsTooltip content={<CustomBarTooltip />} cursor={false} trigger="hover" shared={false} />
                       <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} activeBar={{ fill: 'var(--accent-primary)', opacity: 1, filter: 'url(#glow)' }} animationDuration={0} isAnimationActive={false} />
                       {cutoffs.map((c, idx) => {
                         if (c.grade === 'F') return null;
                         const color = GRADE_COLORS[c.grade] || 'var(--accent-primary)';
                         return (
                           <React.Fragment key={c.grade}>
                             <ReferenceLine x={c.cutoff} stroke="transparent" strokeWidth={40} style={{ cursor: 'ew-resize', pointerEvents: 'all' }} onMouseDown={(e) => { e.stopPropagation(); setDraggingIdx(idx); }} />
                             <ReferenceLine 
                               x={c.cutoff} 
                               stroke={color} 
                               strokeWidth={3}
                               strokeDasharray="6 4"
                               label={(props) => (
                                 <g transform={`translate(${props.viewBox.x}, ${props.viewBox.y - 30})`}>
                                   <rect x="-18" y="-12" width="36" height="24" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke={color} strokeWidth="1" />
                                   <text x="0" y="4" textAnchor="middle" fill={color} fontSize="12" fontWeight="900" style={{ pointerEvents: 'none' }}>{c.grade}</text>
                                   <circle cx="0" cy="25" r="3" fill={color} />
                                 </g>
                               )} style={{ pointerEvents: 'none' }} />
                           </React.Fragment>
                         );
                       })}
                       <ReferenceLine x={stats.mean} stroke="rgba(245, 158, 11, 0.5)" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Mean', fill: 'rgba(245, 158, 11, 0.8)', fontSize: 10, dy: 30, fontWeight: 700 }} />
                       <Brush dataKey="score" height={24} stroke="rgba(255,255,255,0.1)" fill="rgba(0,0,0,0.2)" travellerWidth={10} gap={1} style={{ pointerEvents: 'all' }} />
                     </BarChart>
                   </ResponsiveContainer>
                </div>
            </div>
           <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>💡 Click and drag the vertical grade colors (A, B, C...) to adjust boundaries.</div>
        </Card>

        <CutoffManager stats={stats} cutoffs={cutoffs} setCutoffs={setCutoffs} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.2fr', gap: '1.5rem' }}>
           <Card className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Statistical Standards</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {[{ label: 'Total Students', value: stats.count, sub: 'Population' }, { label: 'Class Mean (µ)', value: stats.mean, sub: 'Avg Score' }, { label: 'Std Dev (σ)', value: stats.stdDev, sub: 'Volatility' }, { label: 'Highest', value: stats.highest, sub: 'Top Peak' }, { label: 'Lowest', value: stats.lowest, sub: 'Min Threshold' }].map((s, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
           </Card>

           <Card className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Grade Breakdown</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={95} stroke="none" paddingAngle={5} cornerRadius={6}>
                      {gradeBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name]} />))}
                    </Pie>
                    <RechartsTooltip content={<CustomPieTooltip />} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>
      </div>

      <Card className="glass-panel premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}><h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Dynamic Results</h3></div>
        <div style={{ overflowX: 'auto', padding: '0 1.5rem 1.5rem 1.5rem' }}>
          <table className="analytics-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('rank')}>Rank {sortConfig.key === 'rank' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('identifier')}>Identifier {sortConfig.key === 'identifier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                {gradingMode === 'integrated' && (<th style={{ cursor: 'pointer' }} onClick={() => requestSort('teamId')}>Team ID {sortConfig.key === 'teamId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>)}
                {template.map(tCol => (
                  <th key={tCol.name}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tCol.type === 'team' ? 'Team' : 'Indiv'}</span>{tCol.name}</div></th>
                ))}
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort(scoreMode === 'weighted' ? 'finalScore' : 'totalRawScore')}>
                  {scoreMode === 'weighted' ? 'Final Score (%)' : 'Total (Raw)'} 
                  {((scoreMode === 'weighted' && sortConfig.key === 'finalScore') || (scoreMode === 'raw' && sortConfig.key === 'totalRawScore')) && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('zScore')}>Z-Score {sortConfig.key === 'zScore' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => requestSort('grade')}>Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {finalDataset.map((row, idx) => {
                const displayName = row.studentName || (row.identifier.includes(' - ') ? row.identifier.split(' - ')[1] : row.identifier);
                const rollStr = row.rollNumber || (row.identifier.includes(' - ') ? row.identifier.split(' - ')[0] : 'N/A');
                return (
                <tr key={idx} style={{ transition: 'all 0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.rank}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${getAvatarColor(displayName)}, #1e293b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>{displayName.charAt(0).toUpperCase()}</div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{displayName}</span><div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{rollStr}</div></div>
                    </div>
                  </td>
                  {gradingMode === 'integrated' && (<td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{row.teamId || '-'}</td>)}
                  {template.map(tCol => {
                    let mark = 0;
                    if (tCol.type === 'team' && teamMarks && row.teamId && teamMarks[row.teamId]) {
                      mark = teamMarks[row.teamId][tCol.name] || 0;
                    } else {
                      mark = row.grades[tCol.name] || 0;
                    }
                    return (
                      <td key={tCol.name} style={{ textAlign: 'center' }}>
                         <span style={{ color: mark === 0 ? 'rgba(255,255,255,0.05)' : 'var(--text-primary)', fontWeight: 500 }}>{mark}</span>
                         <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.15rem' }}>/ {tCol.maxMarks}</span>
                      </td>
                    );
                  })}
                  <td>
                    <div style={{ background: 'rgba(6,182,212,0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)', display: 'inline-block' }}>
                       <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1rem' }}>{scoreMode === 'weighted' ? row.finalScore : row.totalRawScore}</span>
                       <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '0.2rem' }}>{scoreMode === 'weighted' ? '%' : 'pts'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{row.zScore}</td>
                  <td style={{ textAlign: 'center' }}>
                     <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', fontWeight: '700', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: row.grade.startsWith('A') || row.grade.startsWith('B') ? 'var(--success-bg)' : row.grade.startsWith('C') ? 'var(--bg-tertiary)' : row.grade.startsWith('D') ? 'var(--warning-bg)' : 'var(--error-bg)', color: row.grade.startsWith('A') || row.grade.startsWith('B') ? 'var(--status-success)' : row.grade.startsWith('C') ? 'var(--text-primary)' : row.grade.startsWith('D') ? 'var(--status-warning)' : 'var(--status-error)', border: `1px solid ${row.grade.startsWith('A') || row.grade.startsWith('B') ? 'var(--status-success)' : row.grade.startsWith('C') ? 'var(--text-secondary)' : row.grade.startsWith('D') ? 'var(--status-warning)' : 'var(--status-error)'}33` }}>{row.grade}</span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
