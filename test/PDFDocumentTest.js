
define([
    "assert",
    "wilton/fs",
    "wilton/misc",
    "wilton/PDFDocument"
], function(assert, fs, misc, PDFDocument) {
    "use strict";

    print("test: wilton/PDFDocument");

    var appdir = misc.wiltonConfig().applicationDirectory;
    var doc = new PDFDocument();
    var font = doc.loadFont(appdir + "../../modules/wilton_pdf/test/fonts/DejaVuSans.ttf");
    assert.equal(font, "DejaVuSans,Book");
    var fontBold = doc.loadFont(appdir + "../../modules/wilton_pdf/test/fonts/DejaVuSans-Bold.ttf");
    assert.equal(fontBold, "DejaVuSans-Bold,Bold");
    doc.addPage({
        format: "A4",
        orientation: "PORTRAIT"
    });
    doc.writeText({
        text: "привет pdf",
        fontName: font,
        fontSize: 14,
        x: 20,
        y: 500
    });
    doc.writeText({
        text: "colored",
        fontName: fontBold,
        fontSize: 14,
        x: 20,
        y: 450,
        color: {
            r: 0.3,
            g: 1,
            b: 0
        }
    });
    doc.writeTextInsideRectangle({
        text: "rectangled, \n Lorem ipsum dolor sit amet, \nconsectetur adipiscing elit, \nsed do eiusmod tempor incididunt ut labore \net dolore magna aliqua.",
        fontName: font,
        fontSize: 10,
        left: 100,
        top: 180,
        right: 500,
        bottom: 80,
        align: "CENTER"
    });
    doc.drawLine({
        beginX: 200,
        beginY: 400,
        endX: 250,
        endY: 350,
        color: {
            r: 0,
            g: 1,
            b: 0.3
        },
        lineWidth: 1.5
    });
    doc.drawLine({
        beginX: 250,
        beginY: 350,
        endX: 150,
        endY: 300,
        lineWidth: 3
    });
    doc.drawLine({
        beginX: 300,
        beginY: 300,
        endX: 250,
        endY: 250
    });
    doc.drawRectangle({
        x: 100,
        y: 100,
        width: 400,
        height: 80,
        color: {
            r: 0,
            g: 0.3,
            b: 1
        },
        lineWidth: 4.5
    });
    var pngDataInHex = "89504e470d0a1a0a0000000d49484452000000100000001008060000001ff3ff610000022249444154789ca491cd6b135d14c69f3b73673a5f49d33725a1bc50fa41abd954ec425d294215b41b575ac12222881fe01fa02b370a82883b8ba86041541091ba73535050c156a10822ae84d29834a99d34cddc3b997ba46913081109f5ac66717ebf39f77934fce3fc55c0b89d60a697de96d9e8de319e39736371e4e2ed9c911e99681b648693f0468f3f1cbaff940ee7e6e9507e8e861f3dabc6f69e7ac24c37d9b2dff4d774e648f7f8e4ddffceeee955691324c22da90e9e15aa30fd299b7f357d3e5cfa325367f4fa87b76f626af0f2a59bfd2747bb3ca703de9a4247be02b310c1911a2c6eb0ae5dffc7ac81dd272a79150b97bebedee0785de0ec1f9b6443294e65422442ace78a50cb3e42a9434f39d03b2d100099b235de377400739b5c43a054352c1403db5f0de0ca006cf917a8e8230c74b04a084a4aaca9084a11a091ac730d0174841b8948bf02915d86210434a60316208b3ec4ea3af41e0f5adcded815ad025393e45920bf0cb80e42d769ae9508c40d2011fff305449144975b4b1ca500d86aa05117d781b80deae00029d1d282fa99fd6e2607c7b4feb40b6bd3cb2205c618c035206603a20a3933fbb6f4f2c105aaacad3409a2c2d2b7e0c3ecb4aee2193ed03f8c84835aecd508b04dd0e28a28dd9bba5a7a3e758ed64bc5960b6acf904139987ff358fdc8e6ccbecc4196ea345016083f2e7c5eb973eda85878ff0244847686f7f4ee4c5eb9f52e76ecf47570c36c0bdacefc0e0000ffffbc11d785818cf98c0000000049454e44ae426082";
    doc.drawImage({
        imageHex: pngDataInHex,
        imageFormat: "PNG",
        x: 300,
        y: 450,
        width: 256,
        height: 256
    });
    // truncated header
    assert.throws(function() {
        doc.drawImage({
            imageHex: pngDataInHex.substr(0, 32),
            imageFormat: "PNG",
            x: 300,
            y: 450,
            width: 256,
            height: 256
        });
    });
    // truncated data
    assert.throws(function() {
        doc.drawImage({
            imageHex: pngDataInHex.substr(0, 256),
            imageFormat: "PNG",
            x: 300,
            y: 450,
            width: 256,
            height: 256
        });
    });
    // invalid data
    assert.throws(function() {
        doc.drawImage({
            imageHex: pngDataInHex.replace(/c22da90e/, "ffffffff"),
            imageFormat: "PNG",
            x: 300,
            y: 450,
            width: 256,
            height: 256
        });
    });
    // invalid format name
    assert.throws(function() {
        doc.drawImage({
            imageHex: pngDataInHex,
            imageFormat: "JPG",
            x: 300,
            y: 450,
            width: 256,
            height: 256
        });
    });
    doc.writeText({
        text: "PNG image:",
        fontName: font,
        fontSize: 12,
        x: 240,
        y: 540 
    });
    doc.addPage({
        width: 400,
        height: 400
    });
    doc.drawRectangle({
        x: 150,
        y: 150,
        width: 200,
        height: 50
    });
    var path = "test.pdf";
    doc.saveToFile(path);
    assert(fs.exists(path));
    var stat = fs.stat(path);
    assert(stat.isFile);
    assert(stat.size > 0);
    doc.destroy();

});
