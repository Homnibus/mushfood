import { NoDecimalPipe } from './no-decimal.pipe';

describe('NoDecimalPipe', () => {
  it('create an instance', () => {
    const pipe = new NoDecimalPipe();
    expect(pipe).toBeTruthy();
  });
});
