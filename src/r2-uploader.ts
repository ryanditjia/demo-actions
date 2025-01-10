import { readFile } from 'fs/promises'
import { join } from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { Compression } from './types'

const getContentType = (filename: string) => {
  if (filename.endsWith('.loader.js')) return 'application/javascript'
  if (filename.endsWith('.framework.js.br')) return 'application/javascript'
  if (filename.endsWith('.wasm.br')) return 'application/wasm'
  if (filename.endsWith('.data.br')) return 'text/plain'
  throw new Error(`Unsupported file type for ${filename}`)
}

export class R2Uploader {
  private r2Bucket: string
  private r2DestinationDir: string
  private webGLBuildDir: string
  private client: S3Client
  private compression: Compression

  constructor({
    r2AccessKey,
    r2SecretKey,
    r2AccountId,
    r2Bucket,
    r2DestinationDir,
    webGLBuildDir,
    compression,
  }: {
    r2AccessKey: string
    r2SecretKey: string
    r2AccountId: string
    r2Bucket: string
    r2DestinationDir: string
    webGLBuildDir: string
    compression: Compression
  }) {
    this.r2Bucket = r2Bucket
    this.r2DestinationDir = r2DestinationDir
    this.webGLBuildDir = webGLBuildDir
    this.compression = compression

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    })
  }

  async upload(filename: string) {
    const pathToFile = join(this.webGLBuildDir, filename)
    const file = await readFile(pathToFile)

    const command = new PutObjectCommand({
      Bucket: this.r2Bucket,
      Key: `${this.r2DestinationDir}/${filename}`,
      Body: file,
      ContentType: getContentType(filename),
    })

    if (this.compression === 'brotli') {
      command.input.ContentEncoding = 'br'
    } else if (this.compression === 'gzip') {
      command.input.ContentEncoding = 'gzip'
    }

    const response = await this.client.send(command)
    console.log(response)
  }
}

module.exports = { R2Uploader }
