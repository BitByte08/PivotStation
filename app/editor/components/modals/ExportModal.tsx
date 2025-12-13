'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import useModal from '@/app/editor/store/useModal';

import { VideoGenerator } from '@/app/utils/ffmpeg';
import ModalContainer from '@/app/components/containers/ModalContainer';

export default function ExportModal() {
  const { project, fps, holdThreshold, saveToLocalStorage } = useStore();
  const [activeTab, setActiveTab] = useState<'video' | 'project'>('video');
  const [format, setFormat] = useState<'mp4' | 'gif'>('mp4');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [exportFps, setExportFps] = useState(60); // Default to smooth 60fps for video
  const [playbackFps, setPlaybackFps] = useState(fps); // Default to project fps
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const { closeModal } = useModal();
  // Update playbackFps if store fps changes (initial load)
  useEffect(() => {
      setPlaybackFps(fps);
  }, [fps]);

  const handleProjectExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name || 'project'}.psproject`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    closeModal();
  };

  const handleVideoExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
        const generator = new VideoGenerator();
        // Use playbackFps for timing, exportFps for smoothness
        const url = await generator.createVideo(project, playbackFps, exportFps, format, resolution, 0, (p) => setProgress(p));
        
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `RefMotion_Export_${timestamp}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        alert('Export successful!');
    } catch (e) {
        console.error(e);
        alert('Export failed. See console for details.');
    } finally {
        setIsExporting(false);
        closeModal();
    }
  };

  const handleSaveProject = () => {
    saveToLocalStorage();
    setSaveMessage('저장되었습니다!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  return (
      <ModalContainer isOpen={true}>
        <div className="bg-surface rounded-2xl rounded-l-none shadow-sm w-96 h-full overflow-auto flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-foreground/10">
            <h2 className="text-xl font-bold text-foreground">Export</h2>
            <button onClick={closeModal} className="text-foreground/50 hover:text-foreground transition-colors">✕</button>
          </div>
          <div className="flex border-b border-foreground/10">
            <button
              className={`flex-1 py-3 text-sm font-medium transition-colors bg-background ${activeTab === 'video' ? 'text-primary border-b-2 border-primary' : 'text-foreground/60 hover:text-foreground'}`}
            onClick={() => setActiveTab('video')}
          >
            Video / Image
          </button>
          <button
              className={`flex-1 py-3 text-sm font-medium transition-colors bg-background ${activeTab === 'project' ? 'text-primary border-b-2 border-primary' : 'text-foreground/60 hover:text-foreground'}`}
            onClick={() => setActiveTab('project')}
          >
            Project
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {activeTab === 'video' ? (
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value as 'mp4' | 'gif')}
                    className="w-full border border-foreground/20 rounded bg-background text-foreground p-2"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="gif">GIF Animation</option>
                </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Resolution</label>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value as '1080p' | '720p')}
                    className="w-full border border-foreground/20 rounded bg-background text-foreground p-2"
                >
                  <option value="1080p">1080p (FHD)</option>
                  <option value="720p">720p (HD)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Playback Speed</label>
                    <input 
                      type="number" 
                      value={playbackFps} 
                      onChange={(e) => setPlaybackFps(Number(e.target.value))}
                        className="w-full border border-foreground/20 rounded bg-background text-foreground p-2"
                      min="1" max="60"
                    />
                      <p className="text-[10px] text-foreground/50">Keyframes / sec</p>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Video Quality</label>
                    <input 
                      type="number" 
                      value={exportFps} 
                      onChange={(e) => setExportFps(Number(e.target.value))}
                        className="w-full border border-foreground/20 rounded bg-background text-foreground p-2"
                      min="1" max="120"
                    />
                      <p className="text-[10px] text-foreground/50">Output FPS</p>
                  </div>
              </div>

                <div className="bg-background/50 p-2 rounded text-xs text-foreground/60 border border-foreground/10">
                  <p>Duration: {Math.max(0, (project.frames.length - 1) / playbackFps).toFixed(2)}s</p>
                  <p>Total Frames: {Math.ceil(Math.max(0, (project.frames.length - 1) / playbackFps) * exportFps)}</p>
              </div>
              <button
                onClick={handleVideoExport}
                disabled={isExporting}
                className="w-full py-2 bg-background text-foreground rounded border border-foreground/20 hover:border-foreground/40 disabled:opacity-50 transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Export Video'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
                <p className="text-sm text-foreground/60">
                Save your project as a <strong>.psproject</strong> file. You can load this file later to continue editing.
              </p>
              <button
                onClick={handleProjectExport}
                className="w-full py-2 bg-background text-foreground rounded border border-foreground/20 hover:border-foreground/40 transition-colors"
              >
                Export Project
              </button>
              <p className="text-xs text-foreground/50 border-t border-foreground/10 pt-3">또는 로컬스토리지에 저장하기:</p>
              <button
                onClick={handleSaveProject}
                className="w-full py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Save to Local Storage
              </button>
              {saveMessage && (
                <p className="text-xs text-primary text-center">{saveMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
