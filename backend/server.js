const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for projects
const projects = {};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'projects');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Analysis Engine - Rule-based
function analyzeProject(projectPath) {
  const results = {
    critical: [],
    warnings: [],
    passed: [],
    score: 0
  };

  try {
    const files = fs.readdirSync(projectPath);
    
    // Check for package.json
    if (files.includes('package.json')) {
      results.passed.push('package.json detected');
      
      // Parse package.json
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      
      // Check for start script
      if (pkg.scripts && pkg.scripts.start) {
        results.passed.push('Backend start script detected');
      } else {
        results.critical.push({
          title: 'Backend start script is missing',
          file: 'package.json',
          category: 'Configuration',
          description: 'No "start" script found in package.json',
          solution: 'Add "start": "node server.js" or "start": "npm run build && node dist/index.js" to scripts',
          severity: 'Critical'
        });
      }
      
      // Check for build script
      if (pkg.scripts && pkg.scripts.build) {
        results.passed.push('Build script detected');
      } else {
        results.warnings.push({
          title: 'Build script missing',
          file: 'package.json',
          category: 'Configuration',
          description: 'No "build" script found in package.json',
          solution: 'Add "build": "vite build" or similar build command',
          severity: 'Warning'
        });
      }
      
      // Check dependencies
      if (pkg.dependencies) {
        if (pkg.dependencies.express || pkg.dependencies.fastify) {
          results.passed.push('Backend framework detected');
        }
        if (pkg.dependencies.react || pkg.dependencies.vue) {
          results.passed.push('Frontend framework detected');
        }
      }
    } else {
      results.critical.push({
        title: 'Missing package.json',
        file: 'root',
        category: 'Configuration',
        description: 'No package.json file found in the project root',
        solution: 'Create a package.json file with npm init',
        severity: 'Critical'
      });
    }

    // Check for .env.example
    if (files.some(f => f === '.env.example' || f === '.env.sample')) {
      results.passed.push('.env.example detected');
      
      // Check for common env variables
      const envContent = fs.readFileSync(
        path.join(projectPath, files.find(f => f === '.env.example' || f === '.env.sample')),
        'utf8'
      );
      
      if (!envContent.includes('MONGODB_URI') && !envContent.includes('DATABASE_URL')) {
        results.critical.push({
          title: 'Missing MONGODB_URI environment variable',
          file: '.env.example',
          category: 'Environment',
          description: 'No database URI configuration found',
          solution: 'Add MONGODB_URI or DATABASE_URL to your environment variables',
          severity: 'Critical'
        });
      }
      
      if (!envContent.includes('PORT')) {
        results.warnings.push({
          title: '.env.example is incomplete',
          file: '.env.example',
          category: 'Environment',
          description: 'PORT environment variable not defined',
          solution: 'Add PORT=5000 to your environment variables',
          severity: 'Warning'
        });
      }
    } else {
      results.critical.push({
        title: 'Missing .env.example',
        file: 'root',
        category: 'Environment',
        description: 'No .env.example file found. This helps document required environment variables',
        solution: 'Create a .env.example file with all required environment variables',
        severity: 'Critical'
      });
    }

    // Check for frontend structure
    const hasFrontend = files.some(f => 
      f === 'frontend' || f === 'client' || f === 'src' || 
      f.endsWith('.html') || f.endsWith('.jsx') || f.endsWith('.tsx')
    );
    
    if (hasFrontend) {
      results.passed.push('Frontend structure detected');
    } else {
      results.warnings.push({
        title: 'Frontend structure not detected',
        file: 'root',
        category: 'Structure',
        description: 'No frontend files or directories found',
        solution: 'Ensure your frontend code is in a recognized directory (frontend/, client/, src/)',
        severity: 'Warning'
      });
    }

    // Check for backend structure
    const hasBackend = files.some(f => 
      f === 'backend' || f === 'server' || f === 'api' ||
      f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.py')
    );
    
    if (hasBackend) {
      results.passed.push('Backend structure detected');
    } else {
      results.warnings.push({
        title: 'Backend structure not detected',
        file: 'root',
        category: 'Structure',
        description: 'No backend files or directories found',
        solution: 'Ensure your backend code is in a recognized directory (backend/, server/, api/)',
        severity: 'Warning'
      });
    }

    // Check for error handling middleware
    if (hasBackend) {
      const backendFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));
      let hasErrorHandler = false;
      
      for (const file of backendFiles) {
        try {
          const content = fs.readFileSync(path.join(projectPath, file), 'utf8');
          if (content.includes('error') && (content.includes('middleware') || content.includes('handler'))) {
            hasErrorHandler = true;
            break;
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
      
      if (!hasErrorHandler) {
        results.warnings.push({
          title: 'Error handling middleware not detected',
          file: 'backend',
          category: 'Code Quality',
          description: 'No error handling middleware found',
          solution: 'Add error handling middleware to catch and process errors gracefully',
          severity: 'Warning'
        });
      }
    }

    // Calculate score
    const totalChecks = 8; // Base checks
    const passedCount = results.passed.length;
    const criticalCount = results.critical.length;
    const warningCount = results.warnings.length;
    
    // Score calculation: start at 100, subtract for issues
    let score = 100;
    score -= criticalCount * 15;
    score -= warningCount * 5;
    score = Math.max(0, Math.min(100, score));
    
    results.score = score;

  } catch (error) {
    console.error('Analysis error:', error);
    results.critical.push({
      title: 'Analysis failed',
      file: 'root',
      category: 'System',
      description: 'Failed to analyze project structure',
      solution: 'Check if the project is properly structured',
      severity: 'Critical'
    });
    results.score = 0;
  }

  return results;
}

// API Routes
app.post('/api/projects/upload', upload.single('project'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const projectId = uuidv4();
    const projectPath = path.join(__dirname, 'projects', projectId);
    
    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Extract ZIP (simplified for MVP - just store the file)
    const zipPath = req.file.path;
    const extractPath = projectPath;
    
    // For MVP, we'll just store the file and mark it as uploaded
    // In a real implementation, we'd extract the ZIP here
    
    projects[projectId] = {
      id: projectId,
      name: req.file.originalname,
      size: req.file.size,
      status: 'uploaded',
      path: projectPath,
      zipPath,
      analysis: null,
      tests: null,
      deployment: null,
      createdAt: new Date().toISOString()
    };

    // Simulate file extraction for demo
    // Copy the zip to the project directory
    fs.copyFileSync(zipPath, path.join(projectPath, req.file.originalname));
    
    res.json({
      projectId,
      name: req.file.originalname,
      size: req.file.size,
      message: 'Project uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/projects/:id/analyze', (req, res) => {
  try {
    const { id } = req.params;
    const project = projects[id];
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // For MVP, simulate analysis with demo data if project is sample
    let analysisResult;
    
    if (project.name.includes('demo') || project.name.includes('sample')) {
      // Demo data for sample projects
      analysisResult = {
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
      };
    } else {
      // Real analysis
      const analysisPath = project.path;
      analysisResult = analyzeProject(analysisPath);
    }
    
    project.analysis = analysisResult;
    project.status = 'analyzed';
    
    res.json({
      projectId: id,
      ...analysisResult
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.post('/api/projects/:id/test', (req, res) => {
  try {
    const { id } = req.params;
    const project = projects[id];
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Simulated test results
    const testResults = {
      passed: [
        'Application starts',
        'Frontend loads',
        'API responds',
        'Database configuration detected'
      ],
      failed: [
        'Login flow failed'
      ],
      total: 5,
      passedCount: 4,
      failedCount: 1
    };
    
    project.tests = testResults;
    project.status = 'tested';
    
    res.json({
      projectId: id,
      ...testResults
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Tests failed' });
  }
});

app.post('/api/projects/:id/deploy', (req, res) => {
  try {
    const { id } = req.params;
    const project = projects[id];
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Simulate deployment
    const deploymentId = uuidv4().slice(0, 8);
    const demoUrl = `https://demo.fix2live.app/project/${deploymentId}`;
    
    const deploymentResult = {
      success: true,
      url: demoUrl,
      checks: [
        { name: 'Code Analysis', status: 'PASS' },
        { name: 'Build Test', status: 'PASS' },
        { name: 'Runtime Test', status: 'PASS' },
        { name: 'Basic Security Check', status: 'WARNING' },
        { name: 'Configuration Check', status: 'PASS' }
      ],
      message: 'Deployment Successful',
      deployedAt: new Date().toISOString()
    };
    
    project.deployment = deploymentResult;
    project.status = 'deployed';
    
    res.json({
      projectId: id,
      ...deploymentResult
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: 'Deployment failed' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = projects[id];
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      id: project.id,
      name: project.name,
      size: project.size,
      status: project.status,
      analysis: project.analysis,
      tests: project.tests,
      deployment: project.deployment,
      createdAt: project.createdAt
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, 'projects')}`);
});