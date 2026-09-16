import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function createServerFn(options?: { method?: string }) {
  let _validator: ((input: any) => any) | null = null;
  let _middlewares: any[] = [];

  const builder = {
    middleware(middlewares: any[]) {
      _middlewares = middlewares;
      return builder;
    },
    inputValidator(validator: (input: any) => any) {
      _validator = validator;
      return builder;
    },
    handler<R>(fn: (args: { data: any; context: any }) => Promise<R> | R) {
      const callable = async (args?: { data?: any }) => {
        const rawData = args?.data !== undefined ? args.data : args;
        const validData = _validator ? _validator(rawData) : rawData;

        let context: any = {};
        for (const mw of _middlewares) {
          if (typeof mw === "function") {
            try {
              const res = await mw();
              if (res && typeof res === "object") {
                context = { ...context, ...res };
              }
            } catch {
              // fallback
            }
          }
        }

        if (!context.userId) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
              context.userId = data.session.user.id;
              context.user = data.session.user;
            }
          } catch {
            // fallback
          }
        }

        return fn({ data: validData, context });
      };

      (callable as any).handler = fn;
      (callable as any).isServerFn = true;
      return callable;
    },
  };

  return builder;
}

export function useServerFn<T extends (...args: any[]) => any>(fn: T) {
  return useCallback(async (args?: any) => {
    if (typeof fn === "function") {
      return fn(args);
    }
    return null;
  }, [fn]);
}

export function createMiddleware(_opts?: any) {
  const mwBuilder = {
    server: (fn: any) => fn,
    client: (fn: any) => fn,
  };
  return mwBuilder;
}

export function createStart() {
  return {};
}

export function getRequest() {
  return typeof Request !== "undefined" ? new Request(window.location.href) : null;
}
