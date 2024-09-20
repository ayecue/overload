import { z } from 'zod';
import { OverloadConstructor, Overload } from '../../dist';

@OverloadConstructor<MyTestClass>([
  [[z.string(), z.number()], function (str: string, num: number) {
    this.propertyA = `${str} - ${num}`;
    this.propertyB = 'empty';
  }],
  [[], function () {
    this.propertyA = 'empty';
    this.propertyB = 'provided no params'
  }]
])
export class MyTestClass {
  propertyA: string;
  propertyB: string;

  constructor();
  constructor(str: number, num: string);
  constructor(str: string, num: number);
  constructor(...args: any[]) { }

  foo(str: number): void;
  foo(str: string): void;
  @Overload<MyTestClass, void>([
    [[z.string()], function (str: string) {
      return `A String ${str}`;
    }],
  ])
  foo(...args: any[]): void { }

  bar(str: string, num?: number): void;
  @Overload<MyTestClass, void>([
    [[z.string(), z.number()], function (str: string, num: number) {
      return `A String ${str} And A Number ${num}`;
    }],
    [[z.string()], function (str: string) {
      return `A String ${str}`;
    }],
  ])
  bar(...args: any[]): void { }
}