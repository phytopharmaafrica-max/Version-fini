export function reportLovableError(error: any, context?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Phytocare Error Boundary]", error, context);
  }
}
