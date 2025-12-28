
import React, { useState, useEffect } from 'react';
import { ProjectData, GeneratedDocuments, ProjectHistoryItem } from './types';
import { generateDocsContent } from './services/geminiService';
import { generateDocFile } from './services/docGenerator';
import { 
  FileText, 
  ArrowRight, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  GraduationCap,
  BookOpen,
  History,
  Trash2,
  ExternalLink
} from 'lucide-react';

const STORAGE_KEY = 'iub_doc_history';

const App: React.FC = () => {
  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    studentName: '',
    rollNo: '',
    session: 'Spring 2024 - 2028',
    supervisorName: '',
    supervisorDesignation: 'Assistant Professor'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [generatedContent, setGeneratedContent] = useState<GeneratedDocuments | null>(null);
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (data: ProjectData, content: GeneratedDocuments) => {
    const newItem: ProjectHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data,
      content
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (item: ProjectHistoryItem) => {
    setFormData(item.data);
    setGeneratedContent(item.content);
    setStatus({ type: 'success', message: `Loaded project: ${item.data.title}` });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.studentName) {
      setStatus({ type: 'error', message: 'Please fill in all mandatory fields.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'idle', message: 'Synthesizing university-grade documentation...' });

    try {
      const content = await generateDocsContent(formData);
      setGeneratedContent(content);
      saveToHistory(formData, content);
      setStatus({ type: 'success', message: 'Documents generated successfully! Included Architecture Graphs and Table of Contents.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to generate documents. Please check your network or API settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSrs = async () => {
    if (!generatedContent) return;
    await generateDocFile(formData, generatedContent.srs, 'SRS');
  };

  const downloadSdd = async () => {
    if (!generatedContent) return;
    await generateDocFile(formData, generatedContent.sdd, 'SDD');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Cpu className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">IUB Document Architect</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Automated generation of SRS and SDD files for IUB students.
          Includes university branding, history tracking, and design graphs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: History */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <History className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Project History</h2>
            </div>
            <div className="p-2 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="p-4 text-sm text-slate-400 italic text-center">No history yet</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="group relative p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-100 mb-1"
                  >
                    <p className="text-xs font-semibold text-slate-900 truncate pr-6">{item.data.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                    <button
                      onClick={(e) => deleteFromHistory(item.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle: Main Form */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">New Documentation</h2>
              </div>
            </div>
            
            <form onSubmit={handleGenerate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Smart Attendance via Face Recognition"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.studentName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Roll No *</label>
                  <input
                    type="text"
                    name="rollNo"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Supervisor Name *</label>
                  <input
                    type="text"
                    name="supervisorName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.supervisorName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Supervisor Title</label>
                  <input
                    type="text"
                    name="supervisorDesignation"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.supervisorDesignation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Docs...
                  </>
                ) : (
                  <>
                    Generate Full Docs
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Actions & Info */}
        <div className="lg:col-span-3 order-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Standard Features
            </h3>
            <ul className="space-y-3">
              {[
                'Official IUB Logo Header',
                'Auto-Generated TOC',
                'System Architecture Graphs',
                'Local Project History',
                'Revision Tracking'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {status.type !== 'idle' && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
              status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-xs font-medium leading-relaxed">{status.message}</span>
            </div>
          )}

          {generatedContent && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                onClick={downloadSrs}
                className="w-full p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Download SRS</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={downloadSdd}
                className="w-full p-4 bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Download SDD</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-slate-100 text-center text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} Islamia University of Bahawalpur - Department of Artificial Intelligence</p>
        <p className="mt-2">Automated Documentation System v2.0 - SRS & SDD Builder</p>
      </footer>
    </div>
  );
};

export default App;
