import type { Metadata } from 'next';
import TemplatesClient from './templates-client';

export const metadata: Metadata = {
  title: 'Form Templates - FormBuilder',
  description: 'Curated form template blueprints. Save time and construct feedback systems, RSVPs, or PMF studies with pre-configured schemas.',
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
