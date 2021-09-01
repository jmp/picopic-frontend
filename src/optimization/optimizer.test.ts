import {Optimizer} from './optimizer';

describe('Optimizer', () => {
  const downloadUrl = 'http://localhost/some-url';

  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => downloadUrl);
  });

  afterEach(() => {
    // @ts-ignore
    window.URL.createObjectURL.mockReset();
  });

  it('optimize resolves the promise on success', async () => {
    const imageKey = '15344c86946b45d0ad6d4ed78c9aafa7';
    const originalImage = new ArrayBuffer(256);
    const optimizedImage = new ArrayBuffer(128);
    const imageToOptimize = new File([originalImage], 'tmp.png');
    const uploadImage = async (imageData: ArrayBuffer): Promise<string> => {
      expect(imageData).toEqual(originalImage);
      return imageKey;
    }
    const downloadImage = async (key: string): Promise<ArrayBuffer> => {
      expect(key).toEqual(imageKey);
      return optimizedImage;
    };
    const optimizer = new Optimizer(uploadImage, downloadImage);
    const result = await optimizer.optimize(imageToOptimize);
    expect(result).toEqual({
      downloadUrl,
      originalSize: originalImage.byteLength,
      optimizedSize: optimizedImage.byteLength,
    });
  });

  it('optimize rejects the promise on error', async () => {
    const originalImage = new ArrayBuffer(256);
    const imageToOptimize = new File([originalImage], 'tmp.png');
    const uploadImage = () => { throw new Error('upload failed'); };
    const downloadImage = async () => new ArrayBuffer(128);
    const optimizer = new Optimizer(uploadImage, downloadImage);
    await expect(optimizer.optimize(imageToOptimize)).rejects.toBeInstanceOf(Error);
  });
});