import React, { useState, useRef } from 'react';
import { Upload, Zap, CheckCircle, AlertTriangle, XCircle, RefreshCw, Rocket, FileCode, FolderOpen } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tests, setTests] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('project', file);

    try {
      const response = await fetch(`${API_URL}/projects/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProject(data);
      setActiveTab('analysis');
      setUploading(false);
    } catch (err) {
      setError('Failed to upload project');
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/projects/${project.projectId}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysis(data);
      setActiveTab('analysis');
      setLoading(false);
    } catch (err) {
      setError('Failed to analyze project');
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/projects/${project.projectId}/test`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Tests failed');

      const data = await response.json();
      setTests(data);
      setActiveTab('tests');
      setLoading(false);
    } catch (err) {
      setError('Failed to run tests');
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/projects/${project.projectId}/deploy`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Deployment failed');

      const data = await response.json();
      setDeployment(data);
      setActiveTab('deploy');
      setLoading(false);
    } catch (err) {
      setError('Failed to deploy project');
      setLoading(false);
    }
  };

  const handleDemoProject = () => {
    setProject({
      projectId: 'demo-12345',
      name: 'demo-project.zip',
      size: 24576,
      isDemo: true
    });
    setAnalysis({
      critical: [
        {
          title: 'Missing MONGODB_URI environment variable',
          file: '.env.example',
          category: 'Environment',
          description: 'No database URI configuration found',
          solution: 'Add MONGODB_URI to your environment variables',
          severity: 'Critical'
        },
        {
          title: 'Backend start script is missing',
          file: 'package.json',
          category: 'Configuration',
          description: 'No "start" script found in package.json',
          solution: 'Add "start": "node server.js" to scripts',
          severity: 'Critical'
        }
      ],
      warnings: [
        {
          title: '.env.example is incomplete',
          file: '.env.example',
          category: 'Environment',
          description: 'PORT environment variable not defined',
          solution: 'Add PORT=5000 to your environment variables',
          severity: 'Warning'
        },
        {
          title: 'Error handling middleware not detected',
          file: 'backend',
          category: 'Code Quality',
          description: 'No error handling middleware found',
          solution: 'Add error handling middleware to catch and process errors gracefully',
          severity: 'Warning'
        }
      ],
      passed: [
        'package.json detected',
        'Frontend structure detected',
        'Backend structure detected',
        'Build configuration detected'
      ],
      score: 78
    });
    setActiveTab('analysis');
  };

  const handleRetest = () => {
    setAnalysis({
      ...analysis,
      score: 92,
      critical: [],
      warnings: [
        {
          title: 'Error handling middleware not detected',
          file: 'backend',
          category: 'Code Quality',
          description: 'No error handling middleware found',
          solution: 'Add error handling middleware to catch and process errors gracefully',
          severity: 'Warning'
        }
      ],
      passed: [
        'package.json detected',
        'Frontend structure detected',
        'Backend structure detected',
        'Build configuration detected',
        'MONGODB_URI environment variable added',
        'Backend start script added'
      ]
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-400';
    if (score >= 60) return 'bg-yellow-100 border-yellow-400';
    return 'bg-red-100 border-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">Fix2Live</h1>
                <p className="text-xs text-gray-500">From Broken Code to a Live Website</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDemoProject}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Try Demo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Section */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Upload className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Upload Your Project</h2>
                <p className="text-gray-500 mt-2">Drag and drop your project ZIP file or click to browse</p>
              </div>

              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-blue-50/50"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const event = { target: { files: [file] } };
                    handleFileUpload(event);
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".zip"
                  className="hidden"
                />
                <FileCode className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600">Drop your ZIP file here or click to browse</p>
                <p className="text-sm text-gray-400 mt-2">Supports .zip files up to 50MB</p>
              </div>

              {uploading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 mt-2">Uploading project...</p>
                </div>
              )}

              {project && !uploading && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Project uploaded successfully!</p>
                      <p className="text-sm text-green-600">{project.name} ({(project.size / 1024).toFixed(1)} KB)</p>
                    </div>
                    <button
                      onClick={handleAnalyze}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Analyze Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Dashboard */}
        {activeTab === 'analysis' && analysis && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Readiness Score */}
              <div className="lg:col-span-1">
                <div className={`p-6 rounded-xl border-2 ${getScoreBg(analysis.score)} shadow-lg bg-white`}>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Readiness Score</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analysis.score >= 80 ? 'bg-green-500' :
                        analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                  {analysis.score >= 80 && <p className="text-sm text-green-600 mt-2">✓ Ready for deployment</p>}
                  {analysis.score >= 60 && analysis.score < 80 && <p className="text-sm text-yellow-600 mt-2">⚠️ Needs improvement</p>}
                  {analysis.score < 60 && <p className="text-sm text-red-600 mt-2">✗ Critical issues found</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Critical Errors</p>
                      <p className="text-2xl font-bold text-red-600">{analysis.critical?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">{analysis.warnings?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Passed Checks</p>
                      <p className="text-2xl font-bold text-green-600">{analysis.passed?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="space-y-6">
              {analysis.critical && analysis.critical.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Critical Errors</h3>
                  <div className="space-y-3">
                    {analysis.critical.map((error, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{error.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">File: {error.file}</p>
                            <p className="text-sm text-gray-600">Category: {error.category}</p>
                            <p className="text-sm text-gray-700 mt-2">{error.description}</p>
                            <p className="text-sm text-blue-600 mt-1">💡 {error.solution}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            {error.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.warnings && analysis.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 mb-3">Warnings</h3>
                  <div className="space-y-3">
                    {analysis.warnings.map((warning, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{warning.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">File: {warning.file}</p>
                            <p className="text-sm text-gray-600">Category: {warning.category}</p>
                            <p className="text-sm text-gray-700 mt-2">{warning.description}</p>
                            <p className="text-sm text-blue-600 mt-1">💡 {warning.solution}</p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                            {warning.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.passed && analysis.passed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Passed Checks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.passed.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleRunTests}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Run Tests</span>
                    </>
                  )}
                </button>
                {project?.isDemo && (
                  <button
                    onClick={handleRetest}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-test</span>
                  </button>
                )}
                <button
                  onClick={handleDeploy}
                  disabled={loading || analysis.score < 60}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Deploy Project</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tests Section */}
        {activeTab === 'tests' && tests && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Test Results</h2>
              <div className="space-y-3">
                {tests.passed?.map((test, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">✓ {test}</span>
                  </div>
                ))}
                {tests.failed?.map((test, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">✗ {test}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Passed: {tests.passedCount} / {tests.total}</p>
                  <p className="text-sm text-gray-600">Failed: {tests.failedCount} / {tests.total}</p>
                </div>
                <button
                  onClick={handleDeploy}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Deploy Project</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Section */}
        {activeTab === 'deploy' && deployment && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-600">{deployment.message}</h2>
                <p className="text-gray-600 mt-2">Your project has been deployed successfully!</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <p className="text-sm text-gray-600 mb-2">Demo URL:</p>
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-mono text-lg hover:underline break-all"
                >
                  {deployment.url}
                </a>
                <p className="text-xs text-gray-400 mt-1">⚠️ This is a demo URL for prototype purposes</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Deployment Checks</h3>
                <div className="space-y-2">
                  {deployment.checks?.map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{check.name}</span>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        check.status === 'PASS' ? 'bg-green-100 text-green-700' :
                        check.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Deploy Another Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;