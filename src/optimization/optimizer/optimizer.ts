export type OptimizationResult = {
  downloadUrl: string,
  originalSize: number,
  optimizedSize: number,
};

export interface Optimizer {
  optimize(file: File): Promise<OptimizationResult>
}
