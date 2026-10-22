import { PurchasePlan } from '../types';

export const GEM_PACKS: PurchasePlan[] = [
  {
    id: 'gems-100',
    name: '100 Gems',
    type: 'gems',
    amount: 100,
    priceUsd: 1.99,
    features: [
      'Refill streak freeze shields',
      'Unlock accelerated diagnostic tests',
      'Instant lesson boost'
    ],
  },
  {
    id: 'gems-500',
    name: '500 Gems',
    type: 'gems',
    amount: 500,
    priceUsd: 3.99,
    badge: 'Popular Choice',
    features: [
      '5x Streak Protection shields',
      'Access to Grand Arena challenge wagers',
      'Unlock custom neural soundscapes'
    ],
  },
  {
    id: 'gems-2000',
    name: '2,000 Gems',
    type: 'gems',
    amount: 2000,
    priceUsd: 9.99,
    badge: 'Best Value',
    features: [
      'Unlimited streak recovery for 30 days',
      'VIP Polyglot badge & custom accent morphing',
      'Full access to all Arena bonus challenges'
    ],
  },
];

export const SUBSCRIPTION_PLANS: PurchasePlan[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    type: 'subscription',
    duration: '1 Month',
    priceUsd: 4.99,
    badge: 'Core Tools',
    features: [
      'Full access to AI Translator & 16kHz Streaming',
      'CEFR Path Curriculum (A1 to C2 Mastery)',
      'Grammar Engine & Syntactic Tree Deconstruction',
      'Daily Immersion Metrics & Spaced Practice'
    ],
  },
  {
    id: 'pro-plus',
    name: 'Pro Plus',
    type: 'subscription',
    duration: '1 Month',
    priceUsd: 9.99,
    badge: 'Voice & Acoustic',
    features: [
      'Everything included in Pro Monthly',
      'Unlimited AI Polyglot Tutor Voice Conversations',
      'Real-Time Acoustic Cadence & Accent Coaching',
      'Custom Neural Voice Persona Modeling'
    ],
  },
  {
    id: 'pro-1year',
    name: 'Pro Annual Mastery',
    type: 'subscription',
    duration: '1 Year',
    priceUsd: 39.99,
    badge: 'Most Popular / Best Value',
    features: [
      'Everything in Pro Plus for an entire year ($3.33/mo)',
      'Unrestricted C1/C2 Advanced Academic & Debate Tiers',
      'Permanent Streak Shields & Concept Memory Vault',
      'Dedicated Polyglot Mastery Accreditation'
    ],
  },
];
