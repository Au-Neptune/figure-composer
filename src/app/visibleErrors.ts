export async function runWithVisibleError<T>(
  action: () => Promise<T>,
  setErrorMessage: (message: string | null) => void,
): Promise<T> {
  try {
    setErrorMessage(null);
    return await action();
  } catch (error) {
    setErrorMessage(readErrorMessage(error));
    throw error;
  }
}

export function runWithVisibleCommand(
  action: () => void,
  setErrorMessage: (message: string | null) => void,
): boolean {
  try {
    setErrorMessage(null);
    action();
    return true;
  } catch (error) {
    setErrorMessage(readErrorMessage(error));
    return false;
  }
}

export async function runWithVisibleAsyncCommand(
  action: () => Promise<void>,
  setErrorMessage: (message: string | null) => void,
): Promise<boolean> {
  try {
    setErrorMessage(null);
    await action();
    return true;
  } catch (error) {
    setErrorMessage(readErrorMessage(error));
    return false;
  }
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
