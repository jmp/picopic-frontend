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
      'key': '00000000000000000000000000000000',
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
    const expectedKey = '4bc24fffb27c4a34830959f7bb5024d9';
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
    const expectedKey = '37c562bc03614ba7948bba788c9fccd9';
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
