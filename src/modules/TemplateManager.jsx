import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Plus, Trash2, AlertTriangle, ArrowRight, Save, FileSpreadsheet, Layers, Weight, Trash } from 'lucide-react';

export function TemplateManager({ template, setTemplate, gradingMode, setGradingMode, maxTeamSize, setMaxTeamSize, onNext }) {
  const [cols, setCols] = useState(
    template.length > 0 ? template : [
      { id: Date.now().toString(), name: 'Midterm', maxMarks: 100, weight: 40, type: 'individual' },
      { id: (Date.now() + 1).toString(), name: 'Final', maxMarks: 100, weight: 60, type: 'individual' }
    ]
  );
  
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem('grade_app_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState('');

  const [weightError, setWeightError] = useState(false);
  const totalWeight = cols.reduce((sum, col) => sum + (Number(col.weight) || 0), 0);

  useEffect(() => {
    setWeightError(totalWeight !== 100 && cols.length > 0);
  }, [totalWeight, cols]);

  const handleAddColumn = () => {
    setCols([...cols, { id: Date.now().toString(), name: 'New Component', maxMarks: 100, weight: 0, type: 'individual' }]);
  };

  const handleRemoveColumn = (id) => {
    setCols(cols.filter(c => c.id !== id));
  };

  const handleUpdateColumn = (id, field, value) => {
    setCols(cols.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleNormalize = () => {
    if (totalWeight === 0) return;
    const normalizedCols = cols.map(c => ({
      ...c,
      weight: parseFloat(((c.weight / totalWeight) * 100).toFixed(2))
    }));
    setCols(normalizedCols);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newTemplates = [...savedTemplates, { name: presetName, cols: cols }];
    setSavedTemplates(newTemplates);
    localStorage.setItem('grade_app_templates', JSON.stringify(newTemplates));
    setPresetName('');
  };

  const handleLoadPreset = (presetObject) => {
    setCols(presetObject.cols);
  };

  const handleDeleteTemplate = (index) => {
    const newTemplates = [...savedTemplates];
    newTemplates.splice(index, 1);
    setSavedTemplates(newTemplates);
    localStorage.setItem('grade_app_templates', JSON.stringify(newTemplates));
  };

  const handleSave = () => {
    if (weightError) return;
    setTemplate(cols);
    onNext();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* MODE SELECTION */}
      <Card className="glass-panel premium-card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Grading Architecture</h3>
          <p style={{ fontSize: '0.875rem' }}>Define whether this assessment is entirely individual or features collaborative team metrics.</p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <ModeSelector 
            active={gradingMode === 'standard'} 
            onClick={() => setGradingMode('standard')}
            title="Standard Assessment"
            desc="Flat individual performance tracking across all components."
            icon={Layers}
          />
          <ModeSelector 
            active={gradingMode === 'integrated'} 
            onClick={() => setGradingMode('integrated')}
            title="Integrated Evaluation"
            desc="Hybrid mode with team-based components and peer normalization."
            icon={Weight}
          />
        </div>

        {gradingMode === 'integrated' && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'var(--bg-glass)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '1.5rem' 
          }}>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Max Project Team Density [N]</strong>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Determines student slot availability (student1...studentN) in the mapping parser.</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => setMaxTeamSize(Math.max(1, maxTeamSize - 1))}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', 
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
              >
                −
              </button>
              
              <div style={{ 
                width: '56px', height: '48px', 
                background: 'rgba(2, 6, 23, 0.6)', 
                border: '1px solid var(--accent-primary)', 
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)'
              }}>
                {maxTeamSize}
              </div>

              <button 
                onClick={() => setMaxTeamSize(maxTeamSize + 1)}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', 
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
              >
                +
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* COMPONENT DEFINITION */}
      <Card className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Evaluation Components</h3>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Assign weighted attribution for each column in your dataset.</p>
          </div>
          <Button variant="secondary" onClick={handleAddColumn} icon={Plus}>Add Component</Button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cols.map((col) => (
            <div key={col.id} className="premium-card" style={{ 
              display: 'flex', gap: '1.5rem', alignItems: 'flex-end', 
              padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' 
            }}>
              <div style={{ flex: 2.5 }}>
                <Input
                  label="Component Label"
                  placeholder="e.g., Final Examination"
                  value={col.name}
                  onChange={(e) => handleUpdateColumn(col.id, 'name', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Max Score"
                  type="number"
                  value={col.maxMarks === '' ? '' : col.maxMarks}
                  onChange={(e) => handleUpdateColumn(col.id, 'maxMarks', e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Weight (%)"
                  type="number"
                  value={col.weight === '' ? '' : col.weight}
                  onChange={(e) => handleUpdateColumn(col.id, 'weight', e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              {gradingMode === 'integrated' && (
                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase' }}>Attribution</label>
                  <select 
                    value={col.type} 
                    onChange={(e) => handleUpdateColumn(col.id, 'type', e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', 
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team-Based</option>
                  </select>
                </div>
              )}
              <div style={{ marginBottom: '2px' }}>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => handleRemoveColumn(col.id)} 
                  icon={Trash}
                  style={{ color: 'var(--status-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                   Delete
                </Button>
              </div>
            </div>
          ))}
          {cols.length === 0 && (
             <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
               <layers size={48} style={{ marginBottom: '1rem' }} />
               <p>No evaluation components defined.</p>
             </div>
          )}
        </div>
      </Card>

      {/* ACTIONS & PRESETS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          {weightError && (
            <div className="animate-fade-in" style={{ 
              background: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid var(--status-warning)', 
              padding: '1.5rem', 
              borderRadius: '16px',
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <AlertTriangle color="var(--status-warning)" size={32} />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: 'var(--status-warning)', marginBottom: '0.25rem' }}>
                  Critical Rule: Weight Sum Deviation ({totalWeight}%)
                </strong>
                <p style={{ margin: 0, fontSize: '0.8125rem' }}>Grade normalization requires a total weight of 100%. Adjust manually or use auto-balance.</p>
              </div>
              <Button variant="secondary" onClick={handleNormalize} style={{ background: 'rgba(255,255,255,0.05)' }}>
                Normalize
              </Button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'var(--bg-glass)', padding: '0.5rem', 
            borderRadius: '14px', border: '1px solid var(--border-light)' 
          }}>
            <input 
              type="text"
              placeholder="Preset Name..." 
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem', outline: 'none', width: '200px' }}
            />
            <Button variant="secondary" onClick={handleSavePreset} disabled={!presetName.trim() || weightError || cols.length === 0} icon={Save}>
              Save Preset
            </Button>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleSave} 
            disabled={weightError || cols.length === 0}
            icon={ArrowRight}
            style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '16px' }}
          >
            Finalize Architecture
          </Button>
        </div>
      </div>
      
      {savedTemplates.length > 0 && (
        <Card className="glass-panel premium-card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
             <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Saved Architectures</h4>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {savedTemplates.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', transition: 'all 0.2s' }}>
                <button 
                  onClick={() => handleLoadPreset(t)} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
                    background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <FileSpreadsheet size={16} color="var(--accent-primary)" />
                  {t.name}
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(idx)} 
                  style={{ 
                    padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.05)', border: 'none', 
                    color: 'var(--status-error)', cursor: 'pointer', borderLeft: '1px solid var(--border-light)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ModeSelector({ active, onClick, title, desc, icon: Icon }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        flex: 1, cursor: 'pointer', padding: '2rem', borderRadius: '18px', 
        border: '1px solid', borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)', 
        background: active ? 'rgba(6,182,212,0.05)' : 'transparent', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', gap: '1.5rem', alignItems: 'center',
        boxShadow: active ? '0 10px 30px rgba(6, 182, 212, 0.1)' : 'none',
        transform: active ? 'translateY(-4px)' : 'none'
      }}
    >
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '16px', 
        background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#fff' : 'var(--text-muted)'
      }}>
        <Icon size={28} />
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', fontSize: '1.1rem', color: active ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>{title}</strong>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}
