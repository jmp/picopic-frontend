import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {baseUrl} from './constants';
import {uploadImage} from './upload';

const server = setupServer();

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('uploadImage', () => {
  it('uploads the given image', async () => {
    const dummyImage = new ArrayBuffer(100);
    const uploadUrl = 'http://localhost/fake-upload-url';
    const expectedKey = '4bc24fffb27c4a34830959f7bb5024d9';
    server.use(
      rest.get(`${baseUrl}/upload-url`, (req, res, ctx) => {
        return res(ctx.json({
          url: uploadUrl,
          fields: {
              'key': expectedKey,
              'x-amz-algorithm':'AWS4-HMAC-SHA256',
              'x-amz-credential':'dummy/20210820/eu-north-1/s3/aws4_request',
              'x-amz-date':'20210820T131552Z',
              'x-amz-security-token': 'dummy',
              'x-amz-signature':'dummy'
          },
        }));
      }),
      rest.post(uploadUrl, (req, res, ctx) => {
        return res(ctx.status(204));
      }),
    );
    const key = await uploadImage(dummyImage);
    expect(key).toEqual(expectedKey);
  });
});
