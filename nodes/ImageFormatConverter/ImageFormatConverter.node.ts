import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { Jimp } from 'jimp';

/**
 * Image Format Converter Node
 * Converts between various image formats with support for both base64 and file input/output
 * Supported formats: JPG, PNG, BMP, TIFF, GIF
 */
export class ImageFormatConverter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Image Format Converter',
		name: 'imageFormatConverter',
		icon: 'file:convert.svg',
		group: ['transform'],
		version: 1,
		description: 'Image Format Converter',
		defaults: {
			name: 'Image Format Converter',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Input File Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'Base64',
						value: 'base64',
					},
					{
						name: 'File',
						value: 'file',
					},
				],
				default: 'file',
				description: 'Whether the input is a base64 string or a file',
			},
			{
				displayName: 'Base64 Field',
				name: 'base64Field',
				type: 'string',
				default: 'data',
				description: 'The base64 string of the image',
				displayOptions: {
					show: {
						inputType: ['base64'],
					},
				},
			},
			{
				displayName: 'Output File Format',
				name: 'outputFileFormat',
				type: 'options',
				options: [
					{
						name: 'BMP',
						value: 'image/bmp',
					},
					{
						name: 'GIF',
						value: 'image/gif',
					},
					{
						name: 'JPG',
						value: 'image/jpeg',
					},
					{
						name: 'MS BMP',
						value: 'image/x-ms-bmp',
					},
					{
						name: 'PNG',
						value: 'image/png',
					},
					{
						name: 'TIFF',
						value: 'image/tiff',
					},
				],
				default: 'image/jpeg',
				description: 'Whether to output as base64 string or file',
			},
			{
				displayName: 'Output Type',
				name: 'outputType',
				type: 'options',
				options: [
					{
						name: 'Base64',
						value: 'base64',
					},
					{
						name: 'File',
						value: 'file',
					},
				],
				default: 'file',
				description: 'Whether to output as base64 string or file',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				default: 80,
				description: 'JPEG quality (0-100)',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
			},
		],
	};

	/**
	 * Executes the image conversion process
	 * @param this IExecuteFunctions instance
	 * @returns Processed data array
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			 // Get input type (base64 or file)
			const inputType = this.getNodeParameter('inputType', i) as string;
			let base64Data = '';
			let originalFilename = '';

			// Process input data
			if (inputType === 'base64') {
				// Get base64 data from JSON
				const base64Field = this.getNodeParameter('base64Field', i) as string;
				base64Data = items[i].json[base64Field] as string;
			} else {
				 // Get file from binary data
				const item = items[i].binary;
				if (item === undefined) {
					throw new NodeApiError(this.getNode(), { message: 'No binary data exists on item!' });
				} else if (item.data === undefined) {
					throw new NodeApiError(this.getNode(), { message: 'No binary data exists on item!' });
				} else if (item.data.data === undefined) {
					throw new NodeApiError(this.getNode(), { message: 'No binary data exists on item!' });
				}
				if (item.data.fileType !== 'image') {
					throw new NodeApiError(this.getNode(), { message: 'No image data exists on item!' });
				}
				originalFilename = item.data.fileName || '';
				base64Data = item.data.data
			}

			try {
				 // Read and process image using Jimp
				const image = await Jimp.read(Buffer.from(base64Data, 'base64'));
				const outputFileFormat = this.getNodeParameter('outputFileFormat', i) as "image/jpeg" | "image/bmp" | "image/tiff" | "image/x-ms-bmp" | "image/gif" | "image/png";
				const outputType = this.getNodeParameter('outputType', i) as string;

				// Process image according to output format
				let imageBuffer;
				if (outputFileFormat === 'image/jpeg') {
					const quality = this.getNodeParameter('quality', i) as number;
					imageBuffer = await image.getBuffer(outputFileFormat, { quality: quality });
				} else {
					imageBuffer = await image.getBuffer(outputFileFormat);
				}

				// Create output data structure
				const jpgBase64 = imageBuffer.toString('base64');
				const newItem: INodeExecutionData = {
					json: {},
					binary: {}
				}

				// Set return data format based on output type
				if (outputType === 'base64') {
					newItem.json['data'] = jpgBase64;
				} else {
					// Handle file extension and create binary data
					let extension = outputFileFormat.split('/')[1];
					if (outputFileFormat === 'image/x-ms-bmp') {
						extension = 'bmp';
					}
					let fileName = originalFilename.split('.').slice(0, -1).join('.')
					if (originalFilename === '') {
						originalFilename = 'image.' + extension;
					}
					newItem.binary = {
						data: {
							fileName: fileName + extension,
							data: jpgBase64,
							fileType: 'image',
							fileSize: Math.round(imageBuffer.length / 1024 * 10) / 10 + ' kB',
							fileExtension: extension,
							mimeType: outputFileFormat,
						},
					}
				}
				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
