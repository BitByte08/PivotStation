'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/app/store/useStore';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const { loadFromLocalStorage, getAllProjects, deleteProject } = useStore();
  const router = useRouter();

  const projects = getAllProjects().sort((a, b) => b.lastModified - a.lastModified);

  const handleProjectClick = (projectId: string) => {
    loadFromLocalStorage(projectId);
    router.push('/editor');
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
      deleteProject(projectId);
      window.location.reload();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-foreground/60">저장된 프로젝트들을 관리하세요</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            Home
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center border border-foreground/10">
            <p className="text-foreground/60 mb-4">저장된 프로젝트가 없습니다.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              새 프로젝트 시작
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-surface rounded-2xl p-6 border border-foreground/10 hover:border-foreground/30 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-foreground mb-2">{project.name}</h2>
                  <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground/40">
                    {formatDate(project.lastModified)}
                  </p>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="px-3 py-1 text-xs bg-background text-foreground rounded border border-foreground/20 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
