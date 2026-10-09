import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChart, BarChartBar } from './bar-chart';

const bars: BarChartBar[] = [
  { label: 'Lunas', value: 1, barClass: 'bg-green-600' },
  { label: 'Belum Lunas', value: 3, barClass: 'bg-amber-700' },
];

function setup(
  inputBars: BarChartBar[] = bars,
  ariaLabel = 'Diagram batang status tagihan',
): ComponentFixture<BarChart> {
  TestBed.configureTestingModule({ imports: [BarChart] });
  const fixture = TestBed.createComponent(BarChart);
  fixture.componentRef.setInput('bars', inputBars);
  fixture.componentRef.setInput('ariaLabel', ariaLabel);
  fixture.detectChanges();
  return fixture;
}

describe('BarChart', () => {
  it('renders values and category labels', () => {
    const fixture = setup();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Lunas');
    expect(text).toContain('Belum Lunas');
    expect(text).toContain('1');
    expect(text).toContain('3');
  });

  it('exposes the provided accessible label', () => {
    const fixture = setup(bars, 'Lunas 1, belum lunas 3 dari 4 tagihan');
    const element = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="img"]',
    );

    expect(element?.getAttribute('aria-label')).toBe(
      'Lunas 1, belum lunas 3 dari 4 tagihan',
    );
  });

  it('renders nothing when all values are zero', () => {
    const fixture = setup([
      { label: 'Lunas', value: 0, barClass: 'bg-green-600' },
      { label: 'Belum Lunas', value: 0, barClass: 'bg-amber-700' },
    ]);

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="img"]'),
    ).toBeNull();
  });
});
