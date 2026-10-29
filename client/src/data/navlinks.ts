import type { INavLink } from '../types';

export const navLinks: INavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Generate', href: '/generate' },
  { name: 'My Generation', href: '/my-generation', authRequired: true },
  { name: 'About', href: '#', authRequired: false },
  { name: 'Contact Us', href: '#' },
];
