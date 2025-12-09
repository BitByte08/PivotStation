import React from 'react';
import Header from './components/layouts/Header';
import Timeline from './components/layouts/Timeline';
import Modal from './components/modals';

export default function EditorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>
      <Header />
      {children}
      <Timeline />
      <Modal />
    </>;
}

