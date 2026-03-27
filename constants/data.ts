export const AREAS = [
  'Portrush',
  'Portstewart',
  'Coleraine',
  'Bushmills',
  'Ballycastle',
  'Ballymoney',
  'Limavady',
  'Moyle',
  'Cushendall',
  'Cushendun',
  'Other (Causeway Coast & Glens)',
];

export const JOB_CATEGORIES = [
  'General Repairs',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting & Decorating',
  'Flat Pack Assembly',
  'Garden & Outdoor',
  'Christmas Jobs',
  'Tiling',
  'Flooring',
  'Gutters & Roofing',
  'Garage Clearance',
  'Other',
];

export const TIMING_OPTIONS = [
  'Urgent (24-48 hours)',
  'This Week',
  'Next Week',
  'Flexible',
  'Christmas',
];

export const GARAGE_TIMING_OPTIONS = [
  'Urgent (24-48 hours)',
  'This Week',
  'Next Week',
  'Flexible / Anytime',
];

export const CATEGORY_ICONS: Record<string, string> = {
  'General Repairs': 'hammer',
  'Plumbing': 'water',
  'Electrical': 'flash',
  'Carpentry': 'construct',
  'Painting & Decorating': 'color-palette',
  'Flat Pack Assembly': 'cube',
  'Garden & Outdoor': 'leaf',
  'Christmas Jobs': 'snow',
  'Tiling': 'grid',
  'Flooring': 'layers',
  'Gutters & Roofing': 'home',
  'Garage Clearance': 'car',
  'Other': 'ellipsis-horizontal',
};

export const TEST_USERS = {
  tradie: {
    id: 'c48dfb55-3283-4d07-b56e-26638b060118',
    email: 'john@weejobs.test',
    password: 'password123',
    name: 'John',
    role: 'tradesperson' as const,
    phone: '07700900001',
    area: 'Portrush',
    trade_categories: ['General Repairs', 'Plumbing', 'Carpentry'],
  },
  customer: {
    id: '319eaecb-1bfb-4800-8f3a-6a919cfc3c59',
    email: 'sarah@weejobs.test',
    password: 'password123',
    name: 'Sarah',
    role: 'customer' as const,
    phone: '07700900002',
    area: 'Coleraine',
    trade_categories: undefined,
  },
  admin: {
    id: 'e182a70a-6f1b-4083-8cf5-7c5133489993',
    email: 'admin@weejobs.test',
    password: 'password123',
    name: 'Admin',
    role: 'admin' as const,
    phone: '07700900003',
    area: 'Coleraine',
    trade_categories: undefined,
  },
};
