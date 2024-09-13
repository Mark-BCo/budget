const User = require('../model/user')
const watchUserModel = require('../model/watch')
const { logEvents } = require('../middleware/logger')

const reconnectDelay = 5000

const watchUser = () => {

    console.log('set up change stream')

    const watchUserStream = User.watch()

    watchUserStream.on('change', async (change) => {
        console.log('Change detected');

        const { documentKey, updateDescription, operationType, fullDocument } = change;
        let changeData = {};

        if (operationType === 'insert') {
            changeData = {
                operation: 'insert',
                documentId: documentKey._id,
                newDocument: fullDocument
            };
        } else if (operationType === 'update') {
            changeData = {
                operation: 'update',
                documentId: documentKey._id,
                updatedFields: updateDescription.updatedFields,
                removedFields: updateDescription.removedFields
            };
        } else if (operationType === 'delete') {
            changeData = {
                operation: 'delete',
                documentId: documentKey._id
            };
        } else if (operationType === 'replace') {
            changeData = {
                operation: 'replace',
                documentId: documentKey._id,
                newDocument: fullDocument
            };
        }

        try {
            await watchUserModel.create(changeData);
            console.log('Change logged to database');
            logEvents(`Change logged to database: ${JSON.stringify(changeData)}`, 'streamLog.log');
        } catch (err) {
            console.error('Error logging change to database:', err);
        }
    })

    watchUserStream.on('error', (err) => {
        console.error('Error in Change Stream:', err);

        setTimeout(() => {
            console.log('Reconnecting to change stream...')
            watchUser()
        }, reconnectDelay)
    })

}

// process.on('SIGINT', async () => {
//     console.log('Closing change stream and shutting down...');
//     if (watchUserStream) {
//         try {
//             await watchUserStream.close();
//             console.log('Change stream closed');
//         } catch (err) {
//             console.error('Error closing change stream:', err);
//         }
//     }
//     process.exit();
// });

// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled Promise Rejection:', err);
//     process.exit(1);
// });

module.exports = watchUser
