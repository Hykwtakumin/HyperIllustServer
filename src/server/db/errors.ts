export class DocumentNotFoundError extends Error {
  constructor() {
    super("Document is not found.");
    this.name = "DocumentNotFoundError";
  }
}
