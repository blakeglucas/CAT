export async function sleepAsync(timeMillis: number) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, timeMillis);
  });
}
