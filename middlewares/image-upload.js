
const AWS = require("aws-sdk");
const config = require('config');
const uuid = require("uuid");

AWS.config.update({ region: config.get('s3BucketRegion') });

const S3_BUCKET = config.get('s3BucketName');
const s3 = new AWS.S3({
  region: config.get('s3BucketRegion'),
  signatureVersion: "v4",
  //   useAccelerateEndpoint: true
});

const imageUpload = (folder)=>{
    return (req, res, next) => {
    let fileType = req.body.fileType;
    if (fileType != ".jpg" && fileType != ".png" && fileType != ".jpeg") {
        return res
        .status(403)
        .json({ success: false, message: "Image format invalid" });
    }

    fileType = fileType.substring(1, fileType.length);

    const fileName = folder+'/'+uuid.v4();   //creating the uid for file name yea
    

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName + "." + fileType,
        Expires: 60 * 60,
        ContentType: "image/" + fileType,
        ACL: "public-read",
    };

    s3.getSignedUrl("putObject", s3Params, (err, data) => {
        if (err) {
        console.log(err);
        return res.end();
        }
        const returnData = {
        success: true,
        message: "Url generated",
        uploadUrl: data,
        downloadUrl:
            `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}` + "." + fileType,
        };
        req.imageDetails = returnData;
        next();
    });
    };
};

module.exports = imageUpload;
