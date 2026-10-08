import fsPromises from "fs/promises";
import { env } from "next-runtime-env";
import path from "path";
const dirPath = path.join(process.cwd(), "public");

export async function fileExists(fileName: string) {
  try {
    const dataFilePath = path.join(dirPath, fileName);
    await fsPromises.access(dataFilePath);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

export async function readFile(fileName: string) {
  try {
    const isFileExists = await fileExists(fileName);
    if (!isFileExists) {
      return null;
    }
    const dataFilePath = path.join(dirPath, fileName);
    const data = await fsPromises.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[Error][readFile] :", error);
    return null;
  }
}

export async function writeFile<T>(data: T, fileName: string) {
  try {
    const updatedData = JSON.stringify(data);
    const dataFilePath = path.join(dirPath, fileName);
    await fsPromises.mkdir(dirPath, { recursive: true });
    await fsPromises.writeFile(dataFilePath, updatedData);
  } catch (error) {
    console.error("[Error][writeFile] :", error);
  }
}

export const renderMedia = (path: string) => `${env("NEXT_PUBLIC_MEDIA_DOMAIN") || process.env.MEDIA_DOMAIN}${path}`;
