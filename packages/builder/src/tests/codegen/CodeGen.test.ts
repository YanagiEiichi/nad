import { CodeGen } from '../../codegen';

test('write with a number', () => {
  const gen = new CodeGen();
  expect(() => {
    gen.write(1 as unknown as string);
  }).toThrow(TypeError);
});

test('write with empty', () => {
  const gen = new CodeGen();
  gen.write('line 1');
  gen.write(undefined);
  gen.write(null);
  gen.write('line 2');
  gen.write('');
  gen.write('line 3');
  const answer = ['line 1', 'line 2', '', 'line 3'].join('\n');
  expect(gen.toString()).toBe(answer);
});

test('writeComment with a number', () => {
  const gen = new CodeGen();
  expect(() => {
    gen.writeComment(1 as unknown as () => void);
  }).toThrow(TypeError);
});

test('write with multiple lines', () => {
  const gen = new CodeGen();
  gen.write('line 1\nline 2\r\nline 3\rline 4');
  const answer = ['line 1', 'line 2', 'line 3', 'line 4'].join('\n');
  expect(gen.toString()).toBe(answer);
});
