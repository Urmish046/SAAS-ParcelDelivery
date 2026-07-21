import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { IStorageService } from './storage.interface';
import 'multer';

@Injectable()
export class MinioService implements IStorageService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') as string;
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') as string,
      port: parseInt(this.configService.get<string>('MINIO_PORT') as string, 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') as string,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') as string,
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'parcels'): Promise<string> {
    const extension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${extension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
      return fileName;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${fileName}`, (error as Error).stack);
      throw new InternalServerErrorException('File upload failed');
    }
  }
  
  async getFileUrl(fileName: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, fileName, 3600);
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for: ${fileName}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileName}`, (error as Error).stack);
      throw new InternalServerErrorException('File deletion failed');
    }
  }
}