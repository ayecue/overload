# overload

[![overload](https://circleci.com/gh/ayecue/overload.svg?style=svg)](https://circleci.com/gh/ayecue/overload)

Pseudo overload via decorators.

## Installation

```sh
npm install --save pseudo-overload
```

## Example

```ts
import { z } from 'zod';
import { OverloadConstructor, Overload } from 'pseudo-overload';

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
}
```