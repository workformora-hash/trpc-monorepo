import type { Metadata } from 'next';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'FormBuilder - Pristine Form Creator',
  description: 'Create beautiful forms and surveys and gather responses with ease.',
};

export default function Home() {
  return <HomeClient />;
}
