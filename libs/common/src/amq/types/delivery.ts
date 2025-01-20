export interface AckAmq {
  accept: () => {};
  release: () => {};
  reject: () => {};
}
