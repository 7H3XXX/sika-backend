import { Inject, Injectable, Logger } from '@nestjs/common';
import { MEDIA_EXTENSIONS, MINIO_OPTIONS_TOKEN } from './minio.constants';
import * as Minio from 'minio';
import { dataUriToBuffer } from 'data-uri-to-buffer';
import { Readable } from 'stream';
import { randomBytes } from 'crypto';
import { MinioImage, MinioModuleOptions } from './minio.interface';
import { cleanUpFileName } from './minio.utils';

@Injectable()
export class MinioService {
  private readonly client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);

  constructor(
    @Inject(MINIO_OPTIONS_TOKEN) private readonly options: MinioModuleOptions,
  ) {
    this.client = new Minio.Client({
      endPoint: options.endPoint,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
      port: options.port ?? 9000,
      useSSL: options.useSSL ?? true,
    });
    this.createBucket(options.bucketName, options.region ?? 'us-east-1')
      .then((resp) => {
        if (resp) {
          this.logger.debug(
            `>>> Bucket '${options.bucketName}' created successfully.`,
          );
        } else {
          this.logger.debug(
            `>>> Bucket '${options.bucketName}' already exists, skipping.`,
          );
        }
      })
      .catch((reason: any) => {
        this.logger.error(reason);
      });
  }

  // Bucket Operations
  async createBucket(
    bucketName: string,
    region?: string,
    options?: { policy: string },
  ) {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName, region);
    }
    const bucketPolicy =
      options?.policy ??
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      });
    await this.client.setBucketPolicy(bucketName, bucketPolicy);
    return !exists;
  }

  // Object Operations
  async putDataUri(
    dataUri: string,
    objectName?: string,
    bucketName?: string,
    expires?: number,
  ): Promise<MinioImage> {
    if (!dataUri)
      throw new Error(
        `The 'dataUri' parameter is required and cannot be undefined. Please provide a valid data URI string to upload.`,
      );
    const buffer = dataUriToBuffer(dataUri);
    const dataStream = new Readable();
    dataStream.push(Buffer.from(buffer.buffer));
    dataStream.push(null);

    // set nullable params
    const fileEx = MEDIA_EXTENSIONS[buffer.type] || undefined;
    objectName = cleanUpFileName(
      objectName ?? `blob_${randomBytes(6).toString('hex')}`,
    );
    bucketName = bucketName ?? this.options.bucketName;
    if (fileEx && !objectName.endsWith(fileEx)) {
      objectName += fileEx;
    }

    const putResp = await this.client.putObject(
      bucketName,
      objectName,
      dataStream,
      buffer.buffer.byteLength,
      { 'Content-Type': buffer.type },
    );
    const signedUrl = await this.client.presignedGetObject(
      bucketName,
      objectName,
      expires,
    );
    const [baseUrl, params] = signedUrl.split('?');
    const signedData = new URLSearchParams(params);
    return MinioImage.parse({
      baseUrl,
      signedUrl,
      ...putResp,
      ...Object.fromEntries(signedData.entries()),
    });
  }
}
