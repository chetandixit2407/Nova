import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  Search,
  Star,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  Bot,
  Code2,
  Compass,
  Cpu,
  Laptop
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { systemService } from '../../services/systemService';
import { AITool } from '../../types';

export const NotchAIHubTab: React.FC = () => {
  const { aiTools, addCustomAITool, removeAITool, toggleFavoriteAI, copyText } = useNotch();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Form for custom AI
  const [customName, setCustomName] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customCat, setCustomCat] = useState<AITool['category']>('Chat & Reasoning');

  const categories = ['All', 'Favorites', 'Chat & Reasoning', 'Code & Dev', 'Search & Research'];

  const quickPrompts = [
    {
      id: 'p1',
      title: 'Code Review & Refactor',
      text: 'Analyze the following TypeScript code for performance bottlenecks, edge-case handling, and architectural elegance: '
    },
    {
      id: 'p2',
      title: 'System Architecture Design',
      text: 'Design a resilient high-throughput microservices architecture with zero-downtime deployment for: '
    },
    {
      id: 'p3',
      title: 'Executive Summary',
      text: 'Summarize the core insights, risks, and strategic action points of the following document into 5 punchy bullet points: '
    }
  ];

  const handleCopyPrompt = async (id: string, text: string) => {
    await copyText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleOpenAI = (url: string) => {
    systemService.openExternalUrl(url);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    let formattedUrl = customUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addCustomAITool({
      name: customName.trim(),
      url: formattedUrl,
      description: customDesc.trim() || 'Custom AI tool shortcut',
      category: customCat,
      iconName: 'Bot',
      isFavorite: true,
      color: 'from-violet-500 to-indigo-600'
    });

    setCustomName('');
    setCustomUrl('');
    setCustomDesc('');
    setShowAddModal(false);
  };

  const filteredTools = aiTools.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'All') return matchesQuery;
    if (selectedCategory === 'Favorites') return matchesQuery && t.isFavorite;
    return matchesQuery && t.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI models, tools, or providers..."
            className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="Add Custom AI Tool"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Hub Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredTools.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No AI tools match your search criteria.
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="group bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-sky-500/30 rounded-xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-sm shrink-0`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{tool.name}</h4>
                      <span className="text-[10px] text-slate-400">{tool.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavoriteAI(tool.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        tool.isFavorite
                          ? 'text-amber-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Favorite"
                    >
                      <Star className={`w-3.5 h-3.5 ${tool.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    {tool.isCustom && (
                      <button
                        onClick={() => removeAITool(tool.id)}
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete custom tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-3">
                  {tool.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleOpenAI(tool.url)}
                  className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-sky-500 hover:text-slate-950 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Launch Official</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Prompt Launcher Strip */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-sky-400" />
            Quick Prompt Templates (Click to Copy)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Instant Clipboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {quickPrompts.map((p) => {
            const isCopied = copiedPromptId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleCopyPrompt(p.id, p.text)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span>{p.title}</span>
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 truncate">{p.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom AI Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Add Custom AI Tool</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tool Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Midjourney Web"
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Short summary of capabilities..."
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value as AITool['category'])}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-white/15 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="Chat & Reasoning">Chat & Reasoning</option>
                  <option value="Code & Dev">Code & Dev</option>
                  <option value="Search & Research">Search & Research</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || !customUrl.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 rounded-lg cursor-pointer"
                >
                  Save AI Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
