import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { UploadCloud, AlertCircle, FileSpreadsheet, CheckCircle, Users, Trophy, GraduationCap, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';
import { runStrictValidation, runTeamMarksValidation, validateTeamMapping } from '../utils/validationPipeline';

export function ExcelPipeline({ template, gradingMode, maxTeamSize, setDataset, setTeamMapping, setTeamDetails, setTeamMarks, setValidationErrors, onNext }) {
  const [files, setFiles] = useState({
    students: { data: null, name: '' },
    mapping: { data: null, name: '' },
    teamMarks: { data: null, name: '' }
  });
  
  const [globalError, setGlobalError] = useState(null);
  const studentRef = useRef(null);
  const mappingRef = useRef(null);
  const teamMarksRef = useRef(null);

  const readFile = (file, key) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        setFiles(prev => ({
          ...prev,
          [key]: { data, name: file.name }
        }));
        setGlobalError(null);
      } catch (err) {
        setGlobalError(`Integrity failure in ${file.name}. Parse aborted.`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcess = () => {
    const studentResult = runStrictValidation(files.students.data, template);
    if (studentResult.globalError) return setGlobalError(`[Students Record] ${studentResult.globalError}`);

    let finalErrors = [...studentResult.errors];
    let mappingResult = null;
    let teamMarksResult = null;

    if (gradingMode === 'integrated') {
      mappingResult = validateTeamMapping(files.mapping.data, studentResult.dataset, maxTeamSize);
      if (mappingResult.globalError) return setGlobalError(`[Mapping Logic] ${mappingResult.globalError}`);

      teamMarksResult = runTeamMarksValidation(files.teamMarks.data, template);
      if (teamMarksResult.globalError) return setGlobalError(`[Team Metric] ${teamMarksResult.globalError}`);

      finalErrors = [...finalErrors, ...teamMarksResult.errors];
    }

    setDataset(studentResult.dataset);
    setValidationErrors(finalErrors);
    
    if (gradingMode === 'integrated') {
      setTeamMapping(mappingResult.studentToTeam);
      setTeamDetails(mappingResult.mapping);
      setTeamMarks(teamMarksResult.marksMap);
    }

    if (finalErrors.length > 0) {
      onNext('validate');
    } else {
      onNext('preview');
    }
  };

  const isReady = gradingMode === 'standard' 
    ? files.students.data 
    : (files.students.data && files.mapping.data && files.teamMarks.data);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {globalError && (
        <Card className="glass-panel" style={{ border: '1px solid var(--status-error)', background: 'var(--error-bg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--status-error)' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={32} />
            </div>
            <div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Ingestion Blocked: Diagnostic Alert</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>{globalError}</p>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: gradingMode === 'integrated' ? 'repeat(3, 1fr)' : '1fr', gap: '2rem' }}>
        <UploadBox 
          title="Student Records" 
          subtitle="Master Individual Marks"
          icon={GraduationCap}
          fileName={files.students.name}
          onUpload={(f) => readFile(f, 'students')}
          inputRef={studentRef}
        />

        {gradingMode === 'integrated' && (
          <>
            <UploadBox 
              title="Team Assignment" 
              subtitle="Student-to-Group Matrix"
              icon={Users}
              fileName={files.mapping.name}
              onUpload={(f) => readFile(f, 'mapping')}
              inputRef={mappingRef}
            />
            <UploadBox 
              title="Collective Metrics" 
              subtitle="Group Level Evaluation"
              icon={Trophy}
              fileName={files.teamMarks.name}
              onUpload={(f) => readFile(f, 'teamMarks')}
              inputRef={teamMarksRef}
            />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <Card className="glass-panel" style={{ padding: '2.5rem' }}>
          <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
            <ShieldCheck size={22} /> Data Governance Protocols
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <RequirementItem 
              title="1. Core Identifiers" 
              list={['student_name OR roll_number', 'Mandatory for student records', 'Zero null tolerance']}
            />
            {gradingMode === 'integrated' && (
              <>
                <RequirementItem 
                  title="2. Mapping Integrity" 
                  list={['team_no (integer)', `student1 to student${maxTeamSize}`, 'Matches student record IDs']}
                />
                <RequirementItem 
                  title="3. Team Scores" 
                  list={['team_no primary key', 'Component names match setup', 'Numeric scores only']}
                />
              </>
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ 
             padding: '2rem', background: 'var(--bg-glass)', borderRadius: '20px', 
             border: '1px solid var(--border-light)', textAlign: 'center'
           }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Pipeline Status</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <StatusDot active={!!files.students.data} />
                  <StatusDot active={gradingMode === 'standard' || !!files.mapping.data} />
                  <StatusDot active={gradingMode === 'standard' || !!files.teamMarks.data} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isReady ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {isReady ? 'All Protocols Verified' : 'Awaiting Data Packages'}
                </div>
             </div>
           </div>

           <Button 
             variant="primary" 
             size="lg" 
             disabled={!isReady} 
             onClick={handleProcess}
             icon={ArrowRight}
             style={{ padding: '1.5rem', width: '100%', borderRadius: '18px', fontSize: '1rem' }}
           >
             Initialize Validation
           </Button>
        </div>
      </div>
    </div>
  );
}

function UploadBox({ title, subtitle, icon: Icon, fileName, onUpload, inputRef }) {
  return (
    <div 
      onClick={() => inputRef.current.click()}
      className="glass-panel premium-card"
      style={{ 
        textAlign: 'center', padding: '3rem 2rem', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: fileName ? 'rgba(16,185,129,0.03)' : 'var(--bg-surface)',
        borderColor: fileName ? 'rgba(16,185,129,0.3)' : 'var(--border-color)',
        minHeight: '280px', justifyContent: 'center'
      }}
    >
      <div style={{ 
        padding: '1.25rem', borderRadius: '20px', 
        background: fileName ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
        boxShadow: fileName ? '0 0 20px rgba(16,185,129,0.1)' : 'none'
      }}>
        <Icon size={40} color={fileName ? 'var(--status-success)' : 'var(--accent-primary)'} />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h4>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      
      {fileName ? (
        <div style={{ 
          marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--success-bg)', 
          borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--status-success)', fontSize: '0.75rem', fontWeight: 700
        }}>
          <CheckCircle size={14} /> {fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName}
        </div>
      ) : (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <Zap size={14} /> Ready for Ingestion
        </div>
      )}
      
      <input 
        type="file" accept=".xlsx,.xls" ref={inputRef} 
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} 
        style={{ display: 'none' }} 
      />
    </div>
  );
}

function RequirementItem({ title, list }) {
  return (
    <div>
      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{title}</strong>
      <ul style={{ padding: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.map((item, i) => (
          <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
             {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusDot({ active }) {
  return (
    <div style={{ 
      width: '12px', height: '12px', borderRadius: '50%', 
      background: active ? 'var(--status-success)' : 'rgba(255,255,255,0.1)',
      boxShadow: active ? '0 0 10px var(--status-success)' : 'none',
      transition: 'all 0.3s'
    }} />
  );
}
