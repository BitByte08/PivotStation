import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Project, Frame, Figure, Pivot, Shape } from '@/app/types';

export class VideoGenerator {
  private ffmpeg: FFmpeg;
  private loaded: boolean = false;
  private wasmModule: any = null;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async load() {
    if (this.loaded) return;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    // Load Interpolation Wasm
    try {
        const wasm = await import('wasm');
        await wasm.default();
        this.wasmModule = wasm;
    } catch (e) {
        console.error("Failed to load interpolation Wasm:", e);
    }

    this.loaded = true;
  }

  private generateSVGString(frame: Frame, width: number, height: number): string {
    const renderShape = (shape: Shape, allPivots: Map<string, Pivot>, figureColor?: string, figureOpacity?: number) => {
        const pivots = shape.pivotIds.map(id => allPivots.get(id)).filter(p => p !== undefined) as Pivot[];
        const stroke = shape.color || figureColor || 'black';
        const strokeWidth = 4;
        const opacity = figureOpacity ?? 1;

        if (shape.type === 'line' && pivots.length >= 2) {
            return `<line x1="${pivots[0].x}" y1="${pivots[0].y}" x2="${pivots[1].x}" y2="${pivots[1].y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${opacity}" />`;
        } else if (shape.type === 'circle' && pivots.length >= 2) {
            const cx = (pivots[0].x + pivots[1].x) / 2;
            const cy = (pivots[0].y + pivots[1].y) / 2;
            const r = Math.sqrt(Math.pow(pivots[0].x - pivots[1].x, 2) + Math.pow(pivots[0].y - pivots[1].y, 2)) / 2;
            return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" />`;
        } else if (shape.type === 'curve' && pivots.length >= 3) {
             const d = `M ${pivots[0].x} ${pivots[0].y} Q ${pivots[1].x} ${pivots[1].y} ${pivots[2].x} ${pivots[2].y}`;
             return `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" opacity="${opacity}" />`;
        }
        return '';
    };

    const renderPivot = (pivot: Pivot, isRoot: boolean, color: string) => {
        if (pivot.hidden) return ''; 
        let svg = `<circle cx="${pivot.x}" cy="${pivot.y}" r="${isRoot ? 6 : 4}" fill="${color}" />`;
        for (const child of pivot.children) {
            svg += renderPivot(child, false, 'red'); 
        }
        return svg;
    };

    let svgContent = '';
    svgContent += `<rect width="${width}" height="${height}" fill="white" />`;

    for (const figure of frame.figures) {
        const allPivots = new Map<string, Pivot>();
        const collectPivots = (p: Pivot) => {
            allPivots.set(p.id, p);
            p.children.forEach(collectPivots);
        };
        collectPivots(figure.root_pivot);

        if (figure.shapes) {
            for (const shape of figure.shapes) {
                svgContent += renderShape(shape, allPivots, figure.color, figure.opacity);
            }
        }
    }

    return `<svg width="${width}" height="${height}" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
  }

  async createVideo(project: Project, projectFps: number, exportFps: number, format: 'mp4' | 'gif', resolution: '1080p' | '720p', holdThreshold: number, onProgress: (p: number) => void): Promise<string> {
    await this.load();

    const width = resolution === '1080p' ? 1920 : 1280;
    const height = resolution === '1080p' ? 1080 : 720;
    const canvasWidth = width; 
    const canvasHeight = height;

    // Calculate total frames to generate
    // Total duration = (keyframes - 1) / projectFps (seconds)
    // Total video frames = Total duration * exportFps
    const totalDuration = Math.max(0, (project.frames.length - 1) / projectFps);
    const totalVideoFrames = Math.ceil(totalDuration * exportFps);

    console.log(`Exporting: ${totalDuration}s, ${totalVideoFrames} frames at ${exportFps} FPS (Project FPS: ${projectFps})`);

    for (let i = 0; i <= totalVideoFrames; i++) {
        const currentTime = i / exportFps;
        const keyframeIndex = Math.floor(currentTime * projectFps);
        const nextKeyframeIndex = keyframeIndex + 1;
        
        let frameToRender = project.frames[keyframeIndex];

        // Interpolation Logic
        if (nextKeyframeIndex < project.frames.length) {
            if (!this.wasmModule) {
                console.warn("Wasm module not loaded, skipping interpolation");
            } else {
                const rawT = (currentTime - (keyframeIndex / projectFps)) * projectFps; // Normalize t to 0-1
                
                let t = 0;
                if (rawT > holdThreshold) {
                    if (holdThreshold >= 1) {
                        t = 0;
                    } else {
                        t = (rawT - holdThreshold) / (1 - holdThreshold);
                    }
                }

                // console.log(`Frame ${i}: t=${t.toFixed(2)} (rawT=${rawT.toFixed(2)})`);

                const frameA = project.frames[keyframeIndex];
                const frameB = project.frames[nextKeyframeIndex];
                
                try {
                    const result = this.wasmModule.interpolate_frame(frameA, frameB, t);
                    
                    // Patch missing properties
                    if (result && result.figures) {
                        result.figures = result.figures.map((fig: any) => {
                            const sourceFig = frameA.figures.find(f => f.id === fig.id);
                            if (sourceFig) {
                                return {
                                    ...fig,
                                    shapes: sourceFig.shapes,
                                    color: sourceFig.color,
                                    opacity: sourceFig.opacity
                                };
                            }
                            return fig;
                        });
                        frameToRender = result;
                    }
                } catch (e) {
                    console.error("Interpolation failed:", e);
                }
            }
        } else if (keyframeIndex >= project.frames.length) {
             // End of animation, hold last frame
             frameToRender = project.frames[project.frames.length - 1];
        }

        const svgString = this.generateSVGString(frameToRender, width, height);
        
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0);
        
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Could not create blob from canvas');
        
        const buffer = await blob.arrayBuffer();
        await this.ffmpeg.writeFile(`frame${i}.png`, new Uint8Array(buffer));
        
        URL.revokeObjectURL(url);
        onProgress((i + 1) / totalVideoFrames * 0.5);
    }

    // FFmpeg command
    const outputName = `output.${format}`;
    const args = [
        '-framerate', exportFps.toString(),
        '-i', 'frame%d.png',
        '-pix_fmt', 'yuv420p',
        outputName
    ];

    await this.ffmpeg.exec(args);
    
    onProgress(0.8);

    const data = await this.ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: format === 'mp4' ? 'video/mp4' : 'image/gif' });
    
    onProgress(1.0);
    return URL.createObjectURL(blob);
  }
}
