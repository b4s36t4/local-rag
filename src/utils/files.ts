let rootHandle: FileSystemDirectoryHandle;

const getRootOPFS = async () => {
  rootHandle = await navigator.storage.getDirectory();
  return rootHandle;
};

const getOrCreateFolder = async (directory: string) => {
  if (!rootHandle) {
    await getRootOPFS();
  }

  try {
    const folderExists = await rootHandle.getDirectoryHandle(directory);
    if (folderExists) {
      return folderExists;
    }
  } catch {}

  const newFolder = await rootHandle.getDirectoryHandle(directory, {
    create: true,
  });

  return newFolder;
};

const createFile = async (
  handle: FileSystemDirectoryHandle,
  file: string,
  data: File | Blob
) => {
  if (!rootHandle) {
    await getRootOPFS();
  }
  const fileHandle = await handle.getFileHandle(file, { create: true });
  const writeable = await fileHandle.createWritable({
    keepExistingData: false,
  });

  await writeable.write(data);
  await writeable.close();
  return true;
};

const getFiles = async (folder: string) => {
  if (!rootHandle) {
    await getRootOPFS();
  }
  try {
    const handle = await rootHandle.getDirectoryHandle(folder);
    if (!handle) {
      return [];
    }

    const files: File[] = [];

    for await (let fileHandle of (handle as any).values()) {
      files.push(await fileHandle.getFile());
    }

    return files;
  } catch {
    return [];
  }
};

export { getFiles, getOrCreateFolder, createFile };
