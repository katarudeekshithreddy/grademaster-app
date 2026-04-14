import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { MainWorkspace } from './components/Layout/MainWorkspace';
import { Authentication } from './modules/Authentication';
import { TemplateManager } from './modules/TemplateManager';
import { ExcelPipeline } from './modules/ExcelPipeline';
import { ErrorCorrection } from './modules/ErrorCorrection';
import { PreviewDashboard } from './modules/PreviewDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('template');

  // Listen for navigation events from children
  React.useEffect(() => {
    const handleNav = (e) => setCurrentStep(e.detail);
    window.addEventListener('nav-step', handleNav);
    return () => window.removeEventListener('nav-step', handleNav);
  }, []);
  
  // App Global State for Pipeline
  const [template, setTemplate] = useState(() => {
    const saved = localStorage.getItem('grade_app_template');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Team Mode State
  const [gradingMode, setGradingMode] = useState('standard'); // 'standard' or 'integrated'
  const [maxTeamSize, setMaxTeamSize] = useState(3);
  const [dataset, setDataset] = useState(null);
  const [teamMapping, setTeamMapping] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [teamMarks, setTeamMarks] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Save templates
  React.useEffect(() => {
    localStorage.setItem('grade_app_template', JSON.stringify(template));
  }, [template]);

  if (!user) {
    return <Authentication onLogin={(userData) => setUser(userData)} />;
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'template': return 'Template Configuration';
      case 'upload': return 'Upload Excel Data';
      case 'validate': return 'Data Validation & Correction';
      case 'preview': return 'Preview & Export Dashboard';
      default: return 'Workspace';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep} 
        hasData={!!dataset}
      />
      <MainWorkspace title={getStepTitle()}>
         {currentStep === 'template' && (
            <TemplateManager 
              template={template} 
              setTemplate={setTemplate} 
              gradingMode={gradingMode}
              setGradingMode={setGradingMode}
              maxTeamSize={maxTeamSize}
              setMaxTeamSize={setMaxTeamSize}
              onNext={() => setCurrentStep('upload')} 
            />
         )}
         {currentStep === 'upload' && (
            <ExcelPipeline 
              template={template}
              gradingMode={gradingMode}
              maxTeamSize={maxTeamSize}
              setDataset={setDataset}
              setTeamMapping={setTeamMapping}
              setTeamDetails={setTeamDetails}
              setTeamMarks={setTeamMarks}
              setValidationErrors={setValidationErrors}
              onNext={(route) => setCurrentStep(route || 'validate')}
            />
         )}
        {currentStep === 'validate' && (
           <ErrorCorrection 
             errors={validationErrors}
             onBack={() => {
                setDataset(null);
                setTeamMapping(null);
                setTeamDetails(null);
                setTeamMarks(null);
                setValidationErrors([]);
                setCurrentStep('upload');
             }}
             onNext={() => setCurrentStep('preview')}
           />
        )}
         {currentStep === 'preview' && (
            <PreviewDashboard 
              dataset={dataset}
              template={template}
              gradingMode={gradingMode}
              teamMapping={teamMapping}
              teamDetails={teamDetails}
              teamMarks={teamMarks}
              onReset={() => {
                setDataset(null);
                setTeamMapping(null);
                setTeamDetails(null);
                setTeamMarks(null);
                setCurrentStep('template');
              }}
            />
         )}
      </MainWorkspace>
    </div>
  );
}

export default App;
