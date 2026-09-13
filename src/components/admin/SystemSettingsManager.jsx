import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Camera, 
  Download, 
  Shield, 
  Volume2, 
  VolumeX, 
  Clock, 
  Maximize2, 
  Sliders, 
  Save, 
  RefreshCw, 
  FileText, 
  HardDrive, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  Sparkles,
  Zap,
  Image,
  Layers,
  Cloud,
  Database,
  UploadCloud,
  Radio,
  ExternalLink,
  ArrowUpRight,
  Cpu,
  Globe
} from "lucide-react";
import { 
  checkStorageStatus, 
  uploadAsset, 
  listStoredAssets,
  migrateLocalSeeds,
  triggerStorageMaintenance
} from "../../utils/blobClient";

const SystemSettingsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("camera"); // "camera", "export", "security", "storage"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);

  // Storage Engine State
  const [storageStatus, setStorageStatus] = useState(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [probeLoading, setProbeLoading] = useState(false);
  const [storedBlobs, setStoredBlobs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [maintLoading, setMaintLoading] = useState(false);
  const [maintResult, setMaintResult] = useState(null);

  // Settings state
  const [cameraSettings, setCameraSettings] = useState({
    defaultCountdown: 5,
    shutterSoundEnabled: true,
    audioVolume: 80,
    autoBurstInterval: 3,
    mirrorPreview: true,
    flashEffect: true
  });

  const [exportSettings, setExportSettings] = useState({
    defaultDpi: "300",
    defaultFormat: "PNG",
    jpegQuality: 92,
    framePaddingPx: 20,
    photoGapPx: 12,
    borderCornerRadiusPx: 12,
    watermarkEnabled: true,
    watermarkText: "SNPSHOT STUDIO // HIGH-RES DIGITAL PRINT",
    includeDateStamp: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    passkey: "snpshot2026",
    sessionTimeoutMinutes: 60,
    requirePasskeyForExport: false,
    maintenanceMode: false
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.camera) setCameraSettings(data.camera);
        if (data.export) setExportSettings(data.export);
        if (data.security) setSecuritySettings(data.security);
      }
    } catch (err) {
      console.error("Failed to fetch system settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const res = await fetch("/api/creator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camera: cameraSettings,
          export: exportSettings,
          security: securitySettings
        })
      });

      if (res.ok) {
        setStatusMessage("System & Platform Settings saved successfully!");
        setTimeout(() => setStatusMessage(""), 3500);
      } else {
        setErrorMessage("Failed to update settings.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      setErrorMessage("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleFullBackupDownload = () => {
    window.open("/api/creator/system/backup", "_blank");
  };

  const handleRestoreJSONUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupObj = JSON.parse(event.target.result);
        if (!window.confirm("Restoring from this JSON backup will overwrite all current studio configurations. Proceed?")) return;

        setLoading(true);
        const res = await fetch("/api/creator/system/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backupData: backupObj })
        });

        if (res.ok) {
          setStatusMessage("System restored successfully from backup file!");
          fetchSettings();
          setTimeout(() => setStatusMessage(""), 3500);
        } else {
          setErrorMessage("Failed to restore backup payload.");
        }
      } catch (err) {
        console.error("Invalid JSON restore file:", err);
        setErrorMessage("Invalid JSON backup file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/system/clear-cache", { method: "POST" });
      if (res.ok) {
        setStatusMessage("Temporary render cache and active sessions purged successfully.");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Clear cache error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryReset = async () => {
    if (!window.confirm("CRITICAL WARNING: This will completely reset all studio settings, themes, marquee items, inquiries, and analytics to factory default baseline. This action cannot be undone. Are you sure?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/creator/system/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFactoryReset: true })
      });

      if (res.ok) {
        setStatusMessage("Factory reset completed. System restored to baseline defaults.");
        fetchSettings();
        setTimeout(() => setStatusMessage(""), 3500);
      }
    } catch (err) {
      console.error("Factory reset failed:", err);
      setErrorMessage("Factory reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageInfo = async () => {
    setStorageLoading(true);
    try {
      // Fetch Postgres database status
      fetch("/api/db/status")
        .then(res => res.json())
        .then(data => setDbStatus(data))
        .catch(err => setDbStatus({ connected: false, error: err.message }));

      const status = await checkStorageStatus();
      setStorageStatus(status);
      const listData = await listStoredAssets(selectedFolder === 'all' ? '' : selectedFolder);
      if (listData && listData.blobs) {
        setStoredBlobs(listData.blobs);
      }
    } catch (err) {
      console.error("Storage fetch error:", err);
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "storage") {
      fetchStorageInfo();
    }
  }, [activeSubTab, selectedFolder]);

  const handleTestProbe = async () => {
    setProbeLoading(true);
    setProbeResult(null);
    try {
      // Create a 1x1 test pixel or simple canvas blob
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#7226FF";
      ctx.fillRect(0, 0, 120, 120);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px monospace";
      ctx.fillText("SNPSHOT", 28, 50);
      ctx.fillText("PROBE", 38, 75);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const uploadRes = await uploadAsset({
        file: blob,
        folder: "temp",
        filename: `storage-probe-${Date.now()}.png`
      });

      setProbeResult({
        success: true,
        data: uploadRes,
        timestamp: new Date().toLocaleTimeString()
      });
      fetchStorageInfo();
    } catch (err) {
      setProbeResult({
        success: false,
        error: err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setProbeLoading(false);
    }
  };

  const handleRunMigration = async (targetFolder = "all") => {
    setMigrationLoading(true);
    setMigrationResult(null);
    try {
      const res = await migrateLocalSeeds(targetFolder);
      setMigrationResult({
        success: res.success,
        message: res.message,
        migrated: res.migrated || [],
        errors: res.errors || [],
        timestamp: new Date().toLocaleTimeString()
      });
      fetchStorageInfo();
    } catch (err) {
      setMigrationResult({
        success: false,
        message: err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setMigrationLoading(false);
    }
  };

  const handleRunStorageMaintenance = async () => {
    setMaintLoading(true);
    setMaintResult(null);
    try {
      const res = await triggerStorageMaintenance();
      setMaintResult({
        success: res.success,
        freedFormatted: res.freedFormatted,
        purgedTempFiles: res.purgedTempFiles,
        message: res.status,
        timestamp: new Date().toLocaleTimeString()
      });
      fetchStorageInfo();
    } catch (err) {
      setMaintResult({
        success: false,
        message: err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setMaintLoading(false);
    }
  };

  if (loading && !saving) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 text-[#7226FF] animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#010030]">Loading Platform Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Main Save Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e2dced] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#7226FF]/10 text-[#7226FF] font-bold">
              Module 10 // Settings
            </span>
            <span className="text-xs text-[#625b82] font-mono">
              Control Plane
            </span>
          </div>
          <h1 className="text-xl font-black text-[#010030] tracking-tight">
            System & Platform Configuration
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettings}
            className="admin-btn p-2.5 border border-[#e2dced] bg-white rounded-xl text-[#010030] hover:bg-[#f0ecf8] transition-colors cursor-pointer"
            title="Reload Settings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="admin-btn px-4 py-2.5 bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(114,38,255,0.3)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1 bg-[#f8f6fc] p-2 rounded-2xl border border-[#e2dced] overflow-x-auto">
        {[
          { id: "camera", label: "Studio Camera & Shutter (Phase 10A)", icon: Camera },
          { id: "export", label: "High-Res Canvas & Print (Phase 10B)", icon: Download },
          { id: "security", label: "Security & Backup Suite (Phase 10C)", icon: Shield },
          { id: "storage", label: "Vercel Blob Storage Engine (Phase 1)", icon: Cloud }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`admin-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-[#010030] text-white shadow-xs"
                  : "text-[#625b82] hover:bg-[#f0ecf8] hover:text-[#010030]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: CAMERA & SHUTTER DEFAULTS (PHASE 10A) */}
      {activeSubTab === "camera" && (
        <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-6">
          <div className="border-b border-[#e2dced] pb-3">
            <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#7226FF]" />
              <span>Studio Camera, Countdown & Capture Defaults</span>
            </h2>
            <p className="text-xs text-[#625b82]">
              Configure hardware capture parameters, audio feedback, and countdown timing for photostrip shooting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Default Countdown Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7226FF]" />
                <span>Default Countdown Timer (Seconds)</span>
              </label>
              <select
                value={cameraSettings.defaultCountdown}
                onChange={(e) => setCameraSettings({ ...cameraSettings, defaultCountdown: Number(e.target.value) })}
                className="admin-ui w-full px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] font-medium focus:outline-none focus:border-[#7226FF]"
              >
                <option value={3}>3 Seconds (Fast Shoot)</option>
                <option value={5}>5 Seconds (Studio Standard)</option>
                <option value={10}>10 Seconds (Group Pose)</option>
              </select>
              <p className="text-[11px] text-[#625b82]">Initial countdown length before the shutter triggers.</p>
            </div>

            {/* Auto-Burst Interval */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-Burst Pose Interval (Seconds)</span>
              </label>
              <select
                value={cameraSettings.autoBurstInterval}
                onChange={(e) => setCameraSettings({ ...cameraSettings, autoBurstInterval: Number(e.target.value) })}
                className="admin-ui w-full px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] font-medium focus:outline-none focus:border-[#7226FF]"
              >
                <option value={2}>2 Seconds (Rapid Burst)</option>
                <option value={3}>3 Seconds (Standard Sequence)</option>
                <option value={5}>5 Seconds (Relaxed Reset)</option>
              </select>
              <p className="text-[11px] text-[#625b82]">Delay between consecutive photo captures in multi-grid layouts.</p>
            </div>

            {/* Shutter Sound Toggle & Volume */}
            <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                    {cameraSettings.shutterSoundEnabled ? <Volume2 className="w-4 h-4 text-[#7226FF]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>Shutter Audio Feedback</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82]">Play nostalgic studio shutter sound upon photo capture.</p>
                </div>
                <input
                  type="checkbox"
                  checked={cameraSettings.shutterSoundEnabled}
                  onChange={(e) => setCameraSettings({ ...cameraSettings, shutterSoundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#7226FF] cursor-pointer"
                />
              </div>

              {cameraSettings.shutterSoundEnabled && (
                <div className="pt-2 border-t border-[#e2dced] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#010030]">
                    <span>Audio Volume Level</span>
                    <span className="font-mono text-[#7226FF]">{cameraSettings.audioVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cameraSettings.audioVolume}
                    onChange={(e) => setCameraSettings({ ...cameraSettings, audioVolume: Number(e.target.value) })}
                    className="w-full accent-[#7226FF] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Mirror Preview & Flash Overlay */}
            <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#010030]">Mirror Camera Preview</h3>
                <p className="text-[11px] text-[#625b82]">Flip horizontal camera feed so users see natural mirror reflections.</p>
              </div>
              <input
                type="checkbox"
                checked={cameraSettings.mirrorPreview}
                onChange={(e) => setCameraSettings({ ...cameraSettings, mirrorPreview: e.target.checked })}
                className="w-4 h-4 accent-[#7226FF] cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#010030]">Studio Flash Effect</h3>
                <p className="text-[11px] text-[#625b82]">Brief white screen flash illumination during shutter trigger.</p>
              </div>
              <input
                type="checkbox"
                checked={cameraSettings.flashEffect}
                onChange={(e) => setCameraSettings({ ...cameraSettings, flashEffect: e.target.checked })}
                className="w-4 h-4 accent-[#7226FF] cursor-pointer"
              />
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: HIGH-RES CANVAS EXPORT & PRINT (PHASE 10B) */}
      {activeSubTab === "export" && (
        <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-6">
          <div className="border-b border-[#e2dced] pb-3">
            <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#7226FF]" />
              <span>High-Res Canvas Export & Print Engine Defaults</span>
            </h2>
            <p className="text-xs text-[#625b82]">
              Configure default DPI rendering quality, output image formats, frame geometry, and brand watermarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Resolution DPI Standard */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#010030]">Export DPI Resolution Standard</label>
              <select
                value={exportSettings.defaultDpi}
                onChange={(e) => setExportSettings({ ...exportSettings, defaultDpi: e.target.value })}
                className="admin-ui w-full px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] font-medium focus:outline-none focus:border-[#7226FF]"
              >
                <option value="300">300 DPI Studio Print Quality (2400 x 7200 px)</option>
                <option value="150">150 DPI Digital Web Quality (1200 x 3600 px)</option>
              </select>
              <p className="text-[11px] text-[#625b82]">Higher DPI ensures razor-sharp physical print outputs.</p>
            </div>

            {/* Export Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#010030]">Image Output Format</label>
              <select
                value={exportSettings.defaultFormat}
                onChange={(e) => setExportSettings({ ...exportSettings, defaultFormat: e.target.value })}
                className="admin-ui w-full px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] font-medium focus:outline-none focus:border-[#7226FF]"
              >
                <option value="PNG">PNG (Lossless Transparency & Sharpness)</option>
                <option value="JPEG">JPEG (Compressed File Size)</option>
              </select>
            </div>

            {/* Default Frame Outer Padding */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#010030]">
                <span>Default Frame Outer Padding</span>
                <span className="font-mono text-[#7226FF]">{exportSettings.framePaddingPx} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={exportSettings.framePaddingPx}
                onChange={(e) => setExportSettings({ ...exportSettings, framePaddingPx: Number(e.target.value) })}
                className="w-full accent-[#7226FF] cursor-pointer"
              />
            </div>

            {/* Default Photo Gap Spacing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#010030]">
                <span>Default Photo Inner Gap</span>
                <span className="font-mono text-[#7226FF]">{exportSettings.photoGapPx} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={exportSettings.photoGapPx}
                onChange={(e) => setExportSettings({ ...exportSettings, photoGapPx: Number(e.target.value) })}
                className="w-full accent-[#7226FF] cursor-pointer"
              />
            </div>

            {/* Watermark Controls */}
            <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030]">Brand Watermark Footer</h3>
                  <p className="text-[11px] text-[#625b82]">Include signature studio branding watermark on exported photostrips.</p>
                </div>
                <input
                  type="checkbox"
                  checked={exportSettings.watermarkEnabled}
                  onChange={(e) => setExportSettings({ ...exportSettings, watermarkEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#7226FF] cursor-pointer"
                />
              </div>

              {exportSettings.watermarkEnabled && (
                <div className="space-y-3 pt-2 border-t border-[#e2dced]">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#010030]">Watermark Text Line</label>
                    <input
                      type="text"
                      value={exportSettings.watermarkText}
                      onChange={(e) => setExportSettings({ ...exportSettings, watermarkText: e.target.value })}
                      className="admin-ui w-full px-3 py-2 bg-white border border-[#e2dced] rounded-xl text-xs font-mono text-[#010030]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#010030]">Include Date Watermark Stamp</span>
                    <input
                      type="checkbox"
                      checked={exportSettings.includeDateStamp}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeDateStamp: e.target.checked })}
                      className="w-4 h-4 accent-[#7226FF] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: SYSTEM SECURITY, BACKUP & FACTORY RESET (PHASE 10C) */}
      {activeSubTab === "security" && (
        <div className="space-y-6">
          
          {/* Security & Access Panel */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="border-b border-[#e2dced] pb-3">
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7226FF]" />
                <span>Admin Credentials & Security Mode</span>
              </h2>
              <p className="text-xs text-[#625b82]">Manage admin dashboard access key, session limits, and maintenance modes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Admin Passkey */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#010030] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#7226FF]" />
                  <span>Admin Access Passkey</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? "text" : "password"}
                    value={securitySettings.passkey}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passkey: e.target.value })}
                    className="admin-ui w-full pl-3 pr-10 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs font-mono text-[#010030]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="admin-btn absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#010030] cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#010030] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#7226FF]" />
                  <span>Admin Session Timeout</span>
                </label>
                <select
                  value={securitySettings.sessionTimeoutMinutes}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="admin-ui w-full px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] font-medium"
                >
                  <option value={15}>15 Minutes Inactivity</option>
                  <option value={30}>30 Minutes Inactivity</option>
                  <option value={60}>60 Minutes Inactivity</option>
                  <option value={120}>120 Minutes Inactivity</option>
                </select>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between sm:col-span-2">
                <div>
                  <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Studio Maintenance Mode</span>
                  </h3>
                  <p className="text-[11px] text-amber-700">
                    When active, public studio booth displays a maintenance banner and pauses new camera sessions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.maintenanceMode}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Backup, Restore & Maintenance Suite */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="border-b border-[#e2dced] pb-3">
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#7226FF]" />
                <span>System Backup, Restore & Maintenance Suite</span>
              </h2>
              <p className="text-xs text-[#625b82]">Download full system state backups, import restores, or trigger baseline resets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Full System Backup */}
              <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#7226FF]" />
                    <span>Full System Backup</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82] mt-1">
                    Export entire studio configuration (frames, stickers, themes, website content, inquiries) in JSON format.
                  </p>
                </div>
                <button
                  onClick={handleFullBackupDownload}
                  className="admin-btn w-full px-3 py-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Restore JSON Backup */}
              <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>Restore From Backup</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82] mt-1">
                    Upload a previously exported JSON backup file to restore complete studio state.
                  </p>
                </div>
                <label className="admin-btn w-full px-3 py-2 bg-[#010030] hover:bg-[#0e0048] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center">
                  <Download className="w-3.5 h-3.5 rotate-180" />
                  <span>Upload Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreJSONUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Clear Temporary Cache */}
              <div className="p-4 bg-[#f8f6fc] rounded-xl border border-[#e2dced] space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-amber-500" />
                    <span>Purge Session Cache</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82] mt-1">
                    Purge active temporary render canvas caches and unreferenced session objects.
                  </p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="admin-btn w-full px-3 py-2 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear Studio Cache</span>
                </button>
              </div>

            </div>

            {/* Factory Reset Danger Zone */}
            <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Factory System Reset</span>
                </h3>
                <p className="text-[11px] text-red-700">
                  Reset all frames, filters, website copy, settings, and analytics to default factory state.
                </p>
              </div>
              <button
                onClick={handleFactoryReset}
                className="admin-btn px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trigger Factory Reset</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 4: VERCEL BLOB & STORAGE ENGINE (PHASE 1) */}
      {activeSubTab === "storage" && (
        <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-6 animate-fadeIn">
          
          <div className="border-b border-[#e2dced] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#7226FF]" />
                <span>Vercel Blob Storage Engine & CDN Pipeline</span>
              </h2>
              <p className="text-xs text-[#625b82]">
                Monitor storage architecture, verify cloud token availability, and test direct upload probe latency.
              </p>
            </div>

            <button
              onClick={fetchStorageInfo}
              disabled={storageLoading}
              className="admin-btn px-3 py-1.5 border border-[#e2dced] bg-[#f8f6fc] hover:bg-[#f0ecf8] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#7226FF] ${storageLoading ? "animate-spin" : ""}`} />
              <span>Refresh Storage Status</span>
            </button>
          </div>

          {/* Storage & Database Engine Status Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Postgres Database Card */}
            <div className="p-4 rounded-xl border border-[#e2dced] bg-[#f8f6fc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#625b82] tracking-wider">Vercel Postgres DB</span>
                <Database className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-sm font-black text-[#010030]">
                {dbStatus?.connected ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Postgres Edge Live
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Checking Status...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#625b82] font-mono">
                {dbStatus?.tables?.length ? `${dbStatus.tables.length} schemas verified • ${dbStatus.adminUserCount || 1} admin` : "Connecting to Postgres..."}
              </p>
            </div>

            {/* Active Provider Card */}
            <div className="p-4 rounded-xl border border-[#e2dced] bg-[#f8f6fc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#625b82] tracking-wider">Active Blob Engine</span>
                <Cloud className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-sm font-black text-[#010030]">
                {storageStatus?.provider === 'vercel-blob' ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Vercel Edge Blob Storage
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Local Filesystem Fallback
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#625b82]">
                {storageStatus?.storageMode || "Checking environment..."}
              </p>
            </div>

            {/* Token Status Card */}
            <div className="p-4 rounded-xl border border-[#e2dced] bg-[#f8f6fc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#625b82] tracking-wider">Auth Token Config</span>
                <Key className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-sm font-black text-[#010030]">
                {storageStatus?.isBlobConfigured ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                    ACTIVE ({storageStatus.tokenPrefix})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-bold">
                    NOT SET (Fallback Active)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#625b82]">
                Declare <code className="bg-white px-1 py-0.5 rounded border border-[#e2dced] text-[#7226FF]">BLOB_READ_WRITE_TOKEN</code> in Vercel.
              </p>
            </div>

            {/* Total Stored Media Assets */}
            <div className="p-4 rounded-xl border border-[#e2dced] bg-[#f8f6fc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#625b82] tracking-wider">Indexed Assets</span>
                <Layers className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-xl font-black text-[#010030]">
                {storedBlobs.length} <span className="text-xs font-normal text-[#625b82]">Items</span>
              </div>
              <p className="text-[11px] text-[#625b82]">
                Across poses, frames, stickers, themes & gallery
              </p>
            </div>

          </div>

          {/* Phase 4 & Phase 5: Seed Migration & Maintenance Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Seed Migration Card */}
            <div className="p-5 rounded-2xl border border-[#e2dced] bg-[#f8f6fc] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5 uppercase tracking-wider">
                    <ArrowUpRight className="w-4 h-4 text-[#7226FF]" />
                    <span>Phase 4 // Seed Migration Suite</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82] mt-0.5">
                    Sync local file seeds (poses, frames, stickers, themes) into Vercel Blob cloud bucket.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#e2dced] text-xs space-y-2">
                <div className="flex items-center justify-between text-[#625b82]">
                  <span>Local Assets Ready:</span>
                  <span className="font-mono font-bold text-[#010030]">
                    {storageStatus?.localStats?.totalFiles || 0} files ({storageStatus?.localStats?.formattedSize || '0 MB'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#625b82]">
                  <span>Target Cloud Provider:</span>
                  <span className="font-mono font-bold text-[#7226FF]">
                    {storageStatus?.isBlobConfigured ? 'Vercel Edge Blob' : 'Local Fallback'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunMigration("all")}
                  disabled={migrationLoading || !storageStatus?.isBlobConfigured}
                  className="admin-btn flex-1 px-3 py-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowUpRight className={`w-3.5 h-3.5 ${migrationLoading ? "animate-spin" : ""}`} />
                  <span>{migrationLoading ? "Migrating Assets..." : "Migrate All Seed Assets"}</span>
                </button>
              </div>

              {migrationResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${migrationResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>{migrationResult.success ? "Migration Succeeded" : "Migration Notice"}</span>
                    <span className="text-[10px] opacity-70">{migrationResult.timestamp}</span>
                  </div>
                  <p className="mt-1 text-[11px]">{migrationResult.message}</p>
                </div>
              )}
            </div>

            {/* Storage Maintenance & Edge Delivery Card */}
            <div className="p-5 rounded-2xl border border-[#e2dced] bg-[#f8f6fc] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#010030] flex items-center gap-1.5 uppercase tracking-wider">
                    <Globe className="w-4 h-4 text-[#7226FF]" />
                    <span>Phase 5 // Edge CDN & Cache Maintenance</span>
                  </h3>
                  <p className="text-[11px] text-[#625b82] mt-0.5">
                    Purge temporary upload buffers, optimize delivery cache headers, and inspect Edge CDN health.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#e2dced] text-xs space-y-2">
                <div className="flex items-center justify-between text-[#625b82]">
                  <span>Edge CDN Cache-Control:</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    max-age=31536000 (1 Year Immutable)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#625b82]">
                  <span>CDN Routing:</span>
                  <span className="font-mono font-bold text-[#010030]">
                    {storageStatus?.edgeCdn?.globalDistribution || 'Vercel Anycast Edge'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunStorageMaintenance}
                  disabled={maintLoading}
                  className="admin-btn flex-1 px-3 py-2 bg-[#010030] hover:bg-[#0e0048] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Cpu className={`w-3.5 h-3.5 ${maintLoading ? "animate-spin" : ""}`} />
                  <span>{maintLoading ? "Running Optimization..." : "Execute Cache & Storage Sweep"}</span>
                </button>
              </div>

              {maintResult && (
                <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 text-xs font-mono">
                  <div className="font-bold flex items-center justify-between">
                    <span>Routine Completed</span>
                    <span className="text-[10px] opacity-70">{maintResult.timestamp}</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    Purged {maintResult.purgedTempFiles} stale artifacts ({maintResult.freedFormatted} freed).
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Test Probe Tool */}
          <div className="p-5 rounded-2xl border border-[#2e109d]/20 bg-gradient-to-br from-[#010030]/5 to-[#7226FF]/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#010030] flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#7226FF]" />
                  <span>Interactive Pipeline Probe</span>
                </h3>
                <p className="text-xs text-[#625b82]">
                  Synthesizes a 120×120px micro-asset and tests end-to-end upload and persistence resolution.
                </p>
              </div>

              <button
                onClick={handleTestProbe}
                disabled={probeLoading}
                className="admin-btn px-4 py-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Radio className={`w-3.5 h-3.5 ${probeLoading ? "animate-pulse" : ""}`} />
                <span>{probeLoading ? "Executing Probe..." : "Run Storage Probe"}</span>
              </button>
            </div>

            {probeResult && (
              <div className={`p-4 rounded-xl border text-xs ${probeResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    {probeResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{probeResult.success ? "Probe Successfully Executed & Stored" : "Probe Failed"}</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{probeResult.timestamp}</span>
                </div>
                {probeResult.success ? (
                  <div className="space-y-1 font-mono text-[11px] mt-2">
                    <div><span className="font-bold">Provider:</span> {probeResult.data.provider}</div>
                    <div><span className="font-bold">Public URL:</span> <a href={probeResult.data.url} target="_blank" rel="noreferrer" className="underline text-[#7226FF]">{probeResult.data.url}</a></div>
                    <div><span className="font-bold">Size:</span> {probeResult.data.size} bytes | <span className="font-bold">MIME:</span> {probeResult.data.contentType}</div>
                  </div>
                ) : (
                  <p className="font-mono text-[11px] mt-1">{probeResult.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Stored Assets Browser */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-[#010030] uppercase tracking-wider">
                Asset Repository Browser ({storedBlobs.length})
              </h3>

              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {["all", "poses", "themes", "frames", "stickers", "gallery", "temp"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                      selectedFolder === f
                        ? "bg-[#010030] text-white"
                        : "bg-[#f8f6fc] text-[#625b82] hover:bg-[#e2dced]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-[#e2dced] rounded-xl divide-y divide-[#e2dced]">
              {storedBlobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#625b82]">
                  No assets stored in folder &quot;{selectedFolder}&quot;.
                </div>
              ) : (
                storedBlobs.map((blob, idx) => (
                  <div key={idx} className="p-2.5 hover:bg-[#f8f6fc] transition-colors flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#f0ecf8] border border-[#e2dced] overflow-hidden shrink-0 flex items-center justify-center">
                        <img 
                          src={blob.url} 
                          alt="asset" 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#010030] truncate">{blob.pathname || blob.url}</p>
                        <p className="text-[10px] text-[#625b82] font-mono">
                          {blob.size ? `${(blob.size / 1024).toFixed(1)} KB` : "Stored"}
                        </p>
                      </div>
                    </div>

                    <a
                      href={blob.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#7226FF] hover:bg-[#f0ecf8] rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Open asset"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SystemSettingsManager;
