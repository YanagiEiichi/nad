import { DeepPartial } from '../../utils';
import { Builder } from '../../Builder';
import { NadClass, NadRoute } from '../../types/nad';
import { paginitionDefs } from '../defs/paginitionTestDefs';

test('Paginition', () => {
  const code = new Builder({ target: 'oc', base: '', defs: paginitionDefs }).code;
  expect(code).toContain(`- (MetaPaginition<NSArray<NSNumber*>*>*)foo;`);
  expect(code).toMatchCode(`
    @interface Paginition<T> : NSObject
    @property (nonatomic, assign) T data;
    @property (nonatomic, assign) NSNumber *limit;
    @property (nonatomic, assign) NSNumber *offset;
    @end
  `);
  expect(code).toMatchCode(`
    @interface MetaPaginition<T> : Paginition<T>
    @property (nonatomic, assign) NSObject *meta;
    @end
  `);
});

test('return void', () => {
  const routes: Partial<NadRoute>[] = [{ bean: 'test.FooModule', name: 'foo', returnType: 'void' }];
  const code = new Builder({ target: 'oc', base: '', defs: { routes } }).code;
  expect(code).toContain('- (void)foo;');
});

test('void as the generic parameter', () => {
  const routes: Partial<NadRoute>[] = [{ bean: 'test.FooModule', name: 'foo', returnType: 'test.A<java.lang.Void>' }];
  const classes: DeepPartial<NadClass>[] = [
    { name: 'test.A', typeParameters: ['T'], members: [{ name: 'data', type: 'T' }] },
  ];
  const code = new Builder({ target: 'oc', base: '', defs: { routes, classes } }).code;
  expect(code).toContain('- (A<NSObject*>*)foo;');
});

test('extending order', () => {
  const routes: DeepPartial<NadRoute>[] = [
    {
      bean: 'test.FooModule',
      name: 'foo',
      parameters: [
        { name: 'a0', type: 'test.D' },
        { name: 'a1', type: 'test.C' },
        { name: 'a2', type: 'test.A' },
        { name: 'a3', type: 'test.B' },
      ],
    },
  ];
  const classes: Partial<NadClass>[] = [
    { name: 'test.A', superclass: 'test.B' },
    { name: 'test.B', superclass: 'test.C' },
    { name: 'test.C' },
    { name: 'test.D' },
  ];
  const code = new Builder({ target: 'oc', base: '', defs: { routes, classes } }).code;

  expect(code).toMatchCode(`
    /**
     * D
     * @JavaClass test.D
     */
    @interface D : NSObject
    @end

    /**
     * C
     * @JavaClass test.C
     */
    @interface C : NSObject
    @end
   
    /**
     * B
     * @JavaClass test.B
     */
    @interface B : C
    @end

    /**
     * A
     * @JavaClass test.A
     */
    @interface A : B
    @end
  `);
});

test('preserved keyword property name', () => {
  const routes: DeepPartial<NadRoute>[] = [{ bean: 'test.Foo', name: 'foo', returnType: 'test.A' }];
  const classes: DeepPartial<NadClass>[] = [{ name: 'test.A', members: [{ name: 'default' }] }];
  const code = new Builder({ target: 'oc', base: '', defs: { routes, classes } }).code;

  expect(code).toMatchCode(`
    @interface A : NSObject
    @property (nonatomic, assign) NSObject *_default;
    @end
  `);
});

test('chaining extending', () => {
  const routes: DeepPartial<NadRoute>[] = [{ bean: 'test.Foo', name: 'foo', returnType: 'test.A' }];
  const classes: DeepPartial<NadClass>[] = [
    { name: 'test.A', superclass: 'test.B' },
    { name: 'test.C' },
    { name: 'test.B', superclass: 'test.C' },
  ];
  const code = new Builder({ target: 'oc', base: '', defs: { routes, classes } }).code;

  expect(code).toMatchCode(`
    /**
     * C
     * @JavaClass test.C
     */
    @interface C : NSObject
    @end

    /**
     * B
     * @JavaClass test.B
     */
    @interface B : C
    @end

    /**
     * A
     * @JavaClass test.A
     */
    @interface A : B
    @end
  `);
});
