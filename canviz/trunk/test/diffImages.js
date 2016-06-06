var Canvas = require('canvas');
var fs = require('fs');
var Image = Canvas.Image;

function loadImage(file, callback) {
  fs.readFile(file, function (err, contents) {
    if (err) return callback(err);
    var image = new Image();
    image.src = contents;
    callback(null, image);
  });
}

function getImageData(image, width, height) {
  var canvas = new Canvas(image.width, image.height),
    ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);
  return ctx.getImageData(0, 0, width, height);
}

function diffImages(inImage1File, inImage2File, outImageFile, callback) {
  var inImage1, inImage2, tasks = 2;

  loadImage(inImage1File, function (err, image) {
    inImage1 = image;
    compare(err);
  });

  loadImage(inImage2File, function (err, image) {
    inImage2 = image;
    compare(err);
  });

  function compare(err) {
    if (err) return callback(err);
    if (--tasks) return;

    var inImage1Width = inImage1.width,
      inImage1Height = inImage1.height,
      inImage2Width = inImage2.width,
      inImage2Height = inImage2.height,
      minWidth = Math.min(inImage1Width, inImage2Width),
      minHeight = Math.min(inImage1Height, inImage2Height),
      maxWidth = Math.max(inImage1Width, inImage2Width),
      maxHeight = Math.max(inImage1Height, inImage2Height),
      inImage1Data = getImageData(inImage1, minWidth, minHeight),
      inImage2Data = getImageData(inImage2, minWidth, minHeight),
      inImage1Pixels = inImage1Data.data,
      inImage2Pixels = inImage2Data.data,
      canvas = new Canvas(maxWidth, maxHeight),
      ctx = canvas.getContext('2d'),
      inImage1Pointer = 0,
      inImage2Pointer = 0,
      outImagePointer = 0,
      total = 255 * 4 * maxWidth * maxHeight,
      correct = 255 * 4 * minWidth * minHeight;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, maxWidth, maxHeight);
    var outImageData = ctx.getImageData(0, 0, minWidth, minHeight),
      outImagePixels = outImageData.data;

    for (var x = 0; x < minWidth; ++x) {
      for (var y = 0; y < minHeight; ++y) {
        for (var i = 3, rgbaDifference = 0; i >= 0; --i) {
          var difference = Math.abs(inImage1Pixels[inImage1Pointer++] - inImage2Pixels[inImage2Pointer++]);
          rgbaDifference += difference;
          outImagePixels[outImagePointer++] = i ? 255 - difference : Math.min(rgbaDifference, 255);
        }
        correct -= rgbaDifference;
      }
    }

    ctx.putImageData(outImageData, 0, 0);

    var outfile = fs.createWriteStream(outImageFile);
    outfile.on('open', function () {
      var stream = canvas.pngStream();
      stream.on('data', function (chunk) {
        outfile.write(chunk);
      });
      stream.on('end', function () {
        outfile.end(function () {
          callback(null, {
            inImage1: {
              width: inImage1Width,
              height: inImage1Height
            },
            inImage2: {
              width: inImage2Width,
              height: inImage2Height
            },
            outImage: {
              width: maxWidth,
              height: maxHeight
            },
            similarity: correct / total
          });
        });
      });
    });
  }
}

module.exports = diffImages;
