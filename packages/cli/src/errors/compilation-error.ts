export default class CompilationError extends Error {
  constructor(
    public message: string,
    public file: string,
  ) {
    super(message);
  }
}
