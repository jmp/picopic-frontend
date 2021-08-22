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
  it('downloads an image by the given key', async () => {
    const expectedImage = new ArrayBuffer(100);
    const key = 'bb9481c1a72747b0b9da7a2a203b29e2';
    const downloadUrl = 'http://localhost/fake-download-url';
    let wasApiReached = false;
    let wasDownloadUrlReached = false;
    server.use(
      rest.get(`${baseUrl}/download-url/${key}`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.json({url: downloadUrl}));
      }),
      rest.get(downloadUrl, (req, res, ctx) => {
        wasDownloadUrlReached = true;
        return res(ctx.body(new Blob([expectedImage])));
      }),
    );
    const image = await downloadImage(key);
    expect(image).toEqual(expectedImage);
    expect(wasApiReached).toBe(true);
    expect(wasDownloadUrlReached).toBe(true);
  });

  it('throws an error if fetching the download URL fails', async () => {
    const key = '560c11b19f2541aa971b59ff4388eb5a';
    let wasApiReached = false;
    server.use(
      rest.get(`${baseUrl}/download-url/${key}`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.status(500));
      }),
    );
    await expect(downloadImage(key)).rejects.toBeInstanceOf(Error);
    expect(wasApiReached).toBe(true);
  });

  it('throws an error if downloading the image fails', async () => {
    const key = '560c11b19f2541aa971b59ff4388eb5a';
    const downloadUrl = 'http://localhost/fake-download-url';
    let wasApiReached = false;
    let wasDownloadUrlReached = false;
    server.use(
      rest.get(`${baseUrl}/download-url/${key}`, (req, res, ctx) => {
        wasApiReached = true;
        return res(ctx.json({url: downloadUrl}));
      }),
      rest.get(downloadUrl, (req, res, ctx) => {
        wasDownloadUrlReached = true;
        return res(ctx.status(500));
      }),
    );
    await expect(downloadImage(key)).rejects.toBeInstanceOf(Error);
    expect(wasApiReached).toBe(true);
    expect(wasDownloadUrlReached).toBe(true);
  });
});
