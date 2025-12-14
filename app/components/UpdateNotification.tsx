'use client';

import { useEffect, useState } from 'react';

const UpdateNotification = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check if we're in Electron environment
            const isElectron = !!(window as any).electronAPI;
            
            if (isElectron) {
                // Listen for update-available event from main process
                if ((window as any).electron?.ipcRenderer) {
                    (window as any).electron.ipcRenderer.on('update-available', () => {
                        console.log('Update available');
                        setUpdateAvailable(true);
                    });
                    (window as any).electron.ipcRenderer.on('update-downloaded', () => {
                        console.log('Update downloaded');
                        setUpdateDownloaded(true);
                        setUpdateAvailable(false);
                    });
                    
                    // Check for updates on startup
                    (window as any).electron.ipcRenderer.invoke('check-for-updates')
                        .catch((err: any) => console.log('Update check skipped (dev mode)', err));
                }
            }
        }
    }, []);

    const handleUpdate = () => {
        if ((window as any).electron?.ipcRenderer) {
            (window as any).electron.ipcRenderer.invoke('quit-and-install');
        }
    };

    if (!updateAvailable && !updateDownloaded) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-blue-200 z-[100] animate-slide-up">
            <h3 className="font-bold text-gray-800 mb-2">
                {updateDownloaded ? 'Update Ready to Install' : 'Update Available'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                {updateDownloaded 
                    ? 'A new version has been downloaded. Restart now to apply?'
                    : 'A new version is available. Downloading now...'}
            </p>
            {updateDownloaded && (
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => setUpdateDownloaded(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Later
                    </button>
                    <button 
                        onClick={handleUpdate}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 rounded"
                    >
                        Restart & Update
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpdateNotification;

