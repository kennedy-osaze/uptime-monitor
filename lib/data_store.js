/**
 * Library for storing and editing data
 */

//Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//Container for the module (to be exported)
const dataStore = {};

//Define base directory of data store
dataStore.baseDir = path.join(__dirname + '/../.data');

//Write data to a file
dataStore.create = (dir, file, data, callback) => {
    //Define the file to create
    const storeFile = path.join(dataStore.baseDir, dir, `${file}.json`);

    //Open the file for writing
    fs.open(storeFile, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to string
            const stringData = JSON.stringify(data);

            //Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exists');   
        }
    });
};

//Read data from a file
dataStore.read = (dir, file, callback) => {
    const storeFile = path.join(dataStore.baseDir, dir, `${file}.json`);

    fs.readFile(storeFile, 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

//Update data already in a file
dataStore.update = (dir, file, data, callback) => {
    const storeFile = path.join(dataStore.baseDir, dir, `${file}.json`);

    //Open the file for writing
    fs.open(storeFile, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //Convert the data to string
            var stringData = JSON.stringify(data);

            //Truncate the file
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    //Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            })
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open the file for updating, it may not exists yet');
        }
    });
};

//Delete a file
dataStore.delete = (dir, file, callback) => {
    const storeFile = path.join(dataStore.baseDir, dir, `${file}.json`);

    //Unlink the file
    fs.unlink(storeFile, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting the file');
        }
    });
};

//List all the items in a directory
dataStore.list = (dir, callback) => {
    const storeDir = path.join(dataStore.baseDir, dir);

    fs.readdir(storeDir, (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFilenames = [];
            data.forEach(filename => {
                trimmedFilenames.push(filename.replace('.json', ''));
            });

            callback(false, trimmedFilenames);
        } else {
            callback(err, data);
        }
    });
}

//Export the module
module.exports = dataStore;
