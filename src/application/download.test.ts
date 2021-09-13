import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {downloadImage} from './download';
import {baseUrl} from '../../package.json';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('downloadImage', () => {
  it('downloads an image by the given key', async () => {
    const expectedImage = new ArrayBuffer(100);
    const key = 'jr8iNajlegFTZr4S3bYTBNkIMvR9gx_FXh8iglMG5N4';
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
    const key = 'hPcasvhpgGYp6q3TiBm7tm6ovmXkzYJYcCdka7DjKfE';
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
    const key = '3ooApcBWG4tNS-Ykt-S9tEX2nEGQgcrqtrJsvwuBpRk';
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
