import { z } from 'zod';

export type OverloadFn<Context, ReturnType> = (this: Context, ...args: any[]) => ReturnType;
export type OverloadArgs<Context = any, ReturnType = any> = [z.ZodTypeAny[], OverloadFn<Context, ReturnType>][];

type IdGetter = () => string;

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

export function createOverload<Context = any, ReturnType = any>(id: IdGetter, ...overloadArgs: OverloadArgs<Context, ReturnType>): (...args: any[]) => ReturnType {
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
    throw new TypeError(`Cannot find signature [${args.map((item) => Array.prototype.toString.call(item)).join(', ')}] in ${id()}`);
  };
}

export function OverloadConstructor<Context = any, ReturnType = any>(overloadArgs: OverloadArgs<Context, ReturnType>) {
  return function <T extends new (...args: any[]) => {}>(constructor: T): any {
    const id = `${constructor.name}.constructor`;
    const overloadFn = createOverload(() => id, ...overloadArgs);
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

export function Overload<Context = any, ReturnType = any>(overloadArgs: OverloadArgs<Context, ReturnType>) {
  return function (
    target: (...args: any[]) => any,
    context: ClassMethodDecoratorContext<ThisParameterType<Context>, any>
  ) {
    let className = 'unknown';
    const propertyName = context.name.toString();
    context.addInitializer(function () {
      className = this.constructor.name;
    });
    return createOverload(() => `${className}.${propertyName}`, ...overloadArgs);
  };
}