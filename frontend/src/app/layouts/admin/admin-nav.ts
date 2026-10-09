export interface AdminNavItem {
  label: string;
  link: string;
  icon: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Utama',
    items: [
      {
        label: 'Dashboard',
        link: '/admin/dashboard',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    label: 'Data Master',
    items: [
      { label: 'Siswa', link: '/admin/siswa', icon: 'Users' },
      { label: 'Kelas', link: '/admin/kelas', icon: 'School' },
      {
        label: 'Tahun Ajaran',
        link: '/admin/tahun-ajaran',
        icon: 'CalendarRange',
      },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { label: 'Tagihan', link: '/admin/tagihan', icon: 'ReceiptText' },
      { label: 'Transaksi', link: '/admin/transaksi', icon: 'CreditCard' },
    ],
  },
];

export function adminPageTitle(url: string): string {
  const match = ADMIN_NAV_GROUPS.flatMap((group) => group.items).find((item) =>
    url.includes(item.link),
  );
  return match?.label ?? 'Administrasi';
}
