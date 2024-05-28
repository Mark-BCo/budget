const User = require('../model/user')
const watchUserModel = require('../model/watch')

const watchUser = () => {

    console.log('set up change stream')

    const watchUser = User.watch()

    watchUser.on('change', async (change) => {
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
        } catch (err) {
            console.error('Error logging change to database:', err);
        }
    })
}

module.exports = watchUser
