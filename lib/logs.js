/**
 * A library for storing and rotating logs
 * 
 */

//Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const logs = {};

logs.baseDir = path.join(__dirname, '/../.logs');

//Append a string to file. Create the file if it does not exists
logs.append = function (file, str, callback) {
    //open the file for appending
    const logFile = path.join(logs.baseDir, `${file}.log`);

    fs.open(logFile, 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, `${str}\n`, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing file that was being appended');
                        }
                    })
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('Could not open file for appending');
        }
    });
};

logs.list = function (includeCompressedLogs, callback) {
    fs.readdir(logs.baseDir, (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFilenames = [];
            data.forEach(filename => {
                //Add the .log files
                if (filename.indexOf('.log') > -1) {
                    trimmedFilenames.push(filename.replace('.log', ''));
                }

                //Add on the .gz files
                if (filename.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFilenames.push(filename.replace('.gz.b64', ''));
                }
            });

            callback(false, trimmedFilenames);
        } else {
            callback(err, data);
        }
    });
}

//Compress the content of one .log file to .gz.b64 file within the same directory
logs.compress = function (logId, newFileId, callback) {
    const source = `${logId}.log`;
    const dest = `${newFileId}.gz.b64`;
    
    const sourceFile = path.join(logs.baseDir, source);
    const destFile = path.join(logs.baseDir, dest);

    //Read the source file
    fs.readFile(sourceFile, 'utf8', (err, inputStr) => {
        if (!err && inputStr) {
            //Compress the data using gzip
            zlib.gzip(inputStr, (err, buffer) => {
                if (!err && buffer) {
                    //Send the data to the destination file
                    fs.open(destFile, 'wx', (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            //Write to destination file
                            fs.writeFile(destFile, buffer.toString('base64'), (err) => {
                                if (!err) {
                                    fs.close(fileDescriptor, (err) => {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err)
                }
            });
        } else {
            callback(err);
        }
    });
};

//Decompress the content of a .gz.b64 into a string variable
logs.decompress = function (fileId, callback) {
    const file = path.join(logs.baseDir, `${fileId}.gz.b64`);

    fs.readFile(file, 'utf8', (err, str) => {
        if (!err && str) {
            //Decompress the dat
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outBuffer) => {
                if (!err && outBuffer) {
                    //Callback
                    const str = outBuffer.toString();
                    callback(false, str);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

//Truncate to a log file
logs.truncate = function (logId, callback) {
    const logFile = path.join(logs.baseDir, `${logId}.log`);

    fs.truncate(logFile, 0, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = logs;
