'use client';

import { useStore } from '@/app/store/useStore';
import { Pivot } from '@/app/types';

const Trash2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

const AlertTriangle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
  </svg>
);

const CheckCircle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
  </svg>
);

export default function BuilderSidebar() {
  const {
    builderFigure,
    selectedPivotIds,
    validationErrors,
    togglePivotSelection,
    removeBuilderPivot,
    removeBuilderShape,
    setBuilderPivotType,
    addBuilderShape,
    builderShapeType
  } = useStore();

  if (!builderFigure) return null;

  // Collect all pivots from hierarchy
  const allPivots: Pivot[] = [];
  const collectPivots = (pivot: Pivot) => {
    allPivots.push(pivot);
    pivot.children.forEach(collectPivots);
  };
  collectPivots(builderFigure.root_pivot);

  return (
    <div className="fixed right-4 top-20 bottom-20 w-80 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden flex flex-col z-50 select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-50">
        <h2 className="font-bold text-lg">Figure Builder</h2>
        <p className="text-sm text-gray-600">ID: {builderFigure.id}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle size={18} />
              <span>Validation Errors</span>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationErrors.length === 0 && allPivots.length > 0 && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle size={18} />
              <span>유효한 피규어</span>
            </div>
          </div>
        )}

        {/* Pivots List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center justify-between">
            <span>피봇 ({allPivots.length})</span>
            {selectedPivotIds.length > 0 && (
              <span className="text-sm text-blue-600">
                {selectedPivotIds.length}개 선택
              </span>
            )}
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {allPivots.map((pivot) => {
              const isRoot = pivot.id === builderFigure.root_pivot.id;
              const isSelected = selectedPivotIds.includes(pivot.id);
              
              return (
                <div
                  key={pivot.id}
                  className={`p-2 rounded border transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => !isRoot && togglePivotSelection(pivot.id)}
                      className="flex-1 text-left"
                      disabled={isRoot}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isRoot
                              ? 'bg-blue-500'
                              : pivot.type === 'joint'
                              ? 'bg-orange-500'
                              : 'bg-gray-500'
                          }`}
                        />
                        <span className="text-sm font-mono">
                          {pivot.id.slice(0, 12)}...
                        </span>
                        {isRoot && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            루트
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-5">
                        {pivot.type === 'joint' ? '관절' : '고정'} • ({Math.round(pivot.x)}, {Math.round(pivot.y)})
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      {!isRoot && (
                        <>
                          <button
                            onClick={() =>
                              setBuilderPivotType(
                                pivot.id,
                                pivot.type === 'joint' ? 'fixed' : 'joint'
                              )
                            }
                            className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors"
                            title="유형 변경"
                          >
                            {pivot.type === 'joint' ? 'J→F' : 'F→J'}
                          </button>
                          <button
                            onClick={() => removeBuilderPivot(pivot.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="피봇 삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shapes List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">
            선 ({builderFigure.shapes.length})
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {builderFigure.shapes.length === 0 && (
              <p className="text-sm text-gray-500 italic">선이 없습니다</p>
            )}
            {builderFigure.shapes.map((shape, idx) => (
              <div
                key={idx}
                className="p-2 bg-gray-50 border border-gray-200 rounded flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium capitalize">
                    {shape.type === 'line' ? '선' : shape.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    {shape.pivotIds.length}개 피봇
                  </div>
                </div>
                <button
                  onClick={() => removeBuilderShape(idx)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="선 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Figure Properties */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700">속성</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm text-gray-600">색상</label>
              <input
                type="color"
                value={builderFigure.color || '#000000'}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">두께</label>
              <input
                type="number"
                value={builderFigure.thickness || 4}
                min="1"
                max="20"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
