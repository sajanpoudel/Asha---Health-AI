'use client';

import dynamic from 'next/dynamic';

const MedicalRecordsPage = dynamic(() => import('@/components/pages/MedicalRecordsPage'), { ssr: false });

export default function MedicalRecords() {
  return <MedicalRecordsPage />;
}
