import { IconIco } from '@shockpkg/icon-encoder';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminPngquant, { Options as PngquantOptions } from 'imagemin-pngquant';
import { promises as fs } from 'fs';

export interface CreateIcoOptions {
  /**
   * Optional mask to apply to the icon.
   */
  shape?: 'circle';

  /**
   * Icon sizes to generate. Defaults to [16, 32], as recommended for favicons.
   * Size cannot exceed 256 (the ico format stores width & height as a single
   * byte each).
   */
  sizes?: number[];

  /**
   * Options passed to pngquant. Defaults to speed 1, strip metadata.
   * @see https://www.npmjs.com/package/imagemin-pngquant#options
   */
  pngquant?: PngquantOptions;
}

const DEFAULT_OPTIONS: CreateIcoOptions = {
  sizes: [16, 32],
  pngquant: {
    speed: 1,
    strip: true
  }
};

/**
 * Generates an ico from the given image and returns it as a Buffer.
 *
 * @param input The input image {@link https://sharp.pixelplumbing.com/api-constructor as accepted by sharp}.
 * @param options Options object.
 */
export async function createIco(input: string | Buffer, options?: CreateIcoOptions): Promise<Buffer>;
/**
 * Generates an ico from the given image and saves it to the specified path.
 *
 * @param input The input image {@link https://sharp.pixelplumbing.com/api-constructor as accepted by sharp}.
 * @param output The output file path.
 * @param options Options object.
 */
export async function createIco(input: string | Buffer, output: string, options?: CreateIcoOptions): Promise<void>;
export async function createIco(input: string | Buffer, outputOrOptions?: string | CreateIcoOptions, options?: CreateIcoOptions): Promise<Buffer | void> {
  // Handle overloads
  let output: string | undefined;
  if (typeof outputOrOptions == 'string') {
    output = outputOrOptions;
  } else {
    options = outputOrOptions;
  }

  // Apply default options
  options = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;

  // Check sizes
  if (options.sizes!.some(s => s < 1 || s > 256)) {
    throw new Error('Icon sizes must be between 1 and 256.');
  }

  // Create png for each icon size
  // For loop as sharp seems to hang sometimes when doing composites in parallel
  let inputPipeline = sharp(input);
  let pngs: Buffer[] = [];
  for (let size of options.sizes!) {
    let pipeline = options.sizes!.length > 1 ? inputPipeline.clone() : inputPipeline;

    // Resize
    pipeline = pipeline
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      });

    // Apply mask
    if (options.shape == 'circle') {
      let radius = size / 2;
      pipeline = pipeline
        .composite([{
          input: Buffer.from(`<svg><circle cx="${radius}" cy="${radius}" r="${radius}" /></svg>`),
          blend: 'dest-in'
        }]);
    }

    // Write png
    let png = await pipeline.png().toBuffer();

    // Optimize
    pngs.push(await imagemin.buffer(png, {
      plugins: [
        imageminPngquant(options.pngquant)
      ]
    }));
  }

  // Create ico
  let ico = new IconIco();
  for (let png of pngs) {
    ico.addFromPng(png, true);
  }

  // Save or return buffer
  if (output === undefined) {
    return ico.encode();
  } else {
    await fs.writeFile(output, ico.encode());
  }
}
