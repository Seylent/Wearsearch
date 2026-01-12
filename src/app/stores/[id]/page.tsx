'use client';

import { useParams } from 'next/navigation';
import StoresContent from '@/components/pages/StoresContent';

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params?.id as string;
  
  // Pass storeId to StoresContent to display single store
  return <StoresContent storeId={storeId} />;
}
