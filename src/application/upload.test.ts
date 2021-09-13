import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {uploadImage} from './upload';
import {baseUrl} from '../../package.json';

const server = setupServer();

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('uploadImage', () => {
  const uploadParams = {
    url: 'this-does-not-exist',
    fields: {
      'key': 'tLW15ilCV4RBceRmDcF4be1CPPgRXG0-qFzZ71MjlL0',
      'x-amz-algorithm':'AWS4-HMAC-SHA256',
      'x-amz-credential':'dummy/20210820/eu-north-1/s3/aws4_request',
      'x-amz-date':'20210820T131552Z',
      'x-amz-security-token': 'dummy',
      'x-amz-signature':'dummy'
    },
  };

  it('uploads the given image', async () => {
    const dummyImage = new ArrayBuffer(100);
    const uploadUrl = 'http://localhost/fake-upload-url';
    const expectedKey = 'si_5A5JEr8PbAlvknkTDWx4YaDh-wYoa0dtG5MIMfs4';
    let wasApiReached = false;
    let wasUploadUrlReached = false;
    server.use(
      rest.get(`${baseUrl}/upload-url`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.json({
          ...uploadParams,
          url: uploadUrl,
          fields: {...uploadParams.fields, key: expectedKey},
        }));
      }),
      rest.post(uploadUrl, (req, res, ctx) => {
        wasUploadUrlReached = true;
        return res(ctx.status(204));
      }),
    );
    const key = await uploadImage(dummyImage);
    expect(key).toEqual(expectedKey);
    expect(wasApiReached).toBe(true);
    expect(wasUploadUrlReached).toBe(true);
  });

  it('throws an error if fetching the upload URL fails', async () => {
    const dummyImage = new ArrayBuffer(100);
    let wasApiReached = false;
    server.use(
      rest.get(`${baseUrl}/upload-url`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.status(500));
      }),
    );
    await expect(uploadImage(dummyImage)).rejects.toBeInstanceOf(Error);
    expect(wasApiReached).toBe(true);
  });

  it('throws an error if uploading the image fails', async () => {
    const dummyImage = new ArrayBuffer(100);
    const uploadUrl = 'http://localhost/fake-upload-url';
    const expectedKey = '6d6tg759lQags4K52n-48a_u6m9Weyrv0pT_HRewHQ8';
    let wasApiReached = false;
    let wasUploadUrlReached = false;
    server.use(
      rest.get(`${baseUrl}/upload-url`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.json({
          ...uploadParams,
          url: uploadUrl,
          fields: {...uploadParams.fields, key: expectedKey},
        }));
      }),
      rest.post(uploadUrl, (req, res, ctx) => {
        wasUploadUrlReached = true;
        return res(ctx.status(500));
      }),
    );
    await expect(uploadImage(dummyImage)).rejects.toBeInstanceOf(Error);
    expect(wasApiReached).toBe(true);
    expect(wasUploadUrlReached).toBe(true);
  });
});
