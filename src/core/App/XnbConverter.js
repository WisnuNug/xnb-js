import BufferReader from "./BufferReader.js";
import BufferWriter from "./BufferWriter.js";

import Presser from "./Decompressor/LZXDecompressor.js";
import {decompressBlock as LZ4_decompressBlock, 
	compressBound as LZ4_compressBound, 
	compressSingleBlock as LZ4_compressBlock} from "./Decompressor/Lz4.js";

import StringReader from "./Readers/StringReader.js";
import TypeReader from "./Readers/TypeReader.js";
import ReaderResolver from './ReaderResolver.js';

import XnbError from "../Utils/XnbError.js";
import Debug from "../Utils/Debug.js";

import {XnbData} from "./XnbData.js";

// "constants" for this class
const HIDEF_MASK = 0x1;
const COMPRESSED_LZ4_MASK = 0x40;
const COMPRESSED_LZX_MASK = 0x80;
const XNB_COMPRESSED_PROLOGUE_SIZE = 14;

/**
 * XNB file class used to read and write XNB files
 * @class
 * @public
 */
class XnbConverter {

	/**
	 * Creates new instance of Xnb class
	 * @constructor
	 */
	constructor() {
		// target platform
		this.target = '';
		// format version
		this.formatVersion = 0;
		// HiDef flag
		this.hidef = false;
		// Compressed flag
		this.compressed = false;
		// compression type
		this.compressionType = 0;
		// the XNB buffer reader
		this.buffer = null;
		// the file size
		this.fileSize = 0;

		/**
		 * Array of readers that are used by the XNB file.
		 * @type {BaseReader[]}
		 */
		this.readers = [];

		/**
		 * Array of shared resources
		 * @type {Array}
		 */
		this.sharedResources = [];
	}

	/**
	 * Loads a file into the XNB class.
	 * @param {ArrayBuffer} XNB file's array buffer
	 */
	load(arrayBuffer) {

		// create a new instance of reader
		this.buffer = new BufferReader(arrayBuffer);

		
		// validate the XNB file header
		this._validateHeader();

		// we validated the file successfully
		console.info('XNB file validated successfully!');


		// read the file size
		this.fileSize = this.buffer.readUInt32();

		// verify the size
		if (this.buffer.size != this.fileSize)
			throw new XnbError('XNB file has been truncated!');

		// print out the file size
		Debug(`File size: ${this.fileSize} bytes.`);
		
		// if the file is compressed then we need to decompress it
		if (this.compressed) {
			// get the decompressed size
			const decompressedSize = this.buffer.readUInt32();
			Debug(`Uncompressed size: ${decompressedSize} bytes.`);

			// decompress LZX format
			if (this.compressionType == COMPRESSED_LZX_MASK) {
				// get the amount of data to compress
				const compressedTodo = this.fileSize - XNB_COMPRESSED_PROLOGUE_SIZE;
				// decompress the buffer based on the file size
				const decompressed = Presser.decompress(this.buffer, compressedTodo, decompressedSize);
				// copy the decompressed buffer into the file buffer
				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize);
				// reset the byte seek head to read content
				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			}
			// decompress LZ4 format
			
			else if (this.compressionType == COMPRESSED_LZ4_MASK) {
				// allocate Uint8 Array for LZ4 decode
				const trimmed = this.buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
				const trimmedArray = new Uint8Array(trimmed);

				// decode the trimmed buffer into decompressed buffer
				const decompressed = new Uint8Array(decompressedSize);
				LZ4_decompressBlock(trimmedArray, decompressed);
				// copy the decompressed buffer into our buffer
				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize);
				// reset the byte seek head to read content
				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			}
		}

		Debug(`Reading from byte position: ${this.buffer.bytePosition}`);

		
		// NOTE: assuming the buffer is now decompressed

		// get the 7-bit value for readers
		let count = this.buffer.read7BitNumber();
		// log how many readers there are
		Debug(`Readers: ${count}`);
		Debug( this.buffer.buffer );
		
		// create an instance of string reader
		const stringReader = new StringReader();

		// a local copy of readers for the export
		const readers = [];

		
		// loop over the number of readers we have
		for (let i = 0; i < count; i++) {
			// read the type
			const type = stringReader.read(this.buffer);
			// read the version
			const version = this.buffer.readInt32();
			// add local reader
			readers.push({ type, version });
		}
		Debug( readers.map( ({type})=>TypeReader.simplifyType(type) ) );

		// get the reader for this type
		this.readers = readers.map( ({type})=>TypeReader.getReaderFromRaw(type) );

		// get the 7-bit value for shared resources
		const shared = this.buffer.read7BitNumber();

		// log the shared resources count
		Debug(`Shared Resources: ${shared}`);

		// don't accept shared resources since SDV XNB files don't have any
		if (shared != 0)
			throw new XnbError(`Unexpected (${shared}) shared resources.`);
		
		// create content reader from the readers loaded
		const content = new ReaderResolver(this.readers);
		// read the content in
		const result = content.read(this.buffer);

		// we loaded the XNB file successfully
		console.log('Successfuly read XNB file!');

		// return the loaded XNB object
		return new XnbData({
			target: this.target,
			formatVersion: this.formatVersion,
			hidef: this.hidef,
			compressed: this.compressed
		}, 
		readers, result);
	}

	/**
	 * Converts JSON into XNB file structure
	 * @param {Object} The JSON to convert into a XNB file
	 */
	
	convert(json) {
		// the output buffer for this file
		const buffer = new BufferWriter();

		// create an instance of string reader
		const stringReader = new StringReader();

		// set the header information
		let {target, formatVersion, hidef, compressed} = json.header;

		this.target = target;
		this.formatVersion = formatVersion;
		this.hidef = hidef;

		const lz4Compression = (this.target == 'a' || this.target == 'i') || ((compressed & COMPRESSED_LZ4_MASK) != 0);
		this.compressed = lz4Compression ? true : false; // support android LZ4 compression

		// write the header into the buffer
		buffer.writeString("XNB");
		buffer.writeString(this.target);
		buffer.writeByte(this.formatVersion);
		// write the LZ4 mask for android compression only
		// todo:LZX compression. There are currently NO open source libraries implementing the LZX compression algorithm.
		buffer.writeByte(this.hidef | ((this.compressed && lz4Compression) ? COMPRESSED_LZ4_MASK : 0));

		// write temporary filesize
		buffer.writeUInt32(0);

		// write the decompression size temporarily if android
		if (lz4Compression)
			buffer.writeUInt32(0);

		Debug("Header data written successfully!");

		// write the amount of readers
		buffer.write7BitNumber(json.readers.length);

		// loop over the readers and load the types
		for (let reader of json.readers) {

			this.readers.push( TypeReader.getReaderFromRaw(reader.type) ); // get the reader of it
			stringReader.write(buffer, reader.type);
			buffer.writeUInt32(reader.version);
		}

		Debug("Reader data written successfully!");

		// write 0 shared resources
		buffer.write7BitNumber(0);

		// create reader resolver for content and write it
		const content = new ReaderResolver(this.readers);

		// write the content to the reader resolver
		content.write(buffer, json.content);

		Debug("Content data written successfully!");

		// trim excess space in the buffer 
		// NOTE: this buffer allocates default with 500 bytes
		buffer.trim();

		// LZ4 compression
		if (lz4Compression) {
			// allocate Uint8 Array for LZ4 encode
			const trimmed = buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
			const trimmedArray = new Uint8Array(trimmed);

			let compressedSize = LZ4_compressBound(trimmedArray.length);

			// create a buffer for the compressed data
			let compressed = new Uint8Array(compressedSize);

			// compress the data into the buffer
			compressedSize = LZ4_compressBlock(trimmedArray, compressed);
			compressed = compressed.slice(0, compressedSize);
			
			// write the file size & decompressed size into the buffer
			buffer.bytePosition = 6;
			buffer.writeUInt32(XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize);
			buffer.writeUInt32(trimmedArray.length);

			// write compressed data
			buffer.concat(compressed);
			
			// slice off the excess
			let returnBuffer = buffer.buffer.slice(0, XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize);

			// return the buffer
			return returnBuffer;
		}

		// write the file size into the buffer
		let fileSize = buffer.bytePosition;
		buffer.bytePosition = 6;
		buffer.writeUInt32(fileSize, 6);

		// return the buffer
		return buffer.buffer;
	}

	/**
	 * Ensures the XNB file header is valid.
	 * @private
	 * @method _validateHeader
	 */
	_validateHeader() {
		// ensure buffer isn't null
		if (this.buffer == null)
			throw new XnbError('Buffer is null');

		// get the magic from the beginning of the file
		const magic = this.buffer.readString(3);
		// check to see if the magic is correct
		if (magic != 'XNB')
			throw new XnbError(`Invalid file magic found, expecting "XNB", found "${magic}"`);

		// debug print that valid XNB magic was found
		Debug('Valid XNB magic found!');

		// load the target platform
		this.target = this.buffer.readString(1).toLowerCase();

		// read the target platform
		switch (this.target) {
			case 'w':
				Debug('Target platform: Microsoft Windows');
				break;
			case 'm':
				Debug('Target platform: Windows Phone 7');
				break;
			case 'x':
				Debug('Target platform: Xbox 360');
				break;
			case 'a':
				Debug('Target platform: Android');
				break;
			case 'i':
				Debug('Target platform: iOS');
				break;
			default:
				console.warn(`Invalid target platform "${this.target}" found.`);
				break;
		}

		// read the format version
		this.formatVersion = this.buffer.readByte();

		// read the XNB format version
		switch (this.formatVersion) {
			case 0x3:
				Debug('XNB Format Version: XNA Game Studio 3.0');
				break;
			case 0x4:
				Debug('XNB Format Version: XNA Game Studio 3.1');
				break;
			case 0x5:
				Debug('XNB Format Version: XNA Game Studio 4.0');
				break;
			default:
				console.warn(`XNB Format Version 0x${this.formatVersion.toString(16)} unknown.`);
				break;
		}

		// read the flag bits
		const flags = this.buffer.readByte(1);
		// get the HiDef flag
		this.hidef = (flags & HIDEF_MASK) != 0;
		// get the compressed flag
		this.compressed = (flags & COMPRESSED_LZX_MASK) || (flags & COMPRESSED_LZ4_MASK) != 0;
		// set the compression type
		// NOTE: probably a better way to do both lines but sticking with this for now
		this.compressionType = (flags & COMPRESSED_LZX_MASK) != 0 ? COMPRESSED_LZX_MASK : ((flags & COMPRESSED_LZ4_MASK) ? COMPRESSED_LZ4_MASK : 0);
		// debug content information
		Debug(`Content: ${(this.hidef ? 'HiDef' : 'Reach')}`);
		// log compressed state
		Debug(`Compressed: ${this.compressed}, ${this.compressionType == COMPRESSED_LZX_MASK ? 'LZX' : 'LZ4'}`);
	}

}

export default XnbConverter;