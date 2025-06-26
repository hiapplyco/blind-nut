
export interface Tool<T, U> {
  name: string;
  description: string;
  execute(input: T): Promise<U>;
}
