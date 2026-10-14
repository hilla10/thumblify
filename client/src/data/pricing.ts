import type { IPricing } from '../types';

export const pricingData: IPricing[] = [
  {
    name: 'Basic',
    price: 29,
    period: 'month',
    features: [
      '50 AI Thumbnails/mo',
      'Basic Thumbnails',
      'Standard Resolution',
      'No Watermark',
      'Email Support',
    ],
    mostPopular: false,
  },
  {
    name: 'Pro',
    price: 79,
    period: 'month',
    features: [
      'Unlimited AI Thumbnails',
      'Premium Thumbnails',
      '4k Resolution',
      'Priority Support',
      'Custom Fonts',
      'Brand Kit Analysis',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    features: [
      'Everything in Pro',
      'API Access',
      'Team Collaboration',
      'Custom Branding',
      'Dedicated Account Manager',
    ],
    mostPopular: false,
  },
];
