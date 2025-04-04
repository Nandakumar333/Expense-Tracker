export abstract class BaseRepository<T> {
  protected storageKey: string;

  constructor(key: string) {
    this.storageKey = key;
  }

  protected getAll(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  protected save(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
