import 'multer';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
  getFileUrl(fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}