
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
    doc.addPage({
        format: "A3",
        orientation: "LANDSCAPE"
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

    // todo: removeme
    return {
        main: function() {
        }
    };
});
