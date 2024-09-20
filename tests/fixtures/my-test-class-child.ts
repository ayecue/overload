import { z } from 'zod';
import { Overload } from '../../dist';
import { MyTestClass } from './my-test-class';

export class MyTestClassChild extends MyTestClass {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args);
  }

  foo(str: number): string;
  foo(str: string): string;
  @Overload<MyTestClassChild, void>(
    [[z.number()], function (num: number) {
      return `A Number ${num}`;
    }],
  )
  foo(...args: any[]): any { }
}