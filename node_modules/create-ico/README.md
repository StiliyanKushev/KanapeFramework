# create-ico

Creates an ico file from a single input image, using [sharp](https://sharp.pixelplumbing.com/) to resize the image to specified icon sizes (and apply an optional circular mask), [pngquant](https://pngquant.org/) to optimize the pngs, and [icon-encoder](https://github.com/shockpkg/icon-encoder) to assemble the ico (the older [to-ico](https://www.npmjs.com/package/to-ico) chokes on optimized pngs).

Especially useful for favicons, as pngquant keeps the ico file as small as possible, and the optional mask makes it possible to generate a round favicon from the same square image used for [maskable](https://web.dev/maskable-icon/) home screen icons.

## Install

`npm install create-ico`

## Usage

`createIco(input: string | Buffer, options?: CreateIcoOptions): Promise<Buffer>`  
`createIco(input: string | Buffer, output: string, options?: CreateIcoOptions): Promise<void>`

- `input` The input image [as accepted by sharp](https://sharp.pixelplumbing.com/api-constructor).
- `output` The output file path. _(Optional)_
- `options` _(Optional)_
  - `shape: 'circle'` Optional mask to apply to the icon. _(Optional)_
  - `sizes: number[]` Icon sizes to generate. Defaults to [16, 32], as recommended for favicons. Size cannot exceed 256 (the ico format stores width & height as a single byte each). _(Optional)_
  - `pngquant` Options passed to pngquant. Defaults to speed 1, strip metadata. [See docs here.](https://www.npmjs.com/package/imagemin-pngquant#options) _(Optional)_

```js
import { createIco } from 'create-ico';

await createIco('image.png', 'output.ico', { shape: 'circle' });

// or
let ico = await createIco('image.png', { sizes: [16, 32, 64, 256] });
fs.writeFileSync('output.ico', ico);
```
