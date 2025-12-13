
interface ElectronAPI {
    ipcRenderer: {
        on(channel: string, func: (...args: any[]) => void): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
    };
}

interface Window {
    electron?: ElectronAPI;
}
