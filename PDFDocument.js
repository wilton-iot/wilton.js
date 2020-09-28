/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @namespace PDFDocument
 * 
 * __wilton/PDFDocument__ \n
 * Generate PDF documents.
 * 
 * This module allows to generate PDF documents.
 * 
 * Text, colors, lines and rectangles are supported.
 * 
 * TrueType font is required for PDF generation, it is read from a specified TTF file.
 * 
 * After use, PDF document instance may be destroyed manually using `destroy()`
 * or it will be destroyed during the shutdown.
 * 
 * [libharu](https://github.com/libharu/libharu) is used for PDF generation,
 * refer to its doc for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
 * 
 * Usage example:
 * 
 * @code
 * 
 * // create document
 * var doc = new PDFDocument();
 * 
 * // load font, font name is returned to be used for subsequent text operations
 * var someFont = doc.loadFont("path/to/someFont.ttf");
 * 
 * // add first page, more may be added after it
 * doc.addPage({
 *     format: "A4",
 *     orientation: "PORTRAIT"
 * });
 * 
 * // write text
 * doc.writeText({
 *     text: "hello",
 *     fontName: someFont,
 *     fontSize: 14,
 *     x: 20,
 *     y: 500
 * });
 * 
 * // draw lines or rectangles
 * doc.drawLine({
 *     beginX: 250,
 *     beginY: 350,
 *     endX: 150,
 *     endY: 300,
 *     lineWidth: 3
 * });
 * 
 * // write PDF to file
 * doc.saveToFile("test.pdf");
 * 
 * // free allocated memory
 * doc.destroy();
 * 
 * @endcode
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_pdf"
    });

    /**
     * @function PDFDocument
     * 
     * Create `PDFDocument` instance.
     * 
     * Creates `PDFDocument` instance, at least one page must be added
     * to created document before writing content to it.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `PDFDocument` instance
     */
    function PDFDocument(callback) {
        try {
            var handleJson = wiltoncall("pdf_create_document");
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.pdfDocumentHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    };

    PDFDocument.prototype = {
        /**
         * @function loadFont
         * 
         * Load TrueType font from the specified TTF file.
         * 
         * Loads TrueType font from the specified TTF file.
         * Loaded font will be added to the current document.
         * 
         * Multiple fonts can be loaded for the single document
         * and used later for the text operations.
         * 
         * Returns the name of the loaded font.
         * 
         * @param ttfPath `String` path to TTF file
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` loaded font name
         */
        loadFont: function(ttfPath, callback) {
            try {
                var json = wiltoncall("pdf_load_font", {
                    pdfDocumentHandle: this.handle,
                    ttfPath: ttfPath
                });
                var obj = JSON.parse(json);
                var res = obj.fontName;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function addPage
         * 
         * Append page to the document.
         * 
         * Appends new page to the document and moves internal "write cursor"
         * to this page. All subsequent content-related operation will be
         * done to this page (until additional page will be appended).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __format__ `String|Undefined` Paper format, supported values: `A3`, `A4`, `A5`, `B4`, `B5`;
         *               either both `format` and `orientation`, or both `width` and `height` must be specified.
         *  - __orientation__ `String|Undefined` Paper orientation, supported values: `PORTRAIT`, `LANDSCAPE`
         *  - __width__ `Number|Undefined` Page width.
         *  - __height__ `Number|Undefined` Page height.
         */
        addPage: function(options, callback) {
            return this._callWithOpts("pdf_add_page", options, callback);
        },

        /**
         * @function writeText
         * 
         * Write text to document.
         * 
         * Writes specified text to the current (last added) page of the document
         * at the specified coordinates.
         * 
         * Text is processed using `UTF-8` encoding.
         * 
         * See `libharu` documentation for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __text__ `String` Text contents to write
         *  - __fontName__ `String` Name of the font to use for the specified text,
         *                 font must already loaded for this document,
         *                 name should be obtained from `loadFont()`
         *  - __fontSize__ `Number` Font size (in `pt`) to use for the specified text
         *  - __x__ `Number` `x` coordinate of the texts beginning
         *  - __y__ `Number` `y` coordinate of the texts beginning
         *  - __color__ `Object|Undefined` Text color in RGB format, default value: `black`
         *    - __r__ `Number` Red element as `float`, must be in `[0, 1]`
         *    - __g__ `Number` Green element as `float`, must be in `[0, 1]`
         *    - __b__ `Number` Blue element as `float`, must be in `[0, 1]`
         */
        writeText: function(options, callback) {
            return this._callWithOpts("pdf_write_text", options, callback);
        },

        /**
         * @function writeTextInsideRectangle
         * 
         * Write text to document inside rectangle.
         * 
         * Writes specified text to the current (last added) page of the document
         * placing it inside the specified rectangle. Text lines that do not fit inside
         * the rectangle won't be dislayed.
         * 
         * Text is processed using `UTF-8` encoding.
         * 
         * See `libharu` documentation for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __text__ `String` Text contents to write
         *  - __fontName__ `String` Name of the font to use for the specified text,
         *                 font must already loaded for this document,
         *                 name should be obtained from `loadFont()`
         *  - __fontSize__ `Number` Font size (in `pt`) to use for the specified text
         *  - __left__ `Number` `left` coordinate of the rectangle
         *  - __top__ `Number` `top` coordinate of the rectangle
         *  - __right__ `Number` `right` coordinate of the rectangle
         *  - __bottom__ `Number` `bottom` coordinate of the rectangle
         *  - __align__ `String` Text alignment inside the rectangle,
         *              supported values: `LEFT`, `RIGHT`, `CENTER`, `JUSTIFY`
         *  - __color__ `Object|Undefined` Text color in RGB format, default value: `black`
         *    - __r__ `Number` Red element as `float`, must be in `[0, 1]`
         *    - __g__ `Number` Green element as `float`, must be in `[0, 1]`
         *    - __b__ `Number` Blue element as `float`, must be in `[0, 1]`
         */
        writeTextInsideRectangle: function(options, callback) {
            return this._callWithOpts("pdf_write_text_inside_rectangle", options, callback);
        },

        /**
         * @function drawLine
         * 
         * Draw straight line.
         * 
         * Draws the straigth line with the specified `lineWidth` and `color`
         * at the current (last added) page of the document.
         * 
         * See `libharu` documentation for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __beginX__ `Number` `x` coordinate of the beginning of the line
         *  - __beginY__ `Number` `y` coordinate of the beginning of the line
         *  - __endX__ `Number` `x` coordinate of the end of the line
         *  - __endY__ `Number` `y` coordinate of the end of the line
         *  - __lineWidth__ `Number|Undefined` Line width in `pt`, default value: `1`
         *  - __color__ `Object|Undefined` Line color in RGB format, default value: `black`
         *    - __r__ `Number` Red element as `float`, must be in `[0, 1]`
         *    - __g__ `Number` Green element as `float`, must be in `[0, 1]`
         *    - __b__ `Number` Blue element as `float`, must be in `[0, 1]`
         */
        drawLine: function(options, callback) {
            return this._callWithOpts("pdf_draw_line", options, callback);
        },

        /**
         * @function drawRectangle
         * 
         * Draw rectangle.
         * 
         * Draws the rectangle with the specified `lineWidth` and `color`
         * at the current (last added) page of the document.
         * 
         * See `libharu` documentation for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __x__ `Number` `x` coordinate of the lower-left corner of the rectangle
         *  - __y__ `Number` `y` coordinate of the lower-left corner of the rectangle
         *  - __width__ `Number` Width of the rectangle in `pt`
         *  - __height__ `Number` Height of the rectangle in `pt`
         *  - __lineWidth__ `Number|Undefined` Line (rectangle border) width in `pt`, default value: `1`
         *  - __color__ `Object|Undefined` Line (rectangle border) color in RGB format, default value: `black`
         *    - __r__ `Number` Red element as `float`, must be in `[0, 1]`
         *    - __g__ `Number` Green element as `float`, must be in `[0, 1]`
         *    - __b__ `Number` Blue element as `float`, must be in `[0, 1]`
         */
        drawRectangle: function(options, callback) {
            return this._callWithOpts("pdf_draw_rectangle", options, callback);
        },

        /**
         * @function drawImage
         * 
         * Draw image.
         * 
         * Draws the specified image scaling it to the specified `width` and `higth`
         * at the current (last added) page of the document.
         * 
         * See `libharu` documentation for the information about the [coordinate system](https://github.com/libharu/libharu/wiki/Graphics#coordinate-system).
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __imageHex__ `String` image data in hexadecimal
         *  - __imageFormat__ `String` file format of the specified image data,
         *                    supported formats: `PNG`, `JPEG`
         *  - __x__ `Number` `x` coordinate of the lower-left corner of the rectangle
         *  - __y__ `Number` `y` coordinate of the lower-left corner of the rectangle
         *  - __width__ `Number` Width of the rectangle in `pt`
         *  - __height__ `Number` Height of the rectangle in `pt`
         */
        drawImage: function(options, callback) {
            return this._callWithOpts("pdf_draw_image", options, callback);
        },

        /**
         * @function saveToFile
         * 
         * Write this document contents into PDF file.
         * 
         * Writes this document contents into PDF file on the specified path.
         * 
         * @param path `String` File system path for the PDF file to write
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        saveToFile: function(path, callback) {
            try {
                wiltoncall("pdf_save_to_file", {
                    pdfDocumentHandle: this.handle,
                    path: path
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function destroy
         * 
         * Release memory allocated for this document.
         * 
         * Releases memory allocated for this document.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        destroy: function(callback) {
            try {
                wiltoncall("pdf_destroy_document", {
                    pdfDocumentHandle: this.handle
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        _callWithOpts: function(name, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                opts.pdfDocumentHandle = this.handle;
                var res = wiltoncall(name, opts);
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }
    };

    return PDFDocument;
});
