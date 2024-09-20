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

  foo(str: number): string;
  foo(str: string): string;
  @Overload<MyTestClass, string>([
    [[z.string()], function (str: string) {
      return `A String ${str}`;
    }],
  ])
  foo(...args: any[]): any { }

  bar(str: string, num?: number): string;
  @Overload<MyTestClass, string>([
    [[z.string(), z.number()], function (str: string, num: number) {
      return `A String ${str} And A Number ${num}`;
    }],
    [[z.string()], function (str: string) {
      return `A String ${str}`;
    }],
  ])
  bar(...args: any[]): any { }
}