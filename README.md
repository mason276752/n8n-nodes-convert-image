![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-convert-image

Custom n8n node for converting images to different formats (JPG, PNG, BMP, TIFF, GIF).  
Handles both base64 and file inputs, outputs base64 or file data, and allows setting image quality.

## Features

- Convert images between common formats  
- Input as file or base64  
- Output as file or base64  
- Adjustable quality for JPG output  

## Prerequisites

- n8n (version 1.0.0 or later)
- Node.js 16 or newer

## Installation

```bash
npm install n8n-nodes-convert-image
```

## Usage

1. Provide the input file or base64 data.
2. Select the target format and output type.
3. For JPEG, define the desired quality (0-100).
4. The node returns the converted image in the chosen format.

## Example

1. Add the “Image Format Converter” node to your workflow.
2. Pass your image as base64 or file data.
3. Set the output format to “PNG”, for example.
4. Define output as “file” or “base64”.
5. The result will be a converted image in the desired format.

## License

[MIT](LICENSE.md)
