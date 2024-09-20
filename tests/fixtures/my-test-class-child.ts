import { z } from 'zod';
import { Overload } from '../../dist';
import { MyTestClass } from './my-test-class';

export class MyTestClassChild extends MyTestClass {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args);
  }

  foo(str: number): void;
  foo(str: string): void;
  @Overload<MyTestClassChild, void>([
    [[z.number()], function (num: number) {
      return `A Number ${num}`;
    }],
  ])
  foo(...args: any[]): void { }
}