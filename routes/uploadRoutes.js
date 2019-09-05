const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
var v4 = require('aws-signature-v4');

const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    Bucket: 'mividaloca-bucket',
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;
        const params = {
            Bucket: 'mividaloca-bucket',
            Key: key,
            ContentType: 'image/jpeg',
        };

        s3.getSignedUrl('putObject', params, (err, url) =>
            res.send({ key, url }),
        );
    });

    app.get('/api/v4', requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;
        var url = v4.createPresignedS3URL(key, {
            key: keys.accessKeyId,
            secret: keys.secretAccessKey,
            bucket: 'mividaloca-bucket',
            region: 'eu-central-1', // using frankfurt which requires V4 at the moment
            expires: 3600, // need to upload within 1 hour
            method: 'PUT',
        });
        res.send({ key, url });
    });
};
