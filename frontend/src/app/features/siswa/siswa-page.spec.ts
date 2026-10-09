import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Kelas } from '../../core/kelas/kelas.model';
import { KelasService } from '../../core/kelas/kelas.service';
import {
  SiswaDetail,
  SiswaListItem,
  SiswaPayload,
} from '../../core/siswa/siswa.model';
import { SiswaService } from '../../core/siswa/siswa.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { SiswaPage } from './siswa-page';

const kelas: Kelas[] = [
  { id: 1, tingkat: 'X', jurusan: 'RPL', created_at: '', updated_at: '' },
];

const siswa: SiswaListItem[] = [
  {
    id: 1,
    nisn: '1234567890',
    nama: 'Budi',
    jenis_kelamin: 'L',
    alamat: 'Jl. Mawar No 1',
    no_hp: '081234567890',
    username: '1234567890',
    kelas_id: 1,
    tingkat: 'X',
    jurusan: 'RPL',
  },
];

const detail: SiswaDetail = { ...siswa[0], user_id: 9 };

interface Overrides {
  getList?: () => Observable<SiswaListItem[]>;
  create?: (payload: SiswaPayload) => Observable<SiswaDetail>;
  update?: (id: number, payload: SiswaPayload) => Observable<SiswaDetail>;
  remove?: (id: number) => Observable<null>;
  getKelas?: () => Observable<Kelas[]>;
}

function setup(overrides: Overrides = {}): ComponentFixture<SiswaPage> {
  TestBed.configureTestingModule({
    imports: [SiswaPage],
    providers: [
      {
        provide: SiswaService,
        useValue: {
          getList: overrides.getList ?? (() => of(siswa)),
          create:
            overrides.create ?? (() => of(detail)),
          update: overrides.update ?? (() => of(detail)),
          remove: overrides.remove ?? (() => of(null)),
        },
      },
      {
        provide: KelasService,
        useValue: { getList: overrides.getKelas ?? (() => of(kelas)) },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return TestBed.createComponent(SiswaPage);
}

function textOf(fixture: ComponentFixture<SiswaPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('SiswaPage', () => {
  it('renders students returned by the API', () => {
    const fixture = setup();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Budi');
    expect(text).toContain('1234567890');
    expect(text).toContain('X RPL');
  });

  it('shows a loading state before the data arrives', () => {
    const subject = new Subject<SiswaListItem[]>();
    const fixture = setup({ getList: () => subject.asObservable() });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Memuat data');

    subject.next(siswa);
    subject.complete();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Budi');
  });

  it('shows an empty state when there are no students', () => {
    const fixture = setup({ getList: () => of([]) });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Belum ada data siswa');
  });

  it('shows an Indonesian error state with a retry action', () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    const fixture = setup({ getList: () => throwError(() => error) });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Data siswa tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
  });

  it('blocks submit and surfaces validation errors for an empty form', () => {
    const createCalls: SiswaPayload[] = [];
    const fixture = setup({
      create: (payload) => {
        createCalls.push(payload);
        return of(detail);
      },
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openCreate();
    component.submit();
    fixture.detectChanges();

    expect(createCalls.length).toBe(0);
    expect(textOf(fixture)).toContain('Wajib diisi');
  });

  it('creates a student and shows a success message', () => {
    const createCalls: SiswaPayload[] = [];
    const fixture = setup({
      create: (payload) => {
        createCalls.push(payload);
        return of(detail);
      },
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openCreate();
    component.form.patchValue({
      nisn: '1234567890',
      nama: 'Ani',
      jenisKelamin: 'P',
      kelasId: 1,
      alamat: 'Jl. Melati No 2',
      noHp: '081234567891',
    });
    component.submit();
    fixture.detectChanges();

    expect(createCalls).toEqual([
      {
        kelasId: 1,
        nisn: '1234567890',
        nama: 'Ani',
        jenisKelamin: 'P',
        alamat: 'Jl. Melati No 2',
        noHp: '081234567891',
      },
    ]);
    expect(textOf(fixture)).toContain('Data siswa berhasil ditambahkan');
  });

  it('deletes a student after confirmation', () => {
    const removed: number[] = [];
    const fixture = setup({
      remove: (id) => {
        removed.push(id);
        return of(null);
      },
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.confirmDelete(siswa[0]);
    component.remove();
    fixture.detectChanges();

    expect(removed).toEqual([1]);
    expect(textOf(fixture)).toContain('berhasil dihapus');
  });

  it('filters the list with the search box and reports the count', () => {
    const fixture = setup();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.onSearch({ target: { value: 'budi' } } as unknown as Event);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Budi');
    expect(textOf(fixture)).toContain('Menampilkan 1 dari 1 siswa');
  });

  it('shows a distinct empty state when the search has no matches', () => {
    const fixture = setup();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.onSearch({ target: { value: 'tidak-ada' } } as unknown as Event);
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Siswa tidak ditemukan');
    expect(text).toContain('Hapus pencarian');
    expect(text).not.toContain('Belum ada data siswa');
  });

  it('shows the API message when create fails', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'NISN sudah terdaftar' },
    });
    const fixture = setup({ create: () => throwError(() => error) });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openCreate();
    component.form.patchValue({
      nisn: '1234567890',
      nama: 'Ani',
      jenisKelamin: 'P',
      kelasId: 1,
      alamat: 'Jl. Melati No 2',
      noHp: '081234567891',
    });
    component.submit();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('NISN sudah terdaftar');
  });

  it('updates a student in edit mode using the selected row', () => {
    const updateCalls: Array<{ id: number; payload: SiswaPayload }> = [];
    const fixture = setup({
      update: (id, payload) => {
        updateCalls.push({ id, payload });
        return of(detail);
      },
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openEdit(siswa[0]);
    fixture.detectChanges();

    expect(component.form.controls.nama.value).toBe('Budi');

    component.form.patchValue({ nama: 'Budi Santoso' });
    component.submit();
    fixture.detectChanges();

    expect(updateCalls.length).toBe(1);
    expect(updateCalls[0].id).toBe(1);
    expect(updateCalls[0].payload.nama).toBe('Budi Santoso');
    expect(textOf(fixture)).toContain('Data siswa berhasil diperbarui');
  });

  it('shows the API message when update fails', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { message: 'NISN sudah terdaftar' },
    });
    const fixture = setup({ update: () => throwError(() => error) });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openEdit(siswa[0]);
    component.submit();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('NISN sudah terdaftar');
  });

  it('requires confirmation before deleting', () => {
    const removed: number[] = [];
    const fixture = setup({
      remove: (id) => {
        removed.push(id);
        return of(null);
      },
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.confirmDelete(siswa[0]);
    fixture.detectChanges();

    expect(component.deleteTarget()).not.toBeNull();
    expect(removed.length).toBe(0);

    component.cancelDelete();
    fixture.detectChanges();

    expect(component.deleteTarget()).toBeNull();
    expect(removed.length).toBe(0);
  });

  it('shows a relation-constraint message when delete is rejected', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { message: 'foreign key constraint fails' },
    });
    const fixture = setup({ remove: () => throwError(() => error) });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.confirmDelete(siswa[0]);
    component.remove();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('masih memiliki data terkait');
  });
});
