import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Save,
  User,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { OllamaConfig, UserAutofillProfile } from '../../extension/types';
import {
  getStoredOllamaConfig,
  saveStoredOllamaConfig,
  bridgeTestOllama,
} from '../../extension/bridge';

interface OllamaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: OllamaConfig) => void;
  autofillProfile: UserAutofillProfile;
  onSaveAutofillProfile: (profile: UserAutofillProfile) => void;
}

const STORAGE_PROFILE_KEY = 'onestep_user_profile';

export const OllamaSettingsModal: React.FC<OllamaSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  autofillProfile,
  onSaveAutofillProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'ollama' | 'autofill'>('ollama');

  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [modelTag, setModelTag] = useState('qwen2.5:7b');
  const [timeoutSec, setTimeoutSec] = useState(30);

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    models: string[];
    error?: string;
  } | null>(null);

  // Profile form state
  const [profile, setProfile] = useState<UserAutofillProfile>(autofillProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getStoredOllamaConfig().then((cfg) => {
        setBaseUrl(cfg.baseUrl);
        setModelTag(cfg.modelTag);
        setTimeoutSec(Math.round(cfg.timeoutMs / 1000));
      });
      setProfile(autofillProfile);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen, autofillProfile]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await bridgeTestOllama(baseUrl);
      setTestResult(res);
      if (res.ok && res.models.length > 0 && !res.models.includes(modelTag)) {
        // Find if a qwen model exists
        const qwenMatch = res.models.find((m) => m.toLowerCase().includes('qwen'));
        if (qwenMatch) {
          setModelTag(qwenMatch);
        }
      }
    } catch (err: any) {
      setTestResult({ ok: false, models: [], error: err.message || String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const updated: OllamaConfig = {
      baseUrl: baseUrl.trim().replace(/\/+$/, ''),
      modelTag: modelTag.trim(),
      timeoutMs: Math.max(5000, timeoutSec * 1000),
      temperature: 0.1,
    };
    await saveStoredOllamaConfig(updated);
    onSaveAutofillProfile(profile);

    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 select-text">
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E5DEC9] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7656A7] text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2825]">
                OneStep Configuration & Settings
              </h3>
              <p className="text-[11px] text-[#6E6860]">
                Ollama LAN connection, Qwen 2.5 model, and personal autofill data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-[#E5DEC9] bg-[#F7F3EC]/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('ollama')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ollama'
                ? 'border-[#7656A7] text-[#7656A7] bg-[#FFFDF9]'
                : 'border-transparent text-[#6E6860] hover:text-[#2B2825]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ollama & Qwen 2.5 Setup</span>
          </button>
          <button
            onClick={() => setActiveTab('autofill')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'autofill'
                ? 'border-[#7656A7] text-[#7656A7] bg-[#FFFDF9]'
                : 'border-transparent text-[#6E6860] hover:text-[#2B2825]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Autofill Profile Data</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'ollama' && (
            <div className="space-y-4">
              {/* Ollama Host URL */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2B2825] flex items-center justify-between">
                  <span>Ollama Base URL (Same Wi-Fi Network)</span>
                  <span className="text-[10px] text-[#7656A7] font-normal">e.g. http://192.168.1.50:11434</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://192.168.1.X:11434 or http://localhost:11434"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs font-mono text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !baseUrl.trim()}
                    className="px-3 py-2 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DEC9] text-[#2B2825] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    testResult.ok
                      ? 'bg-[#4A7C59]/10 border-[#4A7C59]/30 text-[#4A7C59]'
                      : 'bg-[#C86D51]/10 border-[#C86D51]/30 text-[#C86D51]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">
                        {testResult.ok
                          ? 'Successfully connected to Ollama!'
                          : 'Could not connect to Ollama'}
                      </p>
                      {testResult.ok ? (
                        <p className="text-[11px] mt-0.5">
                          Found {testResult.models.length} model(s):{' '}
                          <span className="font-mono">{testResult.models.join(', ') || 'No models pulled yet'}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] mt-0.5">{testResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Model Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">
                    Model Tag (from 'ollama list')
                  </label>
                  <input
                    type="text"
                    value={modelTag}
                    onChange={(e) => setModelTag(e.target.value)}
                    placeholder="qwen2.5:7b or qwen2.5:latest"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs font-mono text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">
                    Request Timeout (Seconds)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(parseInt(e.target.value, 10) || 30)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs font-mono text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 bg-[#F7F3EC] border border-[#E5DEC9] rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#2B2825]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#7656A7]" />
                  <span>How to allow remote connections on your Ollama laptop:</span>
                </div>
                <div className="text-[11px] text-[#6E6860] space-y-1 pl-5 list-disc font-sans">
                  <p>
                    1. On the AI laptop, find your Wi-Fi IP address (e.g. <code className="bg-[#EFE9DF] px-1 py-0.5 rounded font-mono">ipconfig</code> on Windows or <code className="bg-[#EFE9DF] px-1 py-0.5 rounded font-mono">ifconfig</code> on macOS/Linux).
                  </p>
                  <p>
                    2. Start Ollama listening on all interfaces:
                    <br />
                    <code className="bg-[#EFE9DF] text-[#2B2825] px-1.5 py-0.5 rounded font-mono block mt-1">
                      OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS="*" ollama serve
                    </code>
                  </p>
                  <p>
                    3. Pull Qwen 2.5: <code className="bg-[#EFE9DF] px-1 py-0.5 rounded font-mono">ollama pull qwen2.5:7b</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'autofill' && (
            <div className="space-y-3">
              <p className="text-[#6E6860]">
                Enter optional personal details here. When you ask OneStep to fill a form on any webpage, it will propose these mappings for your review before inserting them.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">Full Legal Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">Phone / Mobile</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">Student / Roll ID</label>
                  <input
                    type="text"
                    value={profile.studentId}
                    onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                    placeholder="2024-CS-0428"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2B2825] block">City & Postal Code</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Bangalore, 560001"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#2B2825] block">Residential Address</label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street address, Apartment / Hostel Block"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5DEC9] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#4A7C59]">
            {saveSuccess && (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Settings Saved!</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-[#E5DEC9] hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#7656A7] hover:bg-[#654791] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
