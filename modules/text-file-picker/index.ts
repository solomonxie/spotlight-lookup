import NativeTextFilePicker from './src/NativeTextFilePicker';

export type PickedTextFile = {
  name: string;
  text: string;
};

/** Null when the user dismissed the picker. */
export async function pickTextFile(): Promise<PickedTextFile | null> {
  const picked = await NativeTextFilePicker.pickTextFile();
  return (picked as PickedTextFile | null) ?? null;
}
