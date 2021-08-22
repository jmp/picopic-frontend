import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {baseUrl} from './constants';
import {uploadImage} from './upload';
import {downloadImage} from './download';

const server = setupServer();

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('downloadImage', () => {
  it('download an image by the given key', async () => {
    const expectedImage = new ArrayBuffer(100);
    const key = 'bb9481c1a72747b0-b9da7a2a203b29e2';
    const downloadUrl = 'http://localhost/fake-download-url';
    server.use(
      rest.get(`${baseUrl}/download-url/${key}`, (req, res, ctx) => {
        return res(ctx.json({url: downloadUrl}));
      }),
      rest.get(downloadUrl, (req, res, ctx) => {
        return res(ctx.body(new Blob([expectedImage])));
      }),
    );
    const image = await downloadImage(key);
    expect(image).toEqual(expectedImage);
  });
});
