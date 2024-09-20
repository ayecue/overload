import { z } from 'zod';

export type OverloadFn<Context, ReturnType> = (this: Context, ...args: any[]) => ReturnType;
export type OverloadArgs<Context = any, ReturnType = any> = [z.ZodTypeAny[], OverloadFn<Context, ReturnType>][];

type SignatureNameGetter = (instance: any) => string;

const isNonEmptyTuple = (item: z.ZodTypeAny[]): item is [z.ZodTypeAny, ...z.ZodTypeAny[]] => {
  return item.length > 0;
};

function generateOverloadArgMapping<Context, ReturnType>(overloadArgs: OverloadArgs<Context, ReturnType>) {
  return overloadArgs.reduce<Record<number, [z.AnyZodTuple, OverloadFn<Context, ReturnType>][]>>((acc, [args, fn]) => {
    const size = args.length;
    const tuple = isNonEmptyTuple(args) ? z.tuple(args) : z.tuple([]);
    if (!acc[size]) acc[size] = [];
    acc[size].push([tuple, fn]);
    return acc;
  }, {});
}

function transformArgToString(arg: any): string {
  const type = typeof arg;
  if (type === 'object') return arg === null ? 'null' : arg.constructor.name;
  return type;
}

export function createOverload<Context = any, ReturnType = any>(signatureNameGetter: SignatureNameGetter, ...overloadArgs: OverloadArgs<Context, ReturnType>): (...args: any[]) => ReturnType {
  const overloadArgMapping = generateOverloadArgMapping<Context, ReturnType>(overloadArgs);

  return function (this: Context, ...args: any[]): ReturnType {
    const overloadsWithMatchingSize = overloadArgMapping[args.length];
    if (overloadsWithMatchingSize !== undefined) {
      for (let index = 0; index < overloadsWithMatchingSize.length; index++) {
        const [tuple, fn] = overloadsWithMatchingSize[index];
        const result = tuple.safeParse(args);
        if (result.success) {
          return fn.apply(this, args);
        }
      }
    }
    throw new TypeError(`Cannot find matching signature ${signatureNameGetter(this)}(${args.map((item) => transformArgToString(item)).join(', ')})`);
  };
}

export function OverloadConstructor<Context = any, ReturnType = any>(...overloadArgs: OverloadArgs<Context, ReturnType>) {
  return function <T extends new (...args: any[]) => {}>(constructor: T): any {
    const sigGetter: SignatureNameGetter = (_instance) => `${constructor.name}.constructor`;
    const overloadFn = createOverload(sigGetter, ...overloadArgs);
    const newClass = class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        overloadFn.apply(this, args);
      }
    }

    Object.defineProperty(newClass, 'name', { value: constructor.name });

    return newClass;
  };
}

export function Overload<Context = any, ReturnType = any>(...overloadArgs: OverloadArgs<Context, ReturnType>) {
  return function (
    target: (...args: any[]) => any,
    context: ClassMethodDecoratorContext<ThisParameterType<Context>, any>
  ) {
    const propertyName = context.name.toString();
    const sigGetter: SignatureNameGetter = (instance) => `${instance?.constructor.name ?? 'unknown'}.${propertyName}`;
    return createOverload(sigGetter, ...overloadArgs);
  };
}