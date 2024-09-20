import { MyTestClass } from './fixtures/my-test-class';
import { MyTestClassChild } from './fixtures/my-test-class-child';

describe('overload', () => {
  describe('base', () => {
    describe('constructor', () => {
      test('should use first signature', () => {
        const instance = new MyTestClass('test', 123);
        expect(instance.propertyA).toEqual('test - 123');
        expect(instance.propertyB).toEqual('empty');
      });

      test('should use second signature', () => {
        const instance = new MyTestClass();
        expect(instance.propertyA).toEqual('empty');
        expect(instance.propertyB).toEqual('provided no params');
      });

      test('should throw due to invalid signature', () => {
        expect(() => new MyTestClass(123, 'test')).toThrow(TypeError);
      });
    });

    describe('method', () => {
      let instance: MyTestClass | null = null;

      beforeEach(() => {
        instance = new MyTestClass('test', 123);
      });

      afterEach(() => {
        instance = null;
      });

      test('should use first signature', () => {
        const result = instance!.foo('abc');
        expect(result).toEqual('A String abc');
      });

      test('should throw due to invalid signature', () => {
        expect(() => instance!.foo(123)).toThrow(TypeError);
      });

      test('should use signature and respect optional arg', () => {
        expect(instance!.bar('abc')).toEqual('A String abc');
        expect(instance!.bar('abc', 123)).toEqual('A String abc And A Number 123');
      });
    });
  });

  describe('child', () => {
    describe('constructor', () => {
      test('should use first signature', () => {
        const instance = new MyTestClassChild('test', 123);
        expect(instance.propertyA).toEqual('test - 123');
        expect(instance.propertyB).toEqual('empty');
      });

      test('should use second signature', () => {
        const instance = new MyTestClassChild();
        expect(instance.propertyA).toEqual('empty');
        expect(instance.propertyB).toEqual('provided no params');
      });

      test('should throw due to invalid signature', () => {
        expect(() => new MyTestClassChild(123, 'test')).toThrow(TypeError);
      });
    });

    describe('method', () => {
      let instance: MyTestClassChild | null = null;

      beforeEach(() => {
        instance = new MyTestClassChild('test', 123);
      });

      afterEach(() => {
        instance = null;
      });

      test('should use first signature', () => {
        const result = instance!.foo(123);
        expect(result).toEqual('A Number 123');
      });

      test('should throw due to invalid signature', () => {
        expect(() => instance!.foo('test')).toThrow(TypeError);
      });
    });
  });
})