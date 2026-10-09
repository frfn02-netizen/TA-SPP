export interface StudentNavItem {
  label: string;
  shortLabel: string;
  link: string;
  icon: string;
  exact: boolean;
}

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  {
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    link: '/siswa',
    icon: 'LayoutDashboard',
    exact: true,
  },
  {
    label: 'Tagihan SPP',
    shortLabel: 'Tagihan',
    link: '/siswa/tagihan',
    icon: 'ReceiptText',
    exact: false,
  },
  {
    label: 'Riwayat Pembayaran',
    shortLabel: 'Riwayat',
    link: '/siswa/riwayat',
    icon: 'History',
    exact: false,
  },
];
