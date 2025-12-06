'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import useModal from '@/app/editor/store/useModal';

import { VideoGenerator } from '@/app/utils/ffmpeg';
import ModalContainer from '@/app/components/containers/ModalContainer';

export default function ExportModal() {
  const { project, fps, holdThreshold } = useStore();
  const [activeTab, setActiveTab] = useState<'video' | 'project'>('video');
  const [format, setFormat] = useState<'mp4' | 'gif'>('mp4');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [exportFps, setExportFps] = useState(60); // Default to smooth 60fps for video
  const [playbackFps, setPlaybackFps] = useState(fps); // Default to project fps
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
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
        a.download = `animation.${format}`;
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

  return (
    <ModalContainer>
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'video' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-600'}`}
            onClick={() => setActiveTab('video')}
          >
            Video / Image
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'project' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-600'}`}
            onClick={() => setActiveTab('project')}
          >
            Project
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'video' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value as 'mp4' | 'gif')}
                  className="w-full border rounded p-2"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="gif">GIF Animation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value as '1080p' | '720p')}
                  className="w-full border rounded p-2"
                >
                  <option value="1080p">1080p (FHD)</option>
                  <option value="720p">720p (HD)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Playback Speed</label>
                    <input 
                      type="number" 
                      value={playbackFps} 
                      onChange={(e) => setPlaybackFps(Number(e.target.value))}
                      className="w-full border rounded p-2"
                      min="1" max="60"
                    />
                    <p className="text-[10px] text-gray-500">Keyframes / sec</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Quality</label>
                    <input 
                      type="number" 
                      value={exportFps} 
                      onChange={(e) => setExportFps(Number(e.target.value))}
                      className="w-full border rounded p-2"
                      min="1" max="120"
                    />
                    <p className="text-[10px] text-gray-500">Output FPS</p>
                  </div>
              </div>

              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                  <p>Duration: {Math.max(0, (project.frames.length - 1) / playbackFps).toFixed(2)}s</p>
                  <p>Total Frames: {Math.ceil(Math.max(0, (project.frames.length - 1) / playbackFps) * exportFps)}</p>
              </div>
              <button
                onClick={handleVideoExport}
                disabled={isExporting}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export Video'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Save your project as a <strong>.psproject</strong> file. You can load this file later to continue editing.
              </p>
              <button
                onClick={handleProjectExport}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Project
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 flex justify-end">
          <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
